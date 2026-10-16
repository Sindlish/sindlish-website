import PropTypes from 'prop-types';

export const DocsSearch = ({
  id = 'docs-search',
  label = 'Search the docs',
  placeholder = 'Search',
}) => (
  <form
    action="/search"
    aria-label={label}
    className="mb-5 flex items-center gap-2 rounded-sm border border-border bg-surface-raised px-2 py-1.5"
    method="get"
    role="search"
  >
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
      aria-label={label}
      className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
      id={id}
      name="q"
      placeholder={placeholder}
      type="search"
    />
  </form>
);

DocsSearch.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
};

export default DocsSearch;
