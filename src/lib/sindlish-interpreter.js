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

      // Check if script already exists
      if (!window.loadPyodide) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js';
        document.head.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }
      const pyodide = await window.loadPyodide();
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
