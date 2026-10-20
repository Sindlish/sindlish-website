/* eslint-disable react/prop-types */
import { WorkbenchPane } from 'components/pages/workbench';
import { DOCS_DIR_PATH } from 'constants/content';
import LINKS from 'constants/links';
import { getPostBySlug } from 'utils/api-content';
import { getAllPosts } from 'utils/api-docs';
import getMetadata from 'utils/get-metadata';

// The pane is a real route: /workbench/docs/<slug> is what the back button and
// deep links speak. /workbench/docs (no slug) is the docs index in the pane.
export async function generateStaticParams() {
  const posts = await getAllPosts();

  if (!posts) return [];

  return posts.map(({ slug }) => ({ slug: slug.split('/') }));
}

export async function generateMetadata(props) {
  const params = await props.params;
  const slug = (params.slug || []).join('/');

  if (!slug) {
    return getMetadata({
      title: 'Workbench - Sindlish',
      description: 'Read the Sindlish docs and run Sindlish side by side.',
      pathname: LINKS.workbench,
      noindex: true,
    });
  }

  const post = getPostBySlug(slug, DOCS_DIR_PATH);
  if (!post) return getMetadata({ pathname: LINKS.workbench, noindex: true });

  // The pane is noindex; its canonical points at the matching /docs/* page.
  return getMetadata({
    title: `${post.data.title} - Sindlish`,
    description: post.data.summary,
    pathname: `${LINKS.docs}/${slug}`,
    noindex: true,
    canonical: true,
    type: 'article',
  });
}

const WorkbenchDocsPage = async (props) => {
  const params = await props.params;
  const slug = (params.slug || []).join('/');

  return <WorkbenchPane slug={slug} />;
};

export default WorkbenchDocsPage;
