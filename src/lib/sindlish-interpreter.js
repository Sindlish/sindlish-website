/**
 * Sindlish Interpreter Singleton
 * Manages Pyodide instance and Sindlish interpreter files
 */
const INTERPRETER_FILES = [
  { path: '/home/pyodide/interpreter/__init__.py', url: '/interpreter/__init__.py' },
  { path: '/home/pyodide/interpreter/errors.py', url: '/interpreter/errors.py' },
  { path: '/home/pyodide/interpreter/repl.py', url: '/interpreter/repl.py' },
  {
    path: '/home/pyodide/interpreter/frontend/__init__.py',
    url: '/interpreter/frontend/__init__.py',
  },
  { path: '/home/pyodide/interpreter/frontend/lexer.py', url: '/interpreter/frontend/lexer.py' },
  { path: '/home/pyodide/interpreter/frontend/parser.py', url: '/interpreter/frontend/parser.py' },
  { path: '/home/pyodide/interpreter/frontend/tokens.py', url: '/interpreter/frontend/tokens.py' },
  {
    path: '/home/pyodide/interpreter/frontend/ast_nodes.py',
    url: '/interpreter/frontend/ast_nodes.py',
  },
  {
    path: '/home/pyodide/interpreter/frontend/keywords.py',
    url: '/interpreter/frontend/keywords.py',
  },
  {
    path: '/home/pyodide/interpreter/analysis/__init__.py',
    url: '/interpreter/analysis/__init__.py',
  },
  {
    path: '/home/pyodide/interpreter/analysis/resolver.py',
    url: '/interpreter/analysis/resolver.py',
  },
  {
    path: '/home/pyodide/interpreter/backend/__init__.py',
    url: '/interpreter/backend/__init__.py',
  },
  {
    path: '/home/pyodide/interpreter/backend/compiler.py',
    url: '/interpreter/backend/compiler.py',
  },
  { path: '/home/pyodide/interpreter/backend/vm.py', url: '/interpreter/backend/vm.py' },
  { path: '/home/pyodide/interpreter/backend/frame.py', url: '/interpreter/backend/frame.py' },
  { path: '/home/pyodide/interpreter/backend/hints.py', url: '/interpreter/backend/hints.py' },
  { path: '/home/pyodide/interpreter/backend/markers.py', url: '/interpreter/backend/markers.py' },
  { path: '/home/pyodide/interpreter/backend/opcodes.py', url: '/interpreter/backend/opcodes.py' },
  {
    path: '/home/pyodide/interpreter/objects/__init__.py',
    url: '/interpreter/objects/__init__.py',
  },
  { path: '/home/pyodide/interpreter/objects/base.py', url: '/interpreter/objects/base.py' },
  { path: '/home/pyodide/interpreter/objects/core.py', url: '/interpreter/objects/core.py' },
  { path: '/home/pyodide/interpreter/objects/numbers.py', url: '/interpreter/objects/numbers.py' },
  { path: '/home/pyodide/interpreter/objects/strings.py', url: '/interpreter/objects/strings.py' },
  {
    path: '/home/pyodide/interpreter/objects/collections.py',
    url: '/interpreter/objects/collections.py',
  },
  {
    path: '/home/pyodide/interpreter/runtime/__init__.py',
    url: '/interpreter/runtime/__init__.py',
  },
  {
    path: '/home/pyodide/interpreter/runtime/builtins.py',
    url: '/interpreter/runtime/builtins.py',
  },
  { path: '/home/pyodide/interpreter/runtime/env.py', url: '/interpreter/runtime/env.py' },
];
let pyodideInstance = null;
let initializationPromise = null;
export const initSindlish = async (onProgress = () => {}) => {
  if (pyodideInstance) return pyodideInstance;
  if (initializationPromise) return initializationPromise;
  initializationPromise = (async () => {
    try {
      onProgress('Loading Python runtime...');

      // The runtime is bundled locally (issue #54) — never a CDN at runtime.
      // `scripts/copy-pyodide.js` copies the pyodide distribution to this path.
      if (!window.loadPyodide) {
        const script = document.createElement('script');
        script.src = '/pyodide/pyodide.js';
        document.head.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }
      const pyodide = await window.loadPyodide({ indexURL: '/pyodide/' });
      onProgress('Loading interpreter files...');
      pyodide.FS.mkdirTree('/home/pyodide/interpreter/frontend');
      pyodide.FS.mkdirTree('/home/pyodide/interpreter/analysis');
      pyodide.FS.mkdirTree('/home/pyodide/interpreter/backend');
      pyodide.FS.mkdirTree('/home/pyodide/interpreter/objects');
      pyodide.FS.mkdirTree('/home/pyodide/interpreter/runtime');
      let loaded = 0;
      for (const file of INTERPRETER_FILES) {
        const resp = await fetch(file.url);
        const text = await resp.text();
        pyodide.FS.writeFile(file.path, text);
        loaded++;
        onProgress(`Loading interpreter... (${loaded}/${INTERPRETER_FILES.length})`);
      }
      pyodide.runPython(`
import sys
def _noop_exit(code=0):
    pass
sys.exit = _noop_exit
`);
      pyodideInstance = pyodide;
      return pyodide;
    } catch (error) {
      initializationPromise = null;
      throw error;
    }
  })();
  return initializationPromise;
};
const ansiToHtml = (text) => {
  if (!text) return '';
  const colors = {
    0: 'reset',
    1: 'font-weight: bold',
    90: 'color: #797d86', // gray
    91: 'color: #E02424', // red
    93: 'color: #f7b983', // yellow
    94: 'color: #94b5f7', // blue
    96: 'color: #52c9e0', // cyan
  };
  let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const parts = html.split('\x1b[');
  if (parts.length === 1) return html;
  let result = parts[0];
  let currentStyles = [];
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const m = part.indexOf('m');
    if (m === -1) {
      result += part;
      continue;
    }
    const codes = part.substring(0, m).split(';');
    const content = part.substring(m + 1);
    codes.forEach((code) => {
      if (code === '0') {
        currentStyles = [];
      } else if (colors[code]) {
        currentStyles.push(colors[code]);
      }
    });
    if (currentStyles.length > 0) {
      result += `<span style="${currentStyles.join(';')}">${content}</span>`;
    } else {
      result += content;
    }
  }
  return result;
};

