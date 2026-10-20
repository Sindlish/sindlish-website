import DocsIndex from 'components/pages/doc/docs-shell/docs-index';
import SEO_DATA from 'constants/seo-data';
import { getNavigation } from 'utils/api-docs';
import buildMetadata from 'utils/get-metadata';

// The real /docs landing page: every page in the docs, grouped by pillar.
// Server-rendered, no client JS beyond the shell — it reads with JS disabled.
export const metadata = buildMetadata(SEO_DATA.docs);

const DocsHomePage = () => {
  const navigation = getNavigation();

  return <DocsIndex navigation={navigation} />;
};

export default DocsHomePage;
