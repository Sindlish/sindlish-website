#!/usr/bin/env bash
#
# Fetch the canonical Sindlish interpreter tree for the staleness gate.
#
# Shallowly and sparsely clones the language repository (Sindlish/Sindlish),
# checking out only its `interpreter/` package, and prints the absolute path to
# that directory on stdout. All git chatter goes to stderr so the path can be
# captured by the caller.
#
# Environment:
#   SINDLISH_CANONICAL_REF        git branch or tag to check out (default: main)
#   SINDLISH_CANONICAL_FETCH_DIR  directory to clone into (default: a temp dir)
#
# Usage:
#   CANONICAL_DIR="$(bash scripts/docs-checks/interpreter-staleness/fetch-canonical.sh)"
#
# A note on the ref: the default (`main`) is intentional. The gate exists to
# catch the bundle drifting from the language the project actually ships, so a
# new commit upstream is supposed to fail the site build until the bundle is
# re-synced. Pin SINDLISH_CANONICAL_REF to a tag/commit for a reproducible run.
set -euo pipefail

ref="${SINDLISH_CANONICAL_REF:-main}"
repo_url="https://github.com/Sindlish/Sindlish"
dest="${SINDLISH_CANONICAL_FETCH_DIR:-$(mktemp -d)}"
clone_dir="${dest%/}/sindlish"

mkdir -p "$dest"

if [ ! -d "$clone_dir/.git" ]; then
  git clone --quiet --depth 1 --filter=blob:none --sparse --branch "$ref" "$repo_url" "$clone_dir" >&2
fi
git -C "$clone_dir" sparse-checkout set interpreter >&2

if [ ! -f "$clone_dir/interpreter/__init__.py" ]; then
  echo "fetch-canonical: ref '$ref' has no interpreter/__init__.py (wrong ref or repository layout changed)" >&2
  exit 1
fi

printf '%s\n' "$clone_dir/interpreter"
