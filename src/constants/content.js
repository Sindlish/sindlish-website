const CONTENT_DIR_PATH = 'content';
const DOCS_DIR_PATH = `${CONTENT_DIR_PATH}/docs`;

const CONTENT_ROUTES = {
  docs: DOCS_DIR_PATH,
};

const EXCLUDED_ROUTES = [];

const EXCLUDED_FILES = ['rss.xml'];

module.exports = {
  CONTENT_ROUTES,
  EXCLUDED_ROUTES,
  EXCLUDED_FILES,
  DOCS_DIR_PATH,
};
