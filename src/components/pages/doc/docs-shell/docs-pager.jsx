import NextLink from 'next/link';
import PropTypes from 'prop-types';

export const DocsPager = ({ previousLink, nextLink, basePath = '/docs/' }) => {
  const hasPrevious = previousLink?.title && previousLink?.slug;
  const hasNext = nextLink?.title && nextLink?.slug;

  if (!hasPrevious && !hasNext) return null;

  return (
    <nav
      aria-label="Previous and next"
      className="mt-16 grid grid-cols-2 gap-4 border-t border-border pt-6"
    >
      {hasPrevious ? (
        <NextLink
          className="flex flex-col items-start gap-1 border border-border bg-surface-raised p-4 transition-colors hover:border-border-strong"
          href={`${basePath}${previousLink.slug}`}
        >
          <span className="text-[11px] tracking-wide text-text-muted uppercase">Previous</span>
          <span className="text-sm font-medium text-link">{previousLink.title}</span>
        </NextLink>
      ) : (
        <span aria-hidden="true" className="hidden" />
      )}
      {hasNext && (
        <NextLink
          className="flex flex-col items-end gap-1 border border-border bg-surface-raised p-4 text-right transition-colors hover:border-border-strong"
          href={`${basePath}${nextLink.slug}`}
        >
          <span className="text-[11px] tracking-wide text-text-muted uppercase">Next</span>
          <span className="text-sm font-medium text-link">{nextLink.title}</span>
        </NextLink>
      )}
    </nav>
  );
};

DocsPager.propTypes = {
  basePath: PropTypes.string,
  nextLink: PropTypes.shape({
    slug: PropTypes.string,
    title: PropTypes.string,
  }),
  previousLink: PropTypes.shape({
    slug: PropTypes.string,
    title: PropTypes.string,
  }),
};

DocsPager.defaultProps = {
  basePath: '/docs/',
  nextLink: null,
  previousLink: null,
};

export default DocsPager;
