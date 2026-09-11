import fs from 'fs/promises';
import os from 'os';
import path from 'path';

import { describe, it, expect } from 'vitest';

import {
  processFile,
  buildNavigationMap,
  buildNavigationFooter,
  buildPageHeader,
} from './process-md-for-llms.js';

// Test specific component conversions with inline MDX
describe('MDX to Markdown Conversion', () => {
  // Helper to process inline MDX content
  async function processInlineMdx(mdxContent, pageUrl = 'https://sindlish.org/test', rootDir) {
    const tempPath = path.join(os.tmpdir(), 'test-mdx-conversion.md');
    const fullContent = `---
title: Test
---

${mdxContent}`;
    await fs.writeFile(tempPath, fullContent);
    return processFile(tempPath, pageUrl, rootDir);
  }

  it('should convert Admonition to bold label', async () => {
    const result = await processInlineMdx(`
<Admonition type="warning">
Be careful with this setting.
</Admonition>
`);
    expect(result).toContain('**Warning:**');
    expect(result).toContain('Be careful with this setting.');
    expect(result).not.toContain('<Admonition');
  });

  it('should convert DetailIconCards to bullet list with descriptions', async () => {
    const result = await processInlineMdx(`
<DetailIconCards>
<a href="/docs/basics/variables" description="Learn about Sindlish variables">Variables Guide</a>
<a href="/docs/basics/loops" description="Learn about Sindlish loops">Loops Guide</a>
</DetailIconCards>
`);
    expect(result).toContain(
      '- [Variables Guide](https://sindlish.org/docs/basics/variables): Learn about Sindlish variables'
    );
    expect(result).toContain(
      '- [Loops Guide](https://sindlish.org/docs/basics/loops): Learn about Sindlish loops'
    );
  });

  it('should remove CopyPrompt and NeedHelp', async () => {
    const result = await processInlineMdx(`
Some content here.

<CopyPrompt src="/prompts/test.md" />

More content.

<NeedHelp/>
`);
    expect(result).toContain('Some content here.');
    expect(result).toContain('More content.');
    expect(result).not.toContain('CopyPrompt');
    expect(result).not.toContain('NeedHelp');
  });

  it('should preserve details/summary as HTML', async () => {
    const result = await processInlineMdx(`
<details>
<summary>**Click to expand**</summary>

Hidden content here.

</details>
`);
    expect(result).toContain('<details>');
    expect(result).toContain('<summary>');
    expect(result).toContain('</details>');
    expect(result).toContain('Hidden content here.');
  });

  it('should convert TechCards using title attribute (not children text)', async () => {
    const result = await processInlineMdx(`
<TechCards>
<a href="/docs/basics/variables" title="Variables" description="Learn about Sindlish variables" icon="code"></a>
<a href="/docs/basics/loops" title="Loops" description="Learn about Sindlish loops" icon="repeat"></a>
</TechCards>
`);
    expect(result).toContain(
      '- [Variables](https://sindlish.org/docs/basics/variables): Learn about Sindlish variables'
    );
    expect(result).toContain(
      '- [Loops](https://sindlish.org/docs/basics/loops): Learn about Sindlish loops'
    );
    expect(result).not.toContain('<TechCards');
  });

  it('should extract InfoBlock children', async () => {
    const result = await processInlineMdx(`
<InfoBlock>

Some important information.

</InfoBlock>
`);
    expect(result).toContain('Some important information.');
    expect(result).not.toContain('<InfoBlock');
  });

  it('should convert DocsList to title and bullet list', async () => {
    const result = await processInlineMdx(`
<DocsList title="What you will learn:">
<a href="/docs/basics/variables">Sindlish variables</a>
</DocsList>
`);
    expect(result).toContain('**What you will learn:**');
    expect(result).toContain('[Sindlish variables](https://sindlish.org/docs/basics/variables)');
  });

  it('should convert CheckList and CheckItem', async () => {
    const result = await processInlineMdx(`
<CheckList title="Deployment checklist">

<CheckItem title="Configure SSL" href="#ssl">
Enable SSL for secure connections.
</CheckItem>

</CheckList>
`);
    expect(result).toContain('## Deployment checklist');
    expect(result).toContain('[Configure SSL]');
    expect(result).toContain('Enable SSL for secure connections.');
  });

  it('should remove CTA, Video, UserButton, RequestForm, Suspense', async () => {
    const result = await processInlineMdx(`
Content before.

<CTA title="Get started" href="/signup">Sign up now</CTA>

<Video />

<UserButton />

<RequestForm />

<Suspense>Loading...</Suspense>

Content after.
`);
    expect(result).toContain('Content before.');
    expect(result).toContain('Content after.');
    expect(result).not.toContain('<CTA');
    expect(result).not.toContain('<Video');
    expect(result).not.toContain('<UserButton');
    expect(result).not.toContain('<RequestForm');
    expect(result).not.toContain('<Suspense');
  });

  it('should convert TwoColumnLayout.Item with title and method', async () => {
    const result = await processInlineMdx(`
<TwoColumnLayout>

<TwoColumnLayout.Item title="Installation" method="npm install pkg">

Install the package using npm.

</TwoColumnLayout.Item>

</TwoColumnLayout>
`);
    expect(result).toContain('## Installation');
    expect(result).toContain('Method: `npm install pkg`');
    expect(result).toContain('Install the package using npm.');
  });

  // Test URL conversion
  describe('URL conversion', () => {
    async function processInlineMdx(mdxContent, pageUrl = 'https://sindlish.org/docs/test') {
      const tempPath = path.join(os.tmpdir(), 'test-mdx-conversion.md');
      await fs.writeFile(tempPath, `---\ntitle: Test\n---\n${mdxContent}`);
      return processFile(tempPath, pageUrl);
    }

    it('should convert relative URLs to absolute', async () => {
      const result = await processInlineMdx(`
See the [variables guide](/docs/basics/variables) for more info.
`);
      expect(result).toContain('[variables guide](https://sindlish.org/docs/basics/variables)');
    });

    it('should convert anchor links to full URL with anchor', async () => {
      const result = await processInlineMdx(
        `
See [syntax issues](#syntax-issues) below.
`,
        'https://sindlish.org/docs/basics/variables'
      );
      expect(result).toContain(
        '[syntax issues](https://sindlish.org/docs/basics/variables#syntax-issues)'
      );
    });

    it('should preserve external URLs', async () => {
      const result = await processInlineMdx(`
See the [Sindlish docs](https://sindlish.org/docs).
`);
      expect(result).toContain('[Sindlish docs](https://sindlish.org/docs)');
    });
  });

  // Test recently added components
  describe('Additional component conversions', () => {
    async function processInlineMdx(mdxContent, pageUrl = 'https://sindlish.org/test') {
      const tempPath = path.join(os.tmpdir(), 'test-mdx-conversion.md');
      const fullContent = `---
title: Test
---

${mdxContent}`;
      await fs.writeFile(tempPath, fullContent);
      return processFile(tempPath, pageUrl);
    }

    it('should convert MegaLink to descriptive link', async () => {
      const result = await processInlineMdx(`
<MegaLink tag="Fast language" title="Sindlish compiles quickly." url="https://sindlish.org/features" />
`);
      expect(result).toContain('**Fast language**');
      expect(result).toContain('Sindlish compiles quickly.');
      expect(result).toContain('[Learn more](https://sindlish.org/features)');
      expect(result).not.toContain('<MegaLink');
    });

    it('should convert QuoteBlock with string slug to blockquote with title-cased name', async () => {
      const result = await processInlineMdx(`
<QuoteBlock quote="Sindlish is amazing for learning." author="jane-doe" role="CTO at Startup" />
`);
      expect(result).toContain('> Sindlish is amazing for learning.');
      expect(result).toContain('> — Jane Doe, CTO at Startup');
      expect(result).not.toContain('jane-doe');
      expect(result).not.toContain('<QuoteBlock');
    });

    it('should resolve QuoteBlock slug from quote-block.jsx map', async () => {
      const result = await processInlineMdx(
        `
<QuoteBlock quote="Fast compilation." author="lincoln-bergeson" role="Infrastructure Engineer at Replit" />
`,
        'https://sindlish.org/test',
        process.cwd()
      );
      expect(result).toContain('> — Lincoln Bergeson, Infrastructure Engineer at Replit');
      expect(result).not.toContain('lincoln-bergeson');
    });

    it('should convert QuoteBlock with object author', async () => {
      const result = await processInlineMdx(`
<QuoteBlock quote="Clear syntax is great." author={{ name: 'Jane Doe', company: 'Acme Corp' }} />
`);
      expect(result).toContain('> Clear syntax is great.');
      expect(result).toContain('> — Jane Doe, Acme Corp');
      expect(result).not.toContain('name:');
      expect(result).not.toContain('<QuoteBlock');
    });

    it('should include QuoteBlock link prop as case study link', async () => {
      const result = await processInlineMdx(`
<QuoteBlock quote="Scales well." author="some-person" role="Engineer" link="/blog/case-study" />
`);
      expect(result).toContain('[Read case study](https://sindlish.org/blog/case-study)');
    });

    it('should convert Testimonial to blockquote', async () => {
      const result = await processInlineMdx(`
<Testimonial
  text="Great programming language!"
  author={{
    name: 'John Smith',
    company: 'Tech Corp',
  }}
/>
`);
      expect(result).toContain('> Great programming language!');
      expect(result).toContain('> — John Smith, Tech Corp');
      expect(result).not.toContain('<Testimonial');
    });

    it('should extract FeatureList children', async () => {
      const result = await processInlineMdx(`
<FeatureList icons={['code', 'book']}>

### Readable syntax

Sindlish code reads like natural language.

### Easy to learn

Beginners can pick it up quickly.

</FeatureList>
`);
      expect(result).toContain('### Readable syntax');
      expect(result).toContain('Sindlish code reads like natural language.');
      expect(result).toContain('### Easy to learn');
      expect(result).not.toContain('<FeatureList');
    });

    it('should convert YoutubeIframe to YouTube link', async () => {
      const result = await processInlineMdx(`
<YoutubeIframe embedId="dQw4w9WgXcQ" />
`);
      expect(result).toContain('[Watch on YouTube](https://youtube.com/watch?v=dQw4w9WgXcQ)');
      expect(result).not.toContain('<YoutubeIframe');
    });

    it('should convert CommunityBanner to link', async () => {
      const result = await processInlineMdx(`
<CommunityBanner buttonText="Join Discord" buttonUrl="https://discord.gg/sindlish">
Join our community!
</CommunityBanner>
`);
      expect(result).toContain('Join our community!');
      expect(result).toContain('[Join Discord](https://discord.gg/sindlish)');
      expect(result).not.toContain('<CommunityBanner');
    });

    it('should convert PromptCards to list of links', async () => {
      const result = await processInlineMdx(`
<PromptCards>
<a title="Basics" promptSrc="/prompts/basics.md" />
<a title="Data Structures" promptSrc="/prompts/data-structures.md" />
</PromptCards>
`);
      expect(result).toContain('**AI Coding Prompts:**');
      expect(result).toContain('[Basics prompt](https://sindlish.org/prompts/basics.md)');
      expect(result).toContain(
        '[Data Structures prompt](https://sindlish.org/prompts/data-structures.md)'
      );
      expect(result).not.toContain('<PromptCards');
    });

    it('should convert Tabs with labels', async () => {
      const result = await processInlineMdx(`
<Tabs labels={["JavaScript", "Python"]}>
<TabItem>

\`\`\`js
console.log('hello');
\`\`\`

</TabItem>
<TabItem>

\`\`\`python
print('hello')
\`\`\`

</TabItem>
</Tabs>
`);
      expect(result).toContain('**JavaScript**');
      expect(result).toContain('**Python**');
      expect(result).toContain("console.log('hello')");
      expect(result).toContain("print('hello')");
      expect(result).not.toContain('<Tabs');
      expect(result).not.toContain('<TabItem');
    });

    it('should remove ignored components', async () => {
      const result = await processInlineMdx(`
Content before.

<LogosSection logos={['company1', 'company2']} />

<ComputeCalculator />

<UseCaseContext />

<SqlToRestConverter />

Content after.
`);
      expect(result).toContain('Content before.');
      expect(result).toContain('Content after.');
      expect(result).not.toContain('<LogosSection');
      expect(result).not.toContain('<ComputeCalculator');
      expect(result).not.toContain('<UseCaseContext');
      expect(result).not.toContain('<SqlToRestConverter');
    });

    it('should handle unknown components with attributes', async () => {
      const result = await processInlineMdx(`
<UnknownWidget foo="bar" baz="qux" />
`);
      // Should show component name and attributes
      expect(result).toContain('[UnknownWidget]');
      expect(result).toContain('foo: bar');
      expect(result).toContain('baz: qux');
    });

    it('should strip Shiki code annotations', async () => {
      const result = await processInlineMdx(`
\`\`\`javascript
import { foo } from 'bar'; // [!code ++]
const x = 1; // [!code --]
const y = 2; // [!code highlight]
\`\`\`
`);
      expect(result).toContain("import { foo } from 'bar';");
      expect(result).not.toContain('[!code');
    });

    it('should preserve br tags for table line breaks', async () => {
      const result = await processInlineMdx(`
| Header |
|--------|
| Line1<br/>Line2 |
`);
      expect(result).toContain('<br/>');
    });

    it('should use --- for horizontal rules', async () => {
      const result = await processInlineMdx(`
Above the line.

---

Below the line.
`);
      expect(result).toContain('---');
      expect(result).not.toContain('***');
    });
  });

  // Test that we don't over-escape
  describe('No over-escaping', () => {
    async function processInlineMdx(mdxContent) {
      const tempPath = path.join(os.tmpdir(), 'test-mdx-conversion.md');
      await fs.writeFile(tempPath, `---\ntitle: Test\n---\n${mdxContent}`);
      return processFile(tempPath);
    }

    it('should not escape backticks in text', async () => {
      const result = await processInlineMdx(`
Use the \`CONN_MAX_AGE\` setting.
`);
      expect(result).toContain('`CONN_MAX_AGE`');
      expect(result).not.toContain('\\`');
    });

    it('should not escape underscores in link text', async () => {
      const result = await processInlineMdx(`
See [CONN_MAX_AGE](https://example.com).
`);
      expect(result).toContain('[CONN_MAX_AGE]');
      expect(result).not.toContain('\\_');
    });
  });

  // Test index pointer
  describe('Index pointer', () => {
    it('should not include index pointer in processFile output (moved to page header)', async () => {
      const tempPath = path.join(os.tmpdir(), 'test-mdx-conversion.md');
      await fs.writeFile(tempPath, `---\ntitle: Test Page\n---\nSome content here.`);
      const result = await processFile(tempPath);

      // Index pointer is no longer in processFile -- it's added by addNavigationContext
      expect(result).not.toContain('llms.txt');
      expect(result).toContain('# Test Page');
      expect(result).toContain('Some content here.');
    });
  });

  // Test navigation map and footer
  describe('Navigation footer', () => {
    it('should build navigation map from real navigation.yaml', () => {
      const rootDir = process.cwd();
      const navMap = buildNavigationMap(rootDir);

      // Should have entries
      expect(navMap.size).toBeGreaterThan(0);

      // Check a known page from docs navigation
      const connectEntry = navMap.get('get-started/installation');
      expect(connectEntry).toBeDefined();
      expect(connectEntry.sectionName).toBeTruthy();
      expect(connectEntry.siblings.length).toBeGreaterThan(0);
      expect(connectEntry.urlPrefix).toBe('docs');
    });

    it('should generate footer with sibling links', () => {
      const navMap = new Map();
      navMap.set('basics/variables', {
        sectionName: 'Language Guide',
        urlPrefix: 'docs',
        siblings: [
          { title: 'Comments', slug: 'basics/comments' },
          { title: 'Math & Logic', slug: 'basics/math' },
        ],
      });

      const footer = buildNavigationFooter('basics/variables', navMap);

      expect(footer).toContain('## Related docs (Language Guide)');
      expect(footer).toContain('- [Comments](https://sindlish.org/docs/basics/comments)');
      expect(footer).toContain('- [Math & Logic](https://sindlish.org/docs/basics/math)');
      expect(footer).toContain('---');
    });

    it('should omit current page from footer', () => {
      const navMap = new Map();
      navMap.set('basics/variables', {
        sectionName: 'Language Guide',
        urlPrefix: 'docs',
        siblings: [{ title: 'Comments', slug: 'basics/comments' }],
      });

      const footer = buildNavigationFooter('basics/variables', navMap);

      // Should NOT contain the current page
      expect(footer).not.toContain('variables)');
    });

    it('should return empty string for pages not in map', () => {
      const navMap = new Map();
      const footer = buildNavigationFooter('nonexistent/page', navMap);
      expect(footer).toBe('');
    });

    it('should return empty string for pages with no siblings', () => {
      const navMap = new Map();
      navMap.set('solo/page', {
        sectionName: 'Solo Section',
        urlPrefix: 'docs',
        siblings: [],
      });

      const footer = buildNavigationFooter('solo/page', navMap);
      expect(footer).toBe('');
    });

    it('should store breadcrumbs in navigation map entries', () => {
      const rootDir = process.cwd();
      const navMap = buildNavigationMap(rootDir);

      const connectEntry = navMap.get('get-started/installation');
      expect(connectEntry).toBeDefined();
      expect(connectEntry.breadcrumbs).toBeDefined();
      expect(Array.isArray(connectEntry.breadcrumbs)).toBe(true);
      expect(connectEntry.breadcrumbs.length).toBeGreaterThan(0);
    });
  });

  describe('Page header', () => {
    it('should include location and index for pages in nav map', () => {
      const navMap = new Map();
      navMap.set('basics/variables', {
        sectionName: 'Language Guide',
        urlPrefix: 'docs',
        siblings: [],
        breadcrumbs: ['Documentation', 'Language Guide'],
        pageTitle: 'Variables & Types',
      });

      const header = buildPageHeader('basics/variables', navMap, 'docs/basics/variables.md');
      expect(header).toBe(
        '> This page location: Documentation > Language Guide > Variables & Types\n' +
          '> Full Sindlish documentation index: https://sindlish.org/docs/llms.txt\n\n'
      );
    });

    it('should include only index line for pages not in map', () => {
      const navMap = new Map();
      const header = buildPageHeader('nonexistent/page', navMap);
      expect(header).toBe(
        '> Full Sindlish documentation index: https://sindlish.org/docs/llms.txt\n\n'
      );
    });

    it('should include only index line for pages with empty breadcrumbs', () => {
      const navMap = new Map();
      navMap.set('top-level/page', {
        sectionName: 'Section',
        urlPrefix: 'docs',
        siblings: [],
        breadcrumbs: [],
      });

      const header = buildPageHeader('top-level/page', navMap);
      expect(header).toBe(
        '> Full Sindlish documentation index: https://sindlish.org/docs/llms.txt\n\n'
      );
    });

    it('should include only index line when navMap is null', () => {
      const header = buildPageHeader('any/page', null);
      expect(header).toBe(
        '> Full Sindlish documentation index: https://sindlish.org/docs/llms.txt\n\n'
      );
    });

    it('should include only index line when slug is null', () => {
      const navMap = new Map();
      const header = buildPageHeader(null, navMap);
      expect(header).toBe(
        '> Full Sindlish documentation index: https://sindlish.org/docs/llms.txt\n\n'
      );
    });

    it('should deduplicate consecutive identical ancestors', () => {
      const navMap = new Map();
      navMap.set('test/page', {
        sectionName: 'Sub',
        urlPrefix: 'docs',
        siblings: [],
        breadcrumbs: ['Parent', 'Parent', 'Sub'],
        pageTitle: 'My Page',
      });

      const header = buildPageHeader('test/page', navMap);
      expect(header).toContain('> This page location: Parent > Sub > My Page');
      expect(header).toContain('> Full Sindlish documentation index:');
    });

    it('should not duplicate trailing pageTitle when it matches last breadcrumb', () => {
      const navMap = new Map();
      navMap.set('reference/keywords', {
        sectionName: 'Reference',
        urlPrefix: 'docs',
        siblings: [],
        breadcrumbs: ['Reference'],
        pageTitle: 'Reference',
      });

      const header = buildPageHeader('reference/keywords', navMap);
      // Should be "Reference" NOT "Reference > Reference"
      expect(header).toContain('> This page location: Reference\n');
      expect(header).not.toContain('Reference > Reference');
    });

    it('should generate correct header for real navigation data', () => {
      const rootDir = process.cwd();
      const navMap = buildNavigationMap(rootDir);

      const header = buildPageHeader('basics/variables', navMap);
      expect(header).toContain('> This page location:');
      expect(header).toContain(
        '> Full Sindlish documentation index: https://sindlish.org/docs/llms.txt'
      );
    });

    it('should not produce redundant breadcrumbs for real nav entries', () => {
      const rootDir = process.cwd();
      const navMap = buildNavigationMap(rootDir);

      // reference/keywords has "Reference" as section and "All Keywords" as title
      const keywordsHeader = buildPageHeader('reference/keywords', navMap);
      expect(keywordsHeader).not.toContain('All Keywords > All Keywords');
      expect(keywordsHeader).toContain('> This page location:');
    });
  });

  describe('Component conversion test page (snapshot)', () => {
    it('should convert every component without raw MDX leaks', async () => {
      const fixturePath = 'src/scripts/fixtures/mdx-conversion-test.md';
      const pageUrl = 'https://sindlish.org/docs/test/mdx-conversion-test';
      const result = await processFile(fixturePath, pageUrl, process.cwd());

      // No raw MDX component tags should survive conversion
      const componentNames = [
        'Admonition',
        'CodeTabs',
        'Tabs',
        'TabItem',
        'Steps',
        'DetailIconCards',
        'TechCards',
        'DocsList',
        'InfoBlock',
        'DefinitionList',
        'CheckList',
        'CheckItem',
        'CTA',
        'TwoColumnLayout',
        'LinkPreview',
        'YoutubeIframe',
        'CommunityBanner',
        'PromptCards',
        'MegaLink',
        'QuoteBlock',
        'Testimonial',
        'FeatureList',
        'ProgramForm',
        'FeatureBeta',
        'EarlyAccess',
        'FeatureBetaProps',
        'EarlyAccessProps',
        'AgentSkillsTip',
        'MCPTools',
        'LinkAPIKey',
        'LRNotice',
        'ComingSoon',
        'PrivatePreview',
        'PrivatePreviewEnquire',
        'PublicPreview',
        'LRBeta',
        'MigrationAssistant',
        'NextSteps',
        'NewPricing',
        'AzureRegionsDeprecation',
        'ConsumptionAccountApiDeprecation',
        'CopyPrompt',
        'NeedHelp',
        'Comment',
        'Video',
        'UserButton',
        'RequestForm',
        'Suspense',
        'SqlToRestConverter',
        'LogosSection',
        'ComputeCalculator',
        'UseCaseContext',
      ];

      for (const name of componentNames) {
        expect(result).not.toContain(`<${name}`);
      }

      expect(result).toMatchSnapshot();
    });
  });
});
