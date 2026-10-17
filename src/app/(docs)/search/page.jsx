/* eslint-disable react/prop-types */
import SearchExperience from 'components/pages/search/search-experience';

// Search results live on their own linkable route: /search?q=... renders
// server-side so the no-JS reader still gets ranked hits and a link to the
// /docs index floor. Client JS only adds instant re-filtering.
//
// noindex wiring is owned by the metadata/sitemap ticket (#55); kept local here
// so /search never competes with the docs it points at.
export const metadata = {
  title: 'Search',
  description: 'Search the Sindlish documentation.',
  robots: { index: false, follow: true },
};

const toQuery = (value) => {
  if (Array.isArray(value)) return value[0] || '';
  return typeof value === 'string' ? value : '';
};

const SearchPage = async ({ searchParams }) => {
  const params = await searchParams;
  const query = toQuery(params?.q);

  return <SearchExperience initialQuery={query} />;
};

export default SearchPage;
