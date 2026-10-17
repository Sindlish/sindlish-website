function isCodeFenceStart(line) {
  return /^`{3,}/.test(line.trim());
}

function getFenceInfo(line) {
  const m = line.trim().match(/^`{3,}\s*([^\s`]+)?/);
  return m && m[1] ? m[1].toLowerCase() : '';
}

function extractCodeIdentifiers(markdown) {
  const ids = new Set();
  const lines = markdown.split(/\r?\n/);
  let inFence = false;
  let fenceLang = '';
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (isCodeFenceStart(line)) {
      const info = getFenceInfo(line);
      inFence = !inFence;
      if (inFence) {
        fenceLang = info;
      } else {
        fenceLang = '';
      }
      continue;
    }
    if (inFence) {
      const lang = fenceLang;
      if (lang === 'sd' || lang === 'sindlish') {
        const re = /[A-Za-z_\u0600-\u06FF][A-Za-z0-9_\u0600-\u06FF]*/g;
        let m;
        while ((m = re.exec(line)) !== null) {
          ids.add(m[0]);
        }
      }
      continue;
    }
    // inline code
    const reInline = /`([A-Za-z_\u0600-\u06FF][A-Za-z0-9_\u0600-\u06FF()]*)`/g;
    let m2;
    while ((m2 = reInline.exec(line)) !== null) {
      const tok = m2[1];
      // store bare identifier if ends with ()
      if (tok.endsWith('()')) {
        ids.add(tok.slice(0, -2));
      } else {
        ids.add(tok);
      }
    }
  }
  return Array.from(ids);
}

function extractHeadings(markdown) {
  const headings = [];
  const lines = markdown.split(/\r?\n/);
  let inFence = false;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (isCodeFenceStart(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (m) {
      headings.push(m[2].trim());
    }
  }
  return headings;
}

function stripMarkdownText(s) {
  if (!s) return '';
  let t = s;
  t = t.replace(/```[\s\S]*?```/g, ' ');
  t = t.replace(/`([^`]*)`/g, '$1');
  t = t.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1');
  t = t.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  t = t.replace(/<\/?[^>]+>/g, ' ');
  t = t.replace(/(^>\s*)+/gm, ' ');
  t = t.replace(/[*_~`#]+/g, ' ');
  t = t.replace(/\s+/g, ' ');
  return t.trim();
}

function extractProse(markdown) {
  const t = stripMarkdownText(markdown);
  return t;
}

function buildSearchIndex(posts) {
  // posts: [{ slug, title, summary, content }]
  const docs = posts
    .filter(Boolean)
    .map((p) => {
      const slug = p.slug || '';
      const url = `/docs/${slug}`;
      const title = p.title || '';
      const summary = p.summary || '';
      const content = p.content || '';
      const prose = [title, summary, extractProse(content)].filter(Boolean).join(' ');
      const code = Array.from(
        new Set([...extractCodeIdentifiers(content), ...extractCodeIdentifiers(summary), ...extractCodeIdentifiers(title)])
      );
      const headings = extractHeadings(content);
      return {
        slug,
        url,
        title,
        summary,
        prose,
        code,
        headings,
      };
    });
  return { version: 1, docs };
}

const CODE_TERM_RE = /^([A-Za-z_\u0600-\u06FF][A-Za-z0-9_\u0600-\u06FF]*)\(\)$/;

function normalizeTerm(term) {
  return term.toLowerCase().replace(/[^\p{L}\p{N}_]+/gu, '');
}

/**
 * Bounded Levenshtein distance: returns Infinity when it exceeds `max`.
 */
function editDistanceAtMost(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return Infinity;
  const m = a.length;
  const n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i += 1) {
    const curr = new Array(n + 1);
    curr[0] = i;
    let rowMin = curr[0];
    for (let j = 1; j <= n; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      if (curr[j] < rowMin) rowMin = curr[j];
    }
    if (rowMin > max) return Infinity;
    prev = curr;
  }
  return prev[n];
}

/**
 * Fuzzy presence of `needle` (already normalised, lowercase) in `haystack`
 * (lowercase). Returns 0 (no match), 1 (fuzzy word), 2 (word prefix) or
 * 3 (substring).
 */
function fuzzyQuality(haystack, needle) {
  if (!needle) return 0;
  if (haystack.includes(needle)) return 3;

  const words = haystack.split(/[^\p{L}\p{N}_]+/u).filter(Boolean);
  let best = 0;
  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];
    if (needle.length >= 2 && word.startsWith(needle)) {
      if (best < 2) best = 2;
      continue;
    }
    if (needle.length >= 3) {
      const max = needle.length <= 4 ? 1 : 2;
      if (editDistanceAtMost(word, needle, max) <= max && best < 1) {
        best = 1;
      }
    }
  }
  return best;
}

const FIELD_WEIGHTS = {
  title: 50,
  summary: 25,
  headings: 15,
  prose: 8,
};

/**
 * Rank the indexed docs for a free-text query.
 *
 * Prose is matched fuzzily (typos survive). A term written with call syntax
 * (`ubah()`) is a code identifier and must match the document's code tokens
 * exactly, case-sensitively; code hits carry `kind: 'code'` so the UI can
 * label them distinctly from prose hits.
 *
 * @param {{docs: Array}} index
 * @param {string} query
 * @returns {Array<{slug:string,url:string,title:string,summary:string,kind:string,score:number,matchedTerms:string[]}>}
 */
function searchDocs(index, query) {
  const docs = (index && index.docs) || [];
  const rawTerms = String(query || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8);
  if (rawTerms.length === 0) return [];

  const results = [];

  for (let d = 0; d < docs.length; d += 1) {
    const doc = docs[d];
    const fields = {
      title: (doc.title || '').toLowerCase(),
      summary: (doc.summary || '').toLowerCase(),
      headings: (doc.headings || []).join(' ').toLowerCase(),
      prose: (doc.prose || '').toLowerCase(),
    };

    let score = 0;
    let isCode = false;
    const matchedTerms = [];

    for (let t = 0; t < rawTerms.length; t += 1) {
      const raw = rawTerms[t];
      const codeMatch = raw.match(CODE_TERM_RE);

      if (codeMatch) {
        const identifier = codeMatch[1];
        if (doc.code && doc.code.includes(identifier)) {
          score += 100;
          isCode = true;
          matchedTerms.push(`${identifier}()`);
        }
        continue;
      }

      const needle = normalizeTerm(raw);
      if (needle.length < 2) continue;

      let bestField = null;
      let bestQuality = 0;
      const fieldNames = ['title', 'summary', 'headings', 'prose'];
      for (let f = 0; f < fieldNames.length; f += 1) {
        const name = fieldNames[f];
        const quality = fuzzyQuality(fields[name], needle);
        if (quality > bestQuality) {
          bestQuality = quality;
          bestField = name;
        }
      }

      if (bestField) {
        score += FIELD_WEIGHTS[bestField] + bestQuality * 2;
        matchedTerms.push(raw);
      }
    }

    if (score > 0) {
      results.push({
        slug: doc.slug,
        url: doc.url,
        title: doc.title,
        summary: doc.summary,
        kind: isCode ? 'code' : 'prose',
        score,
        matchedTerms,
      });
    }
  }

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.title !== b.title) return a.title.localeCompare(b.title);
    return a.slug.localeCompare(b.slug);
  });

  return results;
}

module.exports = {
  buildSearchIndex,
  extractCodeIdentifiers,
  extractHeadings,
  extractProse,
  searchDocs,
  fuzzyQuality,
  editDistanceAtMost,
  normalizeTerm,
};
