import NextLink from 'next/link';
import PropTypes from 'prop-types';

import { DOCS_BASE_PATH } from 'constants/docs';
import { cn } from 'utils/cn';

import DocsSearch from './docs-search';
import { countPages, findCurrentPillarIndex, getPillarSections } from './nav-helpers';

export const DocsNav = ({ navigation = [], currentPath = '', onNavigate = null }) => {
  const currentPillar = findCurrentPillarIndex(navigation, currentPath);

  const handleClick = (event) => {
    if (onNavigate) {
      onNavigate(event);
    }
  };

  return (
    <div className="px-5 py-4">
      <DocsSearch id="docs-search-sidebar" label="Search the docs" placeholder="Search" />
      {navigation.map((pillar, index) => {
        const isCurrent = index === currentPillar;
        const pagesCount = countPages(pillar.items);
        const sections = getPillarSections(pillar.items);

        return (
          <details key={pillar.nav} className="group mb-6" open={isCurrent}>
            <summary className="flex cursor-pointer list-none items-baseline gap-2 text-sm font-medium text-text-secondary marker:hidden [&::-webkit-details-marker]:hidden">
              <span className={cn(isCurrent && 'text-text-primary')}>{pillar.nav}</span>
              <span className="text-xs text-text-muted">{pagesCount}</span>
              <span
                className="ml-auto text-xs text-text-muted group-open:rotate-180"
                aria-hidden="true"
              >
                ▾
              </span>
            </summary>
            <div className="mt-3 space-y-4">
              {sections.map((section, sidx) => (
                <div key={`${pillar.nav}-section-${sidx}`}>
                  {section.title && (
                    <p className="mb-1.5 text-xs font-medium tracking-wide text-text-muted uppercase">
                      {section.title}
                    </p>
                  )}
                  <ul className="space-y-1 border-l border-border pl-3">
                    {section.pages.map((page) => {
                      const href = `${DOCS_BASE_PATH}${page.slug}`;
                      const isActive = currentPath === href || currentPath === `${href}/`;

                      return (
                        <li key={page.slug}>
                          <NextLink
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                              'block py-1 text-sm transition-colors',
                              isActive
                                ? '-ml-3 border-l border-link pl-3 text-link'
                                : 'text-text-secondary hover:text-text-primary'
                            )}
                            href={href}
                            onClick={handleClick}
                          >
                            {page.title}
                          </NextLink>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
};

DocsNav.propTypes = {
  currentPath: PropTypes.string,
  navigation: PropTypes.arrayOf(PropTypes.shape({})),
  onNavigate: PropTypes.func,
};

DocsNav.defaultProps = {
  currentPath: '',
  navigation: [],
  onNavigate: undefined,
};

export default DocsNav;
