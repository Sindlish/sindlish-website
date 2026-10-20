const fs = require('fs');

const { glob } = require('glob');
const matter = require('gray-matter');

const getExcerpt = require('./get-excerpt');

const getPostSlugs = async (pathname) => {
  const files = await glob.sync(`${pathname}/**/*.md`, {
    ignore: ['**/README.md', '**/unused/**', '**/shared-content/**', '**/GUIDE_TEMPLATE.md'],
    // Slugs are URL segments, so force forward slashes regardless of platform
    // (glob returns backslashes on Windows, which breaks the replace() below).
    posix: true,
  });
  // glob returns platform-native separators (backslashes on Windows); normalise
  // them to forward slashes before stripping the route prefix so slugs are
  // identical on every platform.
  return files.map((file) =>
    file.replace(/\\/g, '/').replace(pathname, '').replace('.md', '')
  );
};

const getPostBySlug = (slug, pathname) => {
  try {
    const source = fs.readFileSync(`${process.cwd()}/${pathname}/${slug}.md`, 'utf-8');
    const { data, content } = matter(source);
    const excerpt = getExcerpt(content, 200);

    return { data, content, excerpt };
  } catch (_e) {
    return null;
  }
};

module.exports = {
  getPostSlugs,
  getPostBySlug,
};
