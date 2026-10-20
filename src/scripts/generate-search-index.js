#!/usr/bin/env node

const fs = require('fs/promises');
const path = require('path');

const { getAllPosts } = require('../utils/api-docs');
const { buildSearchIndex } = require('../utils/search-index');

async function main() {
  const projectRoot = path.resolve(__dirname, '../..');
  const posts = await getAllPosts();
  const index = buildSearchIndex(posts);
  const outputDir = path.join(projectRoot, 'src', 'generated');
  await fs.mkdir(outputDir, { recursive: true });
  const outPath = path.join(outputDir, 'search-index.json');
  await fs.writeFile(outPath, JSON.stringify(index, null, 2));
  console.log(`Search index written to ${outPath} (${index.docs.length} docs)`);
}

main().catch((err) => {
  console.error('Error generating search index:', err);
  process.exit(1);
});
