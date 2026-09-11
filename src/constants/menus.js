import LINKS from './links';

export default {
  header: [
    {
      text: 'Docs',
      to: LINKS.docsHome,
    },
    {
      text: 'Examples',
      to: LINKS.examples,
    },
    {
      text: 'Playground',
      to: LINKS.playground,
    },
    {
      text: 'Creator',
      to: LINKS.creator,
    },
  ],
  footer: [
    {
      heading: 'Language',
      items: [
        {
          text: 'Introduction',
          to: LINKS.docsHome,
        },
        {
          text: 'Standard Library',
          to: LINKS.standardLibrary,
        },
        {
          text: 'Examples',
          to: LINKS.examples,
        },
        {
          text: 'VS Code Extension',
          to: LINKS.vscodeExtension,
        },
      ],
    },
    {
      heading: 'Resources',
      items: [
        {
          text: 'Playground',
          to: LINKS.playground,
        },
        {
          text: 'Creator',
          to: LINKS.creator,
        },
      ],
    },
    {
      heading: 'Community',
      items: [
        {
          text: 'GitHub',
          to: LINKS.github,
          icon: 'github-icon',
        },
      ],
    },
  ],
};
