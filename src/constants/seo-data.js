import LINKS from './links';

export const DEFAULT_IMAGE_PATH = '/images/og/default.png';

export default {
  index: {
    title: 'Sindlish — The First Sindhi Programming Language',
    description:
      'Write code in Sindhi. Sindlish is the first programming language that lets you code using Sindhi keywords, bringing software development to millions of Sindhi speakers.',
    pathname: '',
  },
  about: {
    title: 'About — Sindlish',
    description:
      'Learn about the Sindlish programming language project and the mission to bring coding to the Sindhi community.',
  },

  aboutUs: {
    title: 'About Us — Sindlish',
    description:
      'Meet the team behind Sindlish, the first programming language designed for Sindhi speakers.',
    pathname: LINKS.aboutUs,
  },
  blog: {
    title: 'Blog — Sindlish',
    description:
      'Read updates, tutorials, and announcements about the Sindlish programming language.',
    pathname: LINKS.blog,
  },
  guides: {
    title: 'Guides — Sindlish',
    description: 'Learn how to use Sindlish with our step-by-step guides.',
    pathname: LINKS.guides,
  },
  error: {
    title: 'Page Is Broken — Sindlish',
  },
  404: {
    title: 'Page Not Found — Sindlish',
  },
};

export const getBlogCategoryDescription = (category) => {
  switch (category) {
    case 'tutorials':
      return 'Step-by-step tutorials for learning Sindlish programming language. From beginner to advanced.';
    case 'updates':
      return 'Stay updated on the latest Sindlish language features, releases, and improvements.';
    case 'community':
      return 'Join the Sindlish community. Share your projects, ask questions, and connect with other Sindhi developers.';
    default:
      return 'Read the latest from the Sindlish programming language blog.';
  }
};
