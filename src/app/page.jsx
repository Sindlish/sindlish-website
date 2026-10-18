import Home from 'components/pages/home';
import Layout from 'components/shared/layout';
import SEO_DATA from 'constants/seo-data';
import buildMetadata from 'utils/get-metadata';

// `/` uses an absolute title so the root template does not double the site name.
export const metadata = buildMetadata({
  title: { absolute: SEO_DATA.index.title },
  description: SEO_DATA.index.description,
  pathname: SEO_DATA.index.pathname,
});

const Homepage = () => (
  <Layout isHeaderSticky isHeaderStickyOverlay>
    <Home />
  </Layout>
);

export default Homepage;

export const revalidate = false;
