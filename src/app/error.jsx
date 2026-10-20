'use client';

import PropTypes from 'prop-types';
import { useEffect } from 'react';

import QuietPage from 'components/pages/quiet';
import { ActionButton } from 'components/shared/action-link';
import Layout from 'components/shared/layout';
import { RUNTIME_ERROR } from 'constants/quiet-pages';
import SEO_DATA from 'constants/seo-data';

/*
  NOTE:
  This page is needed to handle unexpected errors and display fallback UI.
*/
const ErrorPage = ({ error, reset }) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <title>{SEO_DATA.error.title}</title>
      <meta name="robots" content="noindex" />

      <Layout isClient>
        <QuietPage {...RUNTIME_ERROR}>
          <ActionButton onClick={reset}>Try again</ActionButton>
        </QuietPage>
      </Layout>
    </>
  );
};

ErrorPage.propTypes = {
  error: PropTypes.object,
  reset: PropTypes.func,
};

export default ErrorPage;
