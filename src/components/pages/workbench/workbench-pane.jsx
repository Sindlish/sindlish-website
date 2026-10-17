import { notFound } from 'next/navigation';
import PropTypes from 'prop-types';

import DocsIndex from 'components/pages/doc/docs-shell/docs-index';
import Post from 'components/pages/doc/post';
import { DOCS_DIR_PATH } from 'constants/content';
import { getPostBySlug } from 'utils/api-content';
import { getNavigation, getNavigationLinks } from 'utils/api-docs';
import { getFlatSidebar } from 'utils/get-flat-sidebar';

/**
 * The docs pane of the workbench (issue #54).
 *
 * It renders through the same docs components as `/docs` (issue #51), but every
 * pager and inline link is rewritten onto the pane's own base path so the pane
 * stays the pane — the browser back button and deep links work. A server
 * component: it reads the corpus from disk at build/request time.
 */
export const WORKBENCH_DOCS_BASE_PATH = '/workbench/docs/';

const isUnusedOrSharedContent = (slug) =>
  slug.includes('unused/') ||
  slug.includes('shared-content/') ||
  slug.includes('README') ||
  slug.includes('GUIDE_TEMPLATE');

export const WorkbenchPane = ({ slug = '' }) => {
  const navigation = getNavigation();

  if (!slug || isUnusedOrSharedContent(slug)) {
    if (!slug) {
      return (
        <div className="px-7 py-8">
          <DocsIndex basePath={WORKBENCH_DOCS_BASE_PATH} navigation={navigation} />
        </div>
      );
    }

    return notFound();
  }

  const post = getPostBySlug(slug, DOCS_DIR_PATH);
  if (!post) return notFound();

  const flatSidebar = getFlatSidebar(navigation);
  const navigationLinks = getNavigationLinks(slug, flatSidebar);

  return (
    <div className="px-7 py-8">
      <Post
        content={post.content}
        data={post.data}
        navigationLinks={navigationLinks}
        navigationLinksBasePath={WORKBENCH_DOCS_BASE_PATH}
      />
    </div>
  );
};

WorkbenchPane.propTypes = {
  slug: PropTypes.string,
};

WorkbenchPane.defaultProps = {
  slug: '',
};

export default WorkbenchPane;
