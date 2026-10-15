import Home from 'components/pages/home';
import Layout from 'components/shared/layout';
import SEO_DATA from 'constants/seo-data';
import getMetadata from 'utils/get-metadata';

export const metadata = getMetadata(SEO_DATA.index);

const Homepage = () => (
  <Layout isHeaderSticky isHeaderStickyOverlay>
    <Home />
  </Layout>
);

export default Homepage;

export const revalidate = false;
