import NextLink from 'next/link';
import PropTypes from 'prop-types';

import { DOCS_BASE_PATH } from 'constants/docs';

import { countPages, getPillarSections } from './nav-helpers';

export const DocsIndex = ({ navigation = [] }) => {
  const totalPages = countPages(navigation.map((pillar) => pillar.items).flat());

  return (
    <div className="pb-4">
      <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Documentation</h1>
      <p className="mt-3 mb-10 text-base leading-normal text-text-secondary">
        {totalPages} pages, grouped the way they are meant to be read.
      </p>

      {navigation.map((pillar) => {
        const pagesCount = countPages(pillar.items);
        const sections = getPillarSections(pillar.items);
        const pages = sections.flatMap((section) =>
          section.pages.map((page) => ({ ...page, section: section.title }))
        );

        return (
          <div key={pillar.nav} className="mb-10">
            <h2 className="text-lg font-semibold tracking-tight text-text-primary">{pillar.nav}</h2>
            <p className="mt-1 text-sm text-text-muted">{pagesCount} pages</p>
            <ul className="mt-4 border-t border-border">
              {pages.map((page) => (
                <li key={page.slug} className="border-b border-border">
                  <NextLink
                    className="flex items-baseline justify-between gap-6 py-2.5 text-sm text-link transition-colors hover:text-link-hover"
                    href={`${DOCS_BASE_PATH}${page.slug}`}
                  >
                    <span>{page.title}</span>
                    {page.section && (
                      <span className="shrink-0 text-xs whitespace-nowrap text-text-muted">
                        {page.section}
                      </span>
                    )}
                  </NextLink>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

DocsIndex.propTypes = {
  navigation: PropTypes.arrayOf(PropTypes.shape({})),
};

DocsIndex.defaultProps = {
  navigation: [],
};

export default DocsIndex;
