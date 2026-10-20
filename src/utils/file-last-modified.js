const { execFileSync } = require('node:child_process');
const path = require('node:path');

// Deterministic `lastmod` source.
//
// A sitemap regenerated twice from the same commit must be byte-identical, so we
// never stamp `new Date()`. Instead each URL borrows the commit date of the file
// that owns it, which is stable for as long as the content is.
//
// Dates are read in a single `git log` walk (one subprocess for the whole
// `content/` tree) instead of one `git log` per file: on Windows an absolute
// pathspec lookup costs ~150ms, so 30+ pages would add seconds to every build.
// Missing git or never-committed files yield `null` and the caller simply omits
// `lastModified`.
const cache = new Map();
let loaded = false;

const root = process.cwd();
const normalize = (p) => p.split(path.sep).join('/');

// Walk history newest-first and record the most recent commit date seen for
// every path under `content/`. Git prints paths relative to the repo root, and
// the first hit wins, so the map ends up holding each file's last-modified date.
function loadContentDates() {
  if (loaded) return;
  loaded = true;

  try {
    const out = execFileSync(
      'git',
      ['log', '--topo-order', '--format=%x00%cI', '--name-only', '--', 'content'],
      {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
        maxBuffer: 256 * 1024 * 1024,
      }
    );

    let date = null;
    for (const line of out.split('\n')) {
      if (line.charCodeAt(0) === 0) {
        date = line.slice(1).trim() || null;
      } else if (line) {
        const key = normalize(`${root}/${line.trim()}`);
        if (!cache.has(key)) cache.set(key, date);
      }
    }
  } catch {
    // git unavailable or not a repository: callers omit lastModified.
  }
}

function getFileLastModified(absPath) {
  const key = normalize(absPath);

  if (!loaded) loadContentDates();
  if (cache.has(key)) return cache.get(key);

  // Path outside the preloaded content tree: fall back to one lookup and
  // memoize the result (including a miss) so repeated calls stay cheap.
  let value = null;
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', absPath], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    value = out || null;
  } catch {
    value = null;
  }

  cache.set(key, value);
  return value;
}

/**
 * Last commit date of a docs source file (`content/docs/<slug>.md`), or
 * `undefined` when git cannot answer. The sitemap `lastmod` and the docs
 * `dateModified` both read from this one deterministic source.
 */
function getDocsSourceLastModified(slug) {
  const absPath = normalize(path.join(root, 'content', 'docs', `${slug}.md`));
  return getFileLastModified(absPath) || undefined;
}

module.exports = { getFileLastModified, getDocsSourceLastModified };
