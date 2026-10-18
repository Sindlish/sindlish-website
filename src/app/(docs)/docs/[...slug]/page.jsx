/* eslint-disable react/prop-types */
import path from 'node:path';

import { notFound } from 'next/navigation';

import Post from 'components/pages/doc/post';
import JsonLd from 'components/shared/json-ld';
import { DOCS_DIR_PATH } from 'constants/content';
import LINKS from 'constants/links';
import { getSiteUrl } from 'constants/seo-data';
import { getArticleSchema } from 'lib/schema';
import { getPostBySlug } from 'utils/api-content';
import { getAllPosts, getNavigationLinks, getNavigation } from 'utils/api-docs';
import { getFileLastModified } from 'utils/file-last-modified';
import { getBreadcrumbs } from 'utils/get-breadcrumbs';
import { getFlatSidebar } from 'utils/get-flat-sidebar';
import buildMetadata from 'utils/get-metadata';

const isUnusedOrSharedContent = (slug) =>
  slug.includes('unused/') ||
  slug.includes('shared-content/') ||
  slug.includes('README') ||
  slug.includes('GUIDE_TEMPLATE');

const docsSourceModified = (slug) =>
  getFileLastModified(
    path.join(process.cwd(), 'content', 'docs', `${slug}.md`).split(path.sep).join('/')
  ) || undefined;

export async function generateStaticParams() {
  const posts = await getAllPosts();

  if (!posts) return notFound();

  return posts.map(({ slug }) => {
    const slugsArray = slug.split('/');

    return {
      slug: slugsArray,
    };
  });
}

export async function generateMetadata(props) {
  const params = await props.params;
  const { slug } = params;
  const currentSlug = slug.join('/');

  if (isUnusedOrSharedContent(currentSlug)) return notFound();

  const post = getPostBySlug(currentSlug, DOCS_DIR_PATH);

  if (!post) return notFound();

  const title = post?.data?.title;
  const encodedTitle = Buffer.from(title).toString('base64');

  const sidebar = getNavigation();
  const flatSidebar = await getFlatSidebar(sidebar);
  const breadcrumbs = getBreadcrumbs(currentSlug, flatSidebar);
  const category = breadcrumbs.length > 0 ? breadcrumbs[0].title : '';
  const encodedCategory = category && Buffer.from(category).toString('base64');

  return buildMetadata({
    title,
    // Docs descriptions come from the authored summary; the excerpt generator is gone.
    description: post?.data?.summary,
    imagePath: `/docs/og?title=${encodedTitle}&category=${encodedCategory}`,
    pathname: `${LINKS.docs}/${currentSlug}`,
    markdownPath: `${LINKS.docs}/${currentSlug}.md`,
    noindex: Boolean(post?.data?.noindex),
    type: 'article',
    modifiedTime: docsSourceModified(currentSlug),
  });
}

const DocPost = async (props) => {
  const params = await props.params;
  const { slug } = params;
  const currentSlug = slug.join('/');

  if (isUnusedOrSharedContent(currentSlug)) return notFound();

  const sidebar = getNavigation();
  const flatSidebar = await getFlatSidebar(sidebar);

  const navigationLinks = getNavigationLinks(currentSlug, flatSidebar);

  const post = getPostBySlug(currentSlug, DOCS_DIR_PATH);
  if (!post) return notFound();

  const { data, content } = post;

  const encodedTitle = Buffer.from(data.title).toString('base64');
  const breadcrumbs = getBreadcrumbs(currentSlug, flatSidebar);
  const category = breadcrumbs.length > 0 ? breadcrumbs[0].title : '';
  const encodedCategory = category && Buffer.from(category).toString('base64');

  const jsonLd = getArticleSchema({
    siteUrl: getSiteUrl(),
    title: data.title,
    description: data.summary,
    pathname: `${LINKS.docs}/${currentSlug}`,
    imagePath: `/docs/og?title=${encodedTitle}&category=${encodedCategory}`,
    dateModified: docsSourceModified(currentSlug),
  });

  return (
    <>
      <JsonLd id="docs-json-ld" data={jsonLd} />
      <Post content={content} data={data} navigationLinks={navigationLinks} />
    </>
  );
};

export default DocPost;
