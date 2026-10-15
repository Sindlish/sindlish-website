import QuietPage from 'components/pages/quiet';
import Layout from 'components/shared/layout';
import { NOT_FOUND } from 'constants/quiet-pages';
import SEO_DATA from 'constants/seo-data';

const NotFoundPage = () => (
  <>
    <meta httpEquiv="x-ua-compatible" content="ie=edge" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
    />
    <title>{SEO_DATA[404].title}</title>

    <Layout>
      <QuietPage {...NOT_FOUND} />
    </Layout>
  </>
);

export default NotFoundPage;
