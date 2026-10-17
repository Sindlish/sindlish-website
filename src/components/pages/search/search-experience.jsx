'use client';

import NextLink from 'next/link';
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';

import searchIndex from 'generated/search-index.json';
import { searchDocs } from 'utils/search-index';

const syncUrl = (query) => {
  if (typeof window === 'undefined') return;
  const next = query ? `/search?q=${encodeURIComponent(query)}` : '/search';
  window.history.replaceState(null, '', next);
};

const pluralize = (count) => (count === 1 ? 'result' : 'results');

export const SearchExperience = ({ initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const results = useMemo(() => searchDocs(searchIndex, query), [query]);
  const trimmedQuery = query.trim();

  const handleChange = (event) => {
    const next = event.target.value;
    setQuery(next);
    syncUrl(next.trim());
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    syncUrl(trimmedQuery);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Search</h1>
      <p className="mt-3 mb-8 text-base leading-normal text-text-secondary">
        Search the Sindlish documentation. Prose matches are tolerant of typos; identifiers written
        with call syntax such as <code>likh()</code> must match exactly.
      </p>

      <form
        action="/search"
        aria-label="Search the docs"
        className="flex items-center gap-2 rounded-sm border border-border bg-surface-raised px-3 py-2"
        method="get"
        onSubmit={handleSubmit}
        role="search"
      >
        <label className="sr-only" htmlFor="search-input">
          Search the docs
        </label>
        <svg
          aria-hidden="true"
          className="size-4 shrink-0 text-text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.6-3.6" />
        </svg>
        <input
          autoComplete="off"
          className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          id="search-input"
          name="q"
          onChange={handleChange}
          placeholder="Search the docs"
          type="search"
          value={query}
        />
        <button
          className="shrink-0 rounded-sm border border-border px-3 py-1 text-sm text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
          type="submit"
        >
          Search
        </button>
      </form>

      <p aria-live="polite" className="mt-6 mb-4 text-sm text-text-muted" role="status">
        {trimmedQuery
          ? `${results.length} ${pluralize(results.length)} for “${trimmedQuery}”`
          : 'Type a word to search the docs.'}
      </p>

      {trimmedQuery && results.length > 0 && (
        <ul className="border-t border-border">
          {results.map((result) => (
            <li key={result.slug} className="border-b border-border py-4">
              <NextLink
                className="text-base font-medium text-link transition-colors hover:text-link-hover"
                href={result.url}
              >
                {result.title}
              </NextLink>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                <span className="rounded-sm border border-border px-1.5 py-0.5">
                  {result.kind === 'code' ? 'Code' : 'Docs'}
                </span>
                {result.matchedTerms.length > 0 && (
                  <span>
                    matched{' '}
                    {result.matchedTerms.map((term, index) => (
                      <code className="mr-1 font-mono" key={`${result.slug}-${term}`}>
                        {term}
                        {index < result.matchedTerms.length - 1 ? ',' : ''}
                      </code>
                    ))}
                  </span>
                )}
              </p>
              {result.summary && (
                <p className="mt-2 text-sm leading-normal text-text-secondary">{result.summary}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {trimmedQuery && results.length === 0 && (
        <p className="text-sm leading-normal text-text-secondary">
          Nothing matched “{trimmedQuery}”. Every page is one link away in the docs index.
        </p>
      )}

      <p className="mt-8 text-sm text-text-secondary">
        <NextLink className="text-link transition-colors hover:text-link-hover" href="/docs">
          Browse the docs index
        </NextLink>{' '}
        — every page, grouped by pillar.
      </p>
    </div>
  );
};

SearchExperience.propTypes = {
  initialQuery: PropTypes.string,
};

SearchExperience.defaultProps = {
  initialQuery: '',
};

export default SearchExperience;
