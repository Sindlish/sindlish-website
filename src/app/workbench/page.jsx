import { WorkbenchPane } from 'components/pages/workbench';
import { DOCS_HOME_SLUG } from 'constants/docs';
import LINKS from 'constants/links';
import getMetadata from 'utils/get-metadata';

// /workbench is the landing state: docs pane on the introduction page, editor
// beside it. It is noindex — the matching docs page owns the canonical.
export const generateMetadata = () =>
  getMetadata({
    title: 'Workbench - Sindlish',
    description: 'Read the Sindlish docs and run Sindlish side by side.',
    pathname: LINKS.workbench,
    noindex: true,
  });

const WorkbenchPage = () => <WorkbenchPane slug={DOCS_HOME_SLUG} />;

export default WorkbenchPage;
