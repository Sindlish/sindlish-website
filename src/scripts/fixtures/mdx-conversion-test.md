---
title: MDX Conversion Test Page
subtitle: Exercises every component the processor handles
enableTableOfContents: true
---

## Admonition variants

<Admonition type="note">
This is a simple note with inline content.
</Admonition>

<Admonition type="warning" title="Breaking change">
The API endpoint has been deprecated.
</Admonition>

<Admonition type="tip">

- Step one
- Step two
- Step three

</Admonition>

<Admonition type="comingSoon">
This feature is coming soon.
</Admonition>

## CodeTabs

<CodeTabs labels={["Node.js", "Python"]}>

```javascript
const { Client } = require('pg');
const client = new Client(process.env.DATABASE_URL);
await client.connect();
```

```python
import psycopg2

conn = psycopg2.connect(os.environ["DATABASE_URL"])
```

</CodeTabs>

## Tabs and TabItem

<Tabs labels={["SQL", "CLI"]}>
<TabItem>

```sql
CREATE TABLE users (id SERIAL PRIMARY KEY, name TEXT);
```

</TabItem>
<TabItem>

```bash
sindlish run myprogram.sn
```

</TabItem>
</Tabs>

## Steps

<Steps>

### Create a project

Go to the terminal and create a new Sindlish project.

### Write your first program

Use the Sindlish syntax to write a simple program.

### Run your program

Execute your Sindlish program with the compiler.

</Steps>

## DetailIconCards

<DetailIconCards>
<a href="/docs/basics/variables" description="Learn about Sindlish variables">Variables</a>
<a href="/docs/basics/loops" description="Learn about Sindlish loops">Loops</a>
</DetailIconCards>

## TechCards

<TechCards>
<a href="/docs/basics/variables" title="Variables" description="Learn about Sindlish variables" icon="code"></a>
<a href="/docs/basics/loops" title="Loops" description="Learn about Sindlish loops" icon="repeat"></a>
</TechCards>

## DocsList

<DocsList title="Related guides:">
<a href="/docs/basics/variables">Sindlish variables</a>
<a href="/docs/intermediate/functions">Sindlish functions</a>
</DocsList>

## InfoBlock

<InfoBlock>

This is important information inside an InfoBlock. It can contain **bold text** and [links](/docs/introduction).

</InfoBlock>

## DefinitionList

<DefinitionList>

Compute Unit (CU)
: A measure of computing resources (CPU and RAM) allocated to a compute instance.

Endpoint
: The connection point for your service, providing the hostname and port for client connections.

</DefinitionList>

## CheckList and CheckItem

<CheckList title="Setup checklist">

<CheckItem title="Install Sindlish" href="#install">
Install the Sindlish compiler and tools.
</CheckItem>

<CheckItem title="Configure editor" href="#editor">
Set up your code editor with Sindlish support.
</CheckItem>

</CheckList>

## CTA

<CTA title="Get started with Sindlish" description="Install Sindlish and start coding." buttonText="Install" buttonUrl="https://sindlish.org/docs/get-started/installation" />

## TwoColumnLayout

<TwoColumnLayout>

<TwoColumnLayout.Item title="Installation" method="npm install sindlish">

Install the Sindlish compiler from npm.

</TwoColumnLayout.Item>

<TwoColumnLayout.Block label="Example">

```javascript
// Sindlish hello world
print("Hello, Sindlish!")
```

</TwoColumnLayout.Block>

<TwoColumnLayout.Step title="Configure environment">

Set the `DATABASE_URL` environment variable.

</TwoColumnLayout.Step>

<TwoColumnLayout.Footer>

For more details, see the [language documentation](/docs/reference/keywords).

</TwoColumnLayout.Footer>

</TwoColumnLayout>

## LinkPreview

Values must be provided in <LinkPreview href="https://tools.ietf.org/html/rfc3339" title="RFC 3339" preview="Date and Time on the Internet: Timestamps">RFC 3339 format</LinkPreview>.

