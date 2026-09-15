"""Verify .sd code examples in content/docs against the real Sindlish interpreter.

Runs every ```sd fenced code block through the bundled interpreter
(public/interpreter/ -- the same bundle the in-browser Run button loads) and
checks, per example tier:

* run clean: the block must execute without a Sindlish error, and
* expected output: when an output block (```txt filename="Output") directly
  follows the code block, or the code contains a `# Prints:` one-liner, the
  captured output (stdout + stderr, ANSI stripped, trimmed) must match exactly.

Blocks flagged ``illustrative`` (fence meta word) or preceded by a
``<!-- run:skip -->`` comment are skipped but reported.

Usage:
    python scripts/docs-checks/example-runner/run_examples.py [--dir content/docs]

Exit code 0 when every runnable example passes; 1 otherwise.
"""

import argparse
import contextlib
import io
import multiprocessing as mp
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(REPO_ROOT / "public"))

from interpreter import Interpreter, SindhiBaseError  # noqa: E402

RUNNABLE_LANGS = {"sd", "sindlish"}
OUTPUT_LABELS = {"output", "terminal", "console"}
ANSI_RE = re.compile(r"\x1b\[[0-9;]*m")
PRINTS_RE = re.compile(r"^[^\S\n]*#\s*[Pp]rints?:\s*(.*?)\s*$")
TIME_OUT_SECONDS = 10

FENCE_OPEN = re.compile(r"^```([^\n]*)$")
FENCE_CLOSE = re.compile(r"^```\s*$")

SKIP_COMMENT = "<!-- run:skip -->"


def strip_ansi(text):
    return ANSI_RE.sub("", text)


class Example:
    def __init__(self, path, line, meta, code, expected=None):
        path = Path(path)
        try:
            self.path = str(path.resolve().relative_to(REPO_ROOT))
        except ValueError:
            self.path = str(path)
        self.line = line
        self.meta = meta
        self.code = code
        self.expected = expected
        self.status = "skip"
        self.detail = ""


def is_illustrative(meta):
    return "illustrative" in meta.split()


def parse_string_meta(meta):
    match = re.search(r'filename="([^"]*)"', meta)
    return match.group(1).strip() if match else None


def preceded_by_skip_comment(lines, open_line):
    """True if SKIP_COMMENT appears on the line(s) immediately above the fence."""
    j = open_line - 1
    while j >= 0 and not lines[j].strip():
        j -= 1
    return j >= 0 and SKIP_COMMENT in lines[j]


def extract_examples(path, text):
    """Yield Example objects from a markdown file's text."""
    lines = text.splitlines()
    i = 0
    n = len(lines)
    while i < n:
        line = lines[i]
        m = FENCE_OPEN.match(line)
        if not m:
            i += 1
            continue
        meta = m.group(1).strip()
        lang = meta.split()[0] if meta else ""
        if lang not in RUNNABLE_LANGS:
            i += 1
            continue
        if preceded_by_skip_comment(lines, i):
            meta += " illustrative"

        open_line = i
        code_lines = []
        i += 1
        while i < n and not FENCE_CLOSE.match(lines[i]):
            code_lines.append(lines[i])
            i += 1
        if i >= n:
            break
        i += 1  # consume closing fence

        code = "\n".join(code_lines)
        expected = None

        # Look for an Output block directly after the code (blank lines allowed).
        j = i
        while j < n and not lines[j].strip():
            j += 1
        if j < n:
            out = FENCE_OPEN.match(lines[j])
            if out:
                filename = parse_string_meta(out.group(1)) or ""
                if filename.lower() in OUTPUT_LABELS:
                    expected_lines = []
                    k = j + 1
                    while k < n and not FENCE_CLOSE.match(lines[k]):
                        expected_lines.append(lines[k])
                        k += 1
                    expected = "\n".join(expected_lines)
                    i = k + 1  # skip past the output block

        if expected is None:
            prints_match = PRINTS_RE.search(code)
            if prints_match:
                expected = prints_match.group(1)

        yield Example(path, open_line + 1, meta, code, expected)


def _run_worker(code, queue):
    """Run one example in a child process and push (raised, output) to the queue."""
    out = io.StringIO()
    err = io.StringIO()
    raised = None
    interp = Interpreter()
    original_stdin = sys.stdin
    try:
        sys.stdin = io.StringIO("\n")
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            interp.run_source(code, is_repl=True)
    except SindhiBaseError as e:
        raised = type(e).__name__
    except Exception as e:
        raised = type(e).__name__
    finally:
        sys.stdin = original_stdin
    combined = strip_ansi(out.getvalue()) + strip_ansi(err.getvalue())
    queue.put((raised, combined.strip()))


def run_example(example):
    """Execute one example in a subprocess with a timeout.

    Returns (raised_error_name_or_None, output) or ("TIMEOUT", "").
    """
    ctx = mp.get_context("spawn")
    queue = ctx.Queue()
    process = ctx.Process(target=_run_worker, args=(example.code, queue))
    process.start()
    process.join(TIME_OUT_SECONDS)
    if process.is_alive():
        process.terminate()
        process.join()
        return "TIMEOUT", ""
    raised, output = queue.get()
    return raised, output


def check_example(example):
    if is_illustrative(example.meta):
        example.status = "skip"
        example.detail = "marked illustrative"
        return

    raised, output = run_example(example)
    if raised == "TIMEOUT":
        example.status = "fail"
        example.detail = "timed out (>10s) -- infinite loop or runaway computation; mark it illustrative"
    elif example.expected is not None:
        if output == example.expected:
            example.status = "ok"
            example.detail = f"output matches ({len(example.expected)} chars)"
        else:
            example.status = "fail"
            example.detail = (
                f"output mismatch\n  expected: {example.expected!r}\n  actual:   {output!r}"
            )
    elif raised is not None:
        example.status = "fail"
        example.detail = f"raised {raised}"
    else:
        example.status = "ok"
        example.detail = "ran clean" + (f"; output {output!r}" if output else "")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dir",
        default=str(REPO_ROOT / "content" / "docs"),
        help="docs directory to scan (default: content/docs)",
    )
    args = parser.parse_args(argv)

    if not Path(args.dir).is_dir():
        print(f"error: not a directory: {args.dir}", file=sys.stderr)
        return 2

    results = []
    for path in sorted(Path(args.dir).rglob("*.md")):
        text = path.read_text(encoding="utf-8")
        for example in extract_examples(path, text):
            check_example(example)
            results.append(example)

    ok = [r for r in results if r.status == "ok"]
    skipped = [r for r in results if r.status == "skip"]
    failed = [r for r in results if r.status == "fail"]

    print(
        f"\nSindlish .sd examples: {len(ok)} passed, {len(skipped)} skipped, {len(failed)} failed\n"
    )
    for r in failed:
        print(f"  FAIL {r.path}:{r.line}\n       {r.detail}")
    for r in skipped:
        print(f"  SKIP {r.path}:{r.line}: {r.detail}")

    if failed:
        print(f"\n{len(failed)} example(s) failed", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())