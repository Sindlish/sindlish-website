/* eslint-disable react/prop-types */
import { notFound } from 'next/navigation';

import Post from 'components/pages/doc/post';
import VERCEL_URL from 'constants/base';
import { DOCS_DIR_PATH } from 'constants/content';
import LINKS from 'constants/links';
import JsonLd from 'components/shared/json-ld';
import { getPostBySlug } from 'utils/api-content';
import { getAllPosts, getNavigationLinks, getNavigation } from 'utils/api-docs';
import { getBreadcrumbs } from 'utils/get-breadcrumbs';
import { getFlatSidebar } from 'utils/get-flat-sidebar';
import getMetadata from 'utils/get-metadata';

const isUnusedOrSharedContent = (slug) =>
  slug.includes('unused/') ||
  slug.includes('shared-content/') ||
  slug.includes('README') ||
  slug.includes('GUIDE_TEMPLATE');

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

  return getMetadata({
    title: `${title} - Sindlish Docs`,
    description: post.excerpt,
    imagePath: `${VERCEL_URL}/docs/og?title=${encodedTitle}&category=${encodedCategory}`,
    pathname: `${LINKS.docs}/${currentSlug}`,
    robotsNoindex: post?.data?.noindex ? 'noindex' : null,
    type: 'article',
    markdownPath: `/docs/${currentSlug}.md`,
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    author: {
      '@type': 'Organization',
      name: 'Sindlish Team',
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Post content={content} data={data} navigationLinks={navigationLinks} />
    </>
  );
};

export default DocPost;