## YoutubeIframe

<YoutubeIframe embedId="dQw4w9WgXcQ" />

## CommunityBanner

<CommunityBanner buttonText="Join Discord" buttonUrl="https://discord.gg/sindlish">Share your feedback</CommunityBanner>

## PromptCards

<PromptCards>
<a title="Basics" promptSrc="/prompts/basics.md"></a>
<a title="Data Structures" promptSrc="/prompts/data-structures.md"></a>
</PromptCards>

## MegaLink

<MegaLink tag="Case Study" title="Teams use Sindlish to teach programming effectively." url="https://sindlish.org/blog/sindlish-case-study" />

## QuoteBlock

<QuoteBlock
quote="Sindlish's clear syntax transformed our teaching workflow."
author={{
    name: 'Jane Smith',
    company: 'Acme Corp',
  }}
link="/blog/acme-case-study"
/>

## Testimonial

<Testimonial
text="The serverless scaling is exactly what we needed."
author={{
    name: 'John Doe',
    company: 'StartupCo',
  }}
/>

## FeatureList

<FeatureList icons={['code', 'book']}>

### Readable syntax

Sindlish code reads like natural language.

### Easy to learn

Beginners can pick it up quickly.

</FeatureList>

## ProgramForm

<ProgramForm type="agent" />

## Shared content components

### FeatureBeta (parameterless)

<FeatureBeta />

### EarlyAccess (parameterless)

<EarlyAccess />

### FeatureBetaProps (with prop)

<FeatureBetaProps feature_name="Autoscaling" />

### EarlyAccessProps (with prop)

<EarlyAccessProps feature_name="Schema Diff" />

### AgentSkillsTip (with prop)

<AgentSkillsTip skill_topic="branching" />

### MCPTools

<MCPTools />

### LinkAPIKey

<LinkAPIKey />

### LRNotice

<LRNotice />

### ComingSoon

<ComingSoon />

### PrivatePreview

<PrivatePreview />

### PrivatePreviewEnquire

<PrivatePreviewEnquire />

### PublicPreview

<PublicPreview />

### LRBeta

<LRBeta />

### MigrationAssistant

<MigrationAssistant />

### NextSteps

<NextSteps />

### NewPricing

<NewPricing />

### AzureRegionsDeprecation

<AzureRegionsDeprecation />

### ConsumptionAccountApiDeprecation

<ConsumptionAccountApiDeprecation />

## Ignored components

<CopyPrompt src="/prompts/test.md" />

<NeedHelp />

<Comment>This is an MDX comment that should be stripped.</Comment>

<Video />

<UserButton />

<RequestForm />

<Suspense>Loading fallback...</Suspense>

<SqlToRestConverter />

<LogosSection logos={['vercel', 'cloudflare']} />

<ComputeCalculator />

<UseCaseContext />

## HTML passthrough

<details>
<summary>**Expandable section**</summary>

Content inside a details/summary block that should pass through as HTML.

- Nested list item one
- Nested list item two

</details>

Inline link with description: <a href="https://example.com" description="An example site">Example</a>

Line break in a table:

| Feature   | Status               |
| --------- | -------------------- |
| Branching | GA<br/>Available now |

## Nested components (known edge case)

<Admonition type="note" title="Code example">

<CodeTabs labels={["JavaScript", "Python"]}>

```javascript
const result = sindlish("hello world");
```

```python
conn = psycopg2.connect(os.environ["DATABASE_URL"])
```

</CodeTabs>

</Admonition>

## Markdown fundamentals

Regular paragraph with **bold**, _italic_, `inline code`, and a [link](/docs/introduction).

> A standard blockquote.

1. Ordered item one
2. Ordered item two

- Unordered item one
- Unordered item two

```sql
SELECT * FROM users WHERE active = true;
```

| Column | Type   | Description |
| ------ | ------ | ----------- |
| id     | serial | Primary key |
| name   | text   | User's name |
