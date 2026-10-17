/* eslint-disable react/prop-types */
import DocsShell from 'components/pages/doc/docs-shell/docs-shell';
import { getNavigation } from 'utils/api-docs';

const DocsLayout = ({ children }) => {
  const navigation = getNavigation();

  return <DocsShell navigation={navigation}>{children}</DocsShell>;
};

export default DocsLayout;
