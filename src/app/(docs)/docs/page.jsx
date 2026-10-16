import DocsIndex from 'components/pages/doc/docs-shell/docs-index';
import LINKS from 'constants/links';
import { getNavigation } from 'utils/api-docs';
import getMetadata from 'utils/get-metadata';

// The real /docs landing page: every page in the docs, grouped by pillar.
// Server-rendered, no client JS beyond the shell — it reads with JS disabled.
export const generateMetadata = () =>
  getMetadata({
    title: 'Documentation - Sindlish Docs',
    description: 'Every page in the Sindlish documentation, grouped by pillar.',
    pathname: LINKS.docs,
  });

const DocsHomePage = () => {
  const navigation = getNavigation();

  return <DocsIndex navigation={navigation} />;
};

export default DocsHomePage;
