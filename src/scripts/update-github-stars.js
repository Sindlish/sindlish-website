#!/usr/bin/env node

require('dotenv').config({ path: '.env' });

const fs = require('fs/promises');
const path = require('path');

const API_URL = 'https://api.github.com/repos/Sindlish/Sindlish';
const SNAPSHOT_PATH = path.join(process.cwd(), 'src/utils/data/github-stars.generated.json');
const SNAPSHOT_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const FAILED_FETCH_RETRY_DELAY_MS = 60 * 60 * 1000;
const DEFAULT_STATS = {
  stargazers_count: 2,
  language: 'Python',
  language_percentage: 98,
  files_count: 30,
  commits_count: 33,
  topics: ['interpreter', 'vscode-extension', 'bytecode-vm', 'sindhi-grammar'],
};
const FETCH_TIMEOUT_MS = 10000;

function getHeaders() {
  const token = process.env.GITHUB_TOKEN;
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'sindlish-next-github-stars-updater',
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  return headers;
}

async function readSnapshot() {
  try {
    const rawSnapshot = await fs.readFile(SNAPSHOT_PATH, 'utf8');
    const snapshot = JSON.parse(rawSnapshot);

    if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
      throw new Error('Generated snapshot did not contain a snapshot object');
    }

    return snapshot;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }

    console.warn(`GitHub stars: failed to read snapshot ${SNAPSHOT_PATH}: ${error.message}`);
    return null;
  }
}

function normalizeSnapshot(snapshot) {
  return {
    checked_at: snapshot?.checked_at ?? null,
    stargazers_count: Number.isFinite(snapshot?.stargazers_count)
      ? snapshot.stargazers_count
      : DEFAULT_STATS.stargazers_count,
    language: snapshot?.language || DEFAULT_STATS.language,
    language_percentage: Number.isFinite(snapshot?.language_percentage)
      ? snapshot.language_percentage
      : DEFAULT_STATS.language_percentage,
    files_count: Number.isFinite(snapshot?.files_count)
      ? snapshot.files_count
      : DEFAULT_STATS.files_count,
    commits_count: Number.isFinite(snapshot?.commits_count)
      ? snapshot.commits_count
      : DEFAULT_STATS.commits_count,
    topics: Array.isArray(snapshot?.topics) ? snapshot.topics : DEFAULT_STATS.topics,
  };
}

function isFresh(snapshot) {
  if (!snapshot?.checked_at) {
    return false;
  }

  const checkedAt = Date.parse(snapshot.checked_at);

  if (Number.isNaN(checkedAt)) {
    return false;
  }

  return Date.now() - checkedAt < SNAPSHOT_MAX_AGE_MS;
}

async function writeSnapshot(snapshot) {
  await fs.mkdir(path.dirname(SNAPSHOT_PATH), { recursive: true });
  await fs.writeFile(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
}

async function fetchGitHubStats() {
  let repoResponse;

  try {
    repoResponse = await fetch(API_URL, {
      headers: getHeaders(),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      throw new Error(`GitHub API request timed out after ${FETCH_TIMEOUT_MS}ms`);
    }

    throw error;
  }

  const repoText = await repoResponse.text();

  if (!repoResponse.ok) {
    throw new Error(`GitHub API ${repoResponse.status}: ${repoText.slice(0, 200)}`);
  }

  const repoPayload = JSON.parse(repoText);
  const starsCount = repoPayload?.stargazers_count;
  const language = repoPayload?.language;
  const defaultBranch = repoPayload?.default_branch;
  const topics = repoPayload?.topics || [];

  if (!Number.isFinite(starsCount)) {
    throw new Error('GitHub API response did not include a numeric stargazers_count');
  }

  let languagesPercentage = DEFAULT_STATS.language_percentage;

  try {
    const langsResponse = await fetch(`${API_URL}/languages`, {
      headers: getHeaders(),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (langsResponse.ok) {
      const langsPayload = await langsResponse.json();
      const totalBytes = Object.values(langsPayload).reduce((sum, bytes) => sum + bytes, 0);
      const languageBytes = langsPayload[language] || 0;
      languagesPercentage = Math.round((languageBytes / totalBytes) * 100);
    }
  } catch {
    // Use default
  }

  let commitsCount = DEFAULT_STATS.commits_count;

  try {
    const commitsResponse = await fetch(`${API_URL}/commits?sha=${defaultBranch}&per_page=1`, {
      headers: getHeaders(),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (commitsResponse.ok) {
      const linkHeader = commitsResponse.headers.get('Link');
      const match = linkHeader?.match(/&page=(\d+)>; rel="last"/);

      if (match) {
        commitsCount = parseInt(match[1], 10);
      }
    }
  } catch {
    // Use default
  }

  let filesCount = DEFAULT_STATS.files_count;

  try {
    const treeResponse = await fetch(`${API_URL}/git/trees/${defaultBranch}?recursive=1`, {
      headers: getHeaders(),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (treeResponse.ok) {
      const treePayload = await treeResponse.json();
      filesCount = treePayload.tree?.filter((item) => item.type === 'blob').length || filesCount;
    }
  } catch {
    // Use default
  }

  return {
    stargazers_count: starsCount,
    language: language || DEFAULT_STATS.language,
    language_percentage: languagesPercentage,
    files_count: filesCount,
    commits_count: commitsCount,
    topics: topics.length > 0 ? topics : DEFAULT_STATS.topics,
  };
}

async function main() {
  const snapshot = normalizeSnapshot(await readSnapshot());

  if (isFresh(snapshot)) {
    console.log(`GitHub stats: using cached snapshot from ${snapshot.checked_at}`);
    return;
  }

  const now = new Date().toISOString();
  const currentStats = snapshot;

  try {
    const stats = await fetchGitHubStats();
    const nextSnapshot = {
      ...stats,
      checked_at: now,
    };

    await writeSnapshot(nextSnapshot);

    if (stats.stargazers_count !== currentStats.stargazers_count) {
      console.log(
        `GitHub stats: stars updated from ${currentStats.stargazers_count} to ${stats.stargazers_count}`
      );
    } else {
      console.log(`GitHub stats: stars unchanged at ${stats.stargazers_count}`);
    }

    console.log(`GitHub stats: language=${stats.language} (${stats.language_percentage}%)`);
    console.log(`GitHub stats: files=${stats.files_count} commits=${stats.commits_count}`);
  } catch (error) {
    await writeSnapshot({
      ...currentStats,
      checked_at: new Date(
        Date.now() - (SNAPSHOT_MAX_AGE_MS - FAILED_FETCH_RETRY_DELAY_MS)
      ).toISOString(),
    });
    console.warn(`GitHub stats: ${error.message}`);
    console.warn(`GitHub stats: keeping cached fallback`);
  }
}

main().catch((error) => {
  console.error(`GitHub stars: unexpected failure: ${error.message}`);
  process.exit(1);
});
