const fs = require('fs');
const path = require('path');

const files = [
  'pyodide.js',
  'pyodide.mjs',
  'pyodide.asm.js',
  'pyodide.asm.wasm',
  'python_stdlib.zip',
  'pyodide-lock.json',
];

const srcDir = path.join(__dirname, '..', 'node_modules', 'pyodide');
const dstDir = path.join(__dirname, '..', 'public', 'pyodide');

function copyIfExists(src, dst) {
  if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
  }
}

fs.mkdirSync(dstDir, { recursive: true });
for (const f of files) {
  copyIfExists(path.join(srcDir, f), path.join(dstDir, f));
}
console.log('Copied pyodide distribution to public/pyodide');
