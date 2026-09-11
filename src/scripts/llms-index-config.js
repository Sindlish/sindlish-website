/**
 * Configuration for llms.txt index generation.
 *
 * HOW IT WORKS
 * The generator scans every content directory in CONTENT_ROUTES (src/constants/content.js).
 * Any new directory or .md file is automatically included — you never need to register new
 * pages here. This config only shapes the output: ordering, descriptions, exclusions, etc.
 *
 * MAINTENANCE
 * ~3-5 edits/year (new descriptions, reordering, new exclusions).
 * Build warnings flag stale entries (excludePaths matching nothing, empty sections, etc.)
 */

module.exports = {
  tagline:
    'Sindlish is a human-readable programming language designed for clarity and ease of learning. It uses natural language-inspired syntax to make code accessible to beginners and experts alike.',

  intro: [
    'Sindlish docs are available as markdown.',
    'Append `.md` to any doc URL or set `Accept: text/markdown`.',
    'This is the primary index. Sections with many pages show key pages and link to full sub-indexes.',
  ].join(' '),

  commonQueries: [
    {
      label: 'Install Sindlish',
      url: 'https://sindlish.org/docs/get-started/installation.md',
    },
    {
      label: 'Sindlish keywords reference',
      url: 'https://sindlish.org/docs/reference/keywords.md',
    },
    {
      label: 'Sindlish standard library',
      url: 'https://sindlish.org/docs/reference/standard-library.md',
    },
  ],

  sections: [
    {
      name: 'Introduction',
      description: 'Welcome to Sindlish, language overview, and getting started.',
    },
    {
      name: 'Get Started',
      description: 'Installation, setup, and your first Sindlish program.',
    },
    {
      name: 'Basics',
      description: 'Comments, variables, types, math, logic, conditions, and loops.',
    },
    {
      name: 'Intermediate',
      description: 'Functions and error handling.',
    },
    {
      name: 'Data Structures',
      description: 'Lists (fehrist), dictionaries (lughat), and sets (majmuo).',
    },
    {
      name: 'Reference',
      description: 'Keywords, standard library, and examples.',
    },
    {
      name: 'VS Code Extension',
      description: 'Editor support for Sindlish syntax highlighting and development.',
    },
  ],

  excludePaths: [],

  reclassify: {},

  reclassifyPrefixes: [],

  collapsedRoutes: {},

  additionalResources: [],

  fullText: {
    excludeRoutes: [],
    includeAdditionalResourcePaths: true,
  },
};
