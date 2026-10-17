import PropTypes from 'prop-types';

import Content from 'components/shared/content';
import { DOCS_BASE_PATH } from 'constants/docs';

import DocsPager from '../docs-shell/docs-pager';

/**
 * A single docs page inside the app shell.
 *
 * The shell owns the chrome (header, sidebar, pager column); this component
 * owns only the page's own content: exactly one `h1`, the summary rendered as
 * the lede, and the Markdown body. Frontmatter layout affordances are gone
 * (issue #51): a page is title + summary + body + prev/next.
 */
const Post = ({
  data: { title, summary = null },
  content,
  navigationLinks: { previousLink, nextLink },
  navigationLinksBasePath = DOCS_BASE_PATH,
}) => (
  <article>
    <h1 className="text-2xl font-semibold tracking-tight text-text-primary">{title}</h1>
    {summary && (
      <p className="mt-3 mb-10 text-base leading-normal text-text-secondary">{summary}</p>
    )}
    <Content className={summary ? undefined : 'mt-10'} content={content} />
    <DocsPager basePath={navigationLinksBasePath} nextLink={nextLink} previousLink={previousLink} />
  </article>
);

Post.propTypes = {
  data: PropTypes.shape({
    summary: PropTypes.string,
    title: PropTypes.string.isRequired,
  }).isRequired,
  content: PropTypes.string.isRequired,
  navigationLinks: PropTypes.shape({
    nextLink: PropTypes.shape({
      slug: PropTypes.string,
      title: PropTypes.string,
    }),
    previousLink: PropTypes.shape({
      slug: PropTypes.string,
      title: PropTypes.string,
    }),
  }).isRequired,
  navigationLinksBasePath: PropTypes.string,
};

Post.defaultProps = {
  navigationLinksBasePath: DOCS_BASE_PATH,
};

export default Post;