/**
 * Whether captured run output reports a failure. The interpreter reports errors
 * as text in the captured stdout/stderr — tagged `ghalti` or containing
 * "error" — so the Run contract reads that text rather than a status code. The
 * docs Run button and the workbench share this one heuristic.
 */
export const looksLikeError = (html) =>
  /\berror\b|ghalti/i.test(String(html || '').replace(/<[^>]+>/g, ''));

export const runSindlish = async (code, onProgress = () => {}) => {
  const pyodide = await initSindlish(onProgress);
  // Normalize line endings to avoid \r issues
  const normalizedCode = code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  pyodide.runPython(`
import sys
import io
_stdout_capture = io.StringIO()
_stderr_capture = io.StringIO()
sys.stdout = _stdout_capture
sys.stderr = _stderr_capture
`);
  try {
    pyodide.runPython(`
try:
    from interpreter import Interpreter
    _interp = Interpreter()
    # Always run in REPL mode for web to get better exception handling
    _interp.run_source(${JSON.stringify(normalizedCode)}, is_repl=True)
except Exception as e:
    # If the error reporter hasn't already handled it (or if it's a non-Sindlish error)
    if not getattr(e, '_reported', False):
        from interpreter.errors import ErrorReporter, SindhiBaseError
        if isinstance(e, SindhiBaseError):
            ErrorReporter.report(e)
            e._reported = True
        else:
            import traceback
            traceback.print_exc(file=sys.stderr)
`);
    const stdout = pyodide.runPython('_stdout_capture.getvalue()');
    const stderr = pyodide.runPython('_stderr_capture.getvalue()');
    pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
`);
    return ansiToHtml((stdout + stderr).trim()) || '(no output)';
  } catch (err) {
    return `Error: ${err.message}`;
  }
};

/**
 * ---------------------------------------------------------------------------
 * The language server (T9 / issue #56).
 * ---------------------------------------------------------------------------
 *
 * FINDING: the canonical repository's pygls language server
 * (`github.com/Sindlish/Sindlish`, `vscode-extension/server/server.py`) does
 * NOT live inside the `interpreter/` tree this site bundles, so it ships
 * nowhere near the workbench — and pygls' stdio transport cannot run inside a
 * browser even if it did. Rather than fake completions, the driver below
 * mirrors that server's `_validate`, `completions`, `hover` and `definition`
 * handlers step for step, against the very same interpreter modules the
 * server itself drives (Lexer -> Parser -> Resolver -> Compiler, KEYWORDS,
 * SimpleBuiltins, resolver symbols, SindhiBaseError). Every semantic decision
 * still belongs to the interpreter; this is a transport shim, not a fork of
 * the language. The seam stays single: the language server, the docs Run
 * button and the workbench Run all execute through this one file.
 *
 * If the language repo later publishes a browser-reachable server, this
 * section shrinks to a plain client.
 */

// Mirrors vscode-extension/server/server.py; keep the two in step.
const SINDLISH_LS_DRIVER = String.raw`
import json
import re

from interpreter import Compiler, Lexer, Parser, Resolver
from interpreter.errors import SindhiBaseError
from interpreter.frontend.keywords import KEYWORDS
from interpreter.runtime.builtins import SimpleBuiltins

# The native method map of the canonical pygls server, verbatim.
_NATIVE_METHODS = {
    "vada": "Convert to uppercase",
    "nanda": "Convert to lowercase",
    "hata": "Remove whitespace",
    "badla": "Replace text",
    "shamil": "Check if contains",
    "wadha": "Add element to list",
    "kadh": "Remove and return element",
    "saaf": "Clear all elements",
    "ulat": "Reverse the list",
    "tartib": "Sort the list",
    "mela": "Union of sets",
    "farq": "Difference of sets",
    "lazmi": "Unwrap value or panic",
    "bachao": "Provide fallback for error",
    "ok": "Check if success",
    "ghalti": "Check if error",
}


def _diag_from_error(e, source):
    # Mirrors the canonical server's _report_diagnostic.
    if isinstance(e, SindhiBaseError) and e.line is not None:
        line = e.line
        col = e.column if e.column is not None else 1
        start_char = col - 1
        end_char = col
        lines = source.split("\n")
        if 0 < line <= len(lines):
            error_line = lines[line - 1]
            match = re.search(r"[a-zA-Z0-9_]+", error_line[start_char:])
            if match:
                end_char = start_char + match.end()
            else:
                end_char = len(error_line)
        return {
            "range": {
                "start": {"line": line - 1, "character": start_char},
                "end": {"line": line - 1, "character": max(start_char + 1, end_char)},
            },
            "message": e.details,
            "source": "Sindlish",
            "severity": 1,
        }
    msg = re.sub(r"\x1b\[[0-9;]*m", "", str(e))
    lines = [l.strip() for l in msg.split("\n") if l.strip()]
    core_msg = lines[0] if lines else "Unknown Error"
    line = 1
    m = re.search(r"Line (\d+)", msg, re.IGNORECASE)
    if m:
        line = int(m.group(1))
    line = max(line - 1, 0)
    return {
        "range": {
            "start": {"line": line, "character": 0},
            "end": {"line": line, "character": 100},
        },
        "message": core_msg,
        "source": "Sindlish",
        "severity": 1,
    }


def _validate(source):
    # Mirrors the canonical server's _validate, minus the publish and the
    # state stored on the server object (this driver is stateless).
    diagnostics = []
    resolver = None
    try:
        tokens = Lexer(source).generate_tokens()
        ast = Parser(tokens, source).parse()
        resolver = Resolver(source)
        resolver.resolve(ast)
        Compiler(source).compile(ast)
    except Exception as e:
        diagnostics.append(_diag_from_error(e, source))
    symbols = []
    if resolver is not None:
        for sym in resolver.symbols:
            sym_type = sym.get("type")
            symbols.append(
                {
                    "name": sym["name"],
                    "kind": sym["kind"],
                    "line": sym["line"],
                    "col": sym["col"],
                    "type": getattr(sym_type, "name", None),
                }
            )
    return diagnostics, symbols


def ls_analyze(source):
    diagnostics, symbols = _validate(source)
    return json.dumps({"diagnostics": diagnostics, "symbols": symbols})


def ls_completions(source, line, character):
    # Mirrors the canonical server's completions handler.
    _diagnostics, symbols = _validate(source)
    items = []
    for k in KEYWORDS:
        items.append({"label": k, "kind": "Keyword"})
    for f in SimpleBuiltins().get_all():
        items.append({"label": f, "kind": "Function", "detail": "Built-in Function"})
    for sym in symbols:
        kind = "Function" if sym["kind"] == "function" else "Variable"
        items.append(
            {
                "label": sym["name"],
                "kind": kind,
                "detail": "Local %s (line %s)" % (sym["kind"], sym["line"]),
            }
        )
    lines = source.split("\n")
    if 0 <= line < len(lines):
        before_cursor = lines[line][:character]
        if before_cursor.endswith("."):
            method_items = [
                {"label": m_name, "kind": "Method", "detail": "Native Method: " + doc}
                for m_name, doc in _NATIVE_METHODS.items()
            ]
            return json.dumps({"items": method_items})
    return json.dumps({"items": items})


def ls_hover(source, line, character):
    # Mirrors the canonical server's hover handler.
    _diagnostics, symbols = _validate(source)
    for sym in symbols:
        if sym["line"] == line + 1:
            start = sym["col"] - 1
            end = start + len(sym["name"])
            if start <= character <= end:
                type_info = (sym["type"] or "any").lower()
                tick = chr(96)
                content = (
                    "**%s** (%s)\n\nType: " % (sym["name"], sym["kind"])
                    + tick
                    + type_info
                    + tick
                )
                return json.dumps({"content": content})
    return "null"


def ls_definition(source, line, character):
    # Mirrors the canonical server's definition handler.
    _diagnostics, symbols = _validate(source)
    lines = source.split("\n")
    if not (0 <= line < len(lines)):
        return "null"
    line_content = lines[line]
    word = None
    for m in re.finditer(r"\b[a-zA-Z_][a-zA-Z0-9_]*\b", line_content):
        if m.start() <= character <= m.end():
            word = m.group()
            break
    if not word:
        return "null"
    for sym in symbols:
        if sym["name"] == word:
            return json.dumps(
                {
                    "line": sym["line"] - 1,
                    "character": sym["col"] - 1,
                    "length": len(sym["name"]),
                }
            )
    return "null"
`;

let languageServiceReady = false;

const callLanguageService = async (fn, args, onProgress = () => {}) => {
  const pyodide = await initSindlish(onProgress);
  if (!languageServiceReady) {
    pyodide.runPython(SINDLISH_LS_DRIVER);
    languageServiceReady = true;
  }
  for (const [name, value] of Object.entries(args)) pyodide.globals.set(name, value);
  const raw = pyodide.runPython(`${fn}(${Object.keys(args).join(', ')})`);
  return raw ? JSON.parse(raw) : null;
};

const toServerPosition = (position) => ({
  js_line: position.lineNumber - 1,
  js_char: position.column - 1,
});

/**
 * Run the language server's validation pass over `code`.
 * Resolves `{ diagnostics, symbols }`; diagnostics use LSP-shaped ranges
 * (0-based line/character) with `severity: 1` (Error), source "Sindlish".
 */
export const sindlishAnalyze = (code, onProgress) =>
  callLanguageService('ls_analyze', { js_source: code }, onProgress);

/** Completions at `position` ({ lineNumber, column }, 1-based, Monaco-style). */
export const sindlishCompletions = (code, position, onProgress) =>
  callLanguageService(
    'ls_completions',
    { js_source: code, ...toServerPosition(position) },
    onProgress
  );

/** Hover content at `position`, or null. */
export const sindlishHover = (code, position, onProgress) =>
  callLanguageService('ls_hover', { js_source: code, ...toServerPosition(position) }, onProgress);

/** Definition of the symbol at `position`: { line, character, length } or null. */
export const sindlishDefinition = (code, position, onProgress) =>
  callLanguageService(
    'ls_definition',
    { js_source: code, ...toServerPosition(position) },
    onProgress
  );
