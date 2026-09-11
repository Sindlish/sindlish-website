---
description: 'Golden corpus of exemplary documentation for style, tone, and writing convention reference'
---

# Golden Corpus: Documentation Examples

This curated list contains exemplary documentation files that demonstrate the project's preferred style, tone, and writing conventions. Use these as reference examples for few-shot prompting when generating content of similar types.

## Purpose

Agents should identify the content type of their task and reference the corresponding golden corpus examples to:

- Match the project's writing style and tone (clear, concise, developer-friendly)
- Follow established structural patterns
- Use consistent terminology and voice
- Apply appropriate formatting and MDX components
- Ensure technical accuracy and completeness
- Create scannable, human-friendly documentation

## Content Type Examples

**Note**: All file paths below are relative to the project root. For example, to read a demo, use: `Read("content/docs/basics/variables.md")`

### Tutorial Content

**Use these for**: Hands-on learning, progressive tutorials, step-by-step guides with exercises

- `content/docs/get-started/installation.md` - Progressive setup walkthrough with real examples
  - **Exemplary features**: Clear prerequisites, step-by-step instructions, code highlighting with markers, verification steps
- `content/docs/data-structures/lists.md` - Data structure tutorial through experimentation
  - **Exemplary features**: Learning through examples, visual explanations, before/after code comparisons, hands-on exercises

### Getting Started Guides

**Use these for**: Onboarding, toolchain setup, initial configuration

- `content/docs/vscode-extension.md` - Editor tooling setup guide
  - **Exemplary features**: Installation walkthrough, feature overview, concrete configuration examples, troubleshooting
- `content/docs/basics/math.md` - Core language feature introduction
  - **Exemplary features**: Clear operator tables, code examples for each operation, progressive examples, common pitfalls

### Concept and Overview Pages

**Use these for**: Feature explanations, conceptual understanding, language overviews

- `content/docs/introduction.md` - Language overview with structure
  - **Exemplary features**: Clear definition, visual diagrams where helpful, multiple use case workflows, plan/feature comparison
- `content/docs/intermediate/functions.md` - Core language concept with practical examples
  - **Exemplary features**: Syntax definition, before/after code comparison, concrete use cases, limitations transparency

### How-To Guides

**Use these for**: Task-oriented instructions, specific operations, configuration steps

- `content/docs/data-structures/sets.md` - Simple, focused reference guide
  - **Exemplary features**: Clear problem statement, example dataset, code examples, concrete use cases, results verification
- `content/docs/basics/comments.md` - Configuration guide with practical tips
  - **Exemplary features**: Multiple usage patterns, default values table, practical guidance, tip admonition boxes

### Reference Documentation

**Use these for**: Technical specifications, language reference, comprehensive syntax details

- `content/docs/reference/standard-library.md` - Technical reference with comprehensive tables
  - **Exemplary features**: Problem-solution structure, comprehensive function tables, syntax rules, limitations section, troubleshooting guidance
- `content/docs/reference/keywords.md` - Language keywords reference
  - **Exemplary features**: Comprehensive keyword table, exact syntax rules, configuration examples showing both good and bad patterns

### Index and Hub Pages

**Use these for**: Topic organization, navigation pages, content collections

- `content/docs/README.md` - Topic hub with organized navigation
  - **Exemplary features**: Hub-and-spoke layout to docs, organized progression from concepts to reference, links to all doc categories

## Usage Guidelines

1. **Identify content type** first based on your task requirements
2. **Select corresponding examples** from the appropriate category above
3. **Load and analyze** the example content for style patterns using the Read tool
4. **Apply similar structure** and tone to your generated content
5. **Maintain consistency** with project terminology and voice
6. **Use MDX components** appropriately (CodeTabs, Steps, Admonition, DetailIconCards, InfoBlock)

## Documentation Best Practices

When referencing these examples, pay attention to:

### Structure and Scannability
- **Heading hierarchy** (H1 for page title, H2 for major sections, H3 for subsections, avoid H4+)
- **Scannable headings** that allow users to find information without excessive scrolling
- **Progressive disclosure** - start simple, introduce complexity gradually
- **Hub-and-spoke patterns** for organizing many related guides

### Visual Elements
- **Screenshots** for UI-based steps (numbered steps with arrows/highlights)
- **Architecture diagrams** for explaining system flows (JWT flow, webhook flow, etc.)
- **Code syntax highlighting** with `[!code highlight]` markers for emphasis
- **Embedded videos** for processes that benefit from motion
- **Before/after comparisons** for security or best practice teaching

### Code Examples
- **Complete, working examples** that can be copy-pasted (not just snippets)
- **CodeTabs component** for presenting alternatives (languages, drivers, approaches)
- **Multi-language examples** when relevant (JavaScript, Python, Go, etc.)
- **Environment configuration** clearly shown (`.env` files, connection strings)
- **Error handling** included in code samples

### Interactive Elements
- **Hands-on exercises** where readers implement something themselves
- **Test scenarios** with verification steps (SELECT COUNT queries, etc.)
- **Live demos** and working example repositories linked
- **CLI/API alternatives** in CodeTabs when UI instructions exist

### User Guidance
- **Prerequisites upfront** - exact requirements before starting
- **Related resources blocks** - InfoBlock at top with links to docs, external resources, sample repos
- **Tip/warning admonitions** for important notes and gotchas
- **Limitations sections** - transparently document what's not supported
- **Troubleshooting sections** - common error messages and solutions

### Security and Best Practices
- **Security-first approach** - teach RLS before CRUD operations
- **Real error messages** - show actual errors users will encounter
- **Common pitfalls** - warn about issues like search path with connection pooling
- **Connection patterns** - show proper resource management (pooling, persistence)

### Voice and Tone
- **Developer-friendly** - practical, concise, no marketing fluff
- **Clear and direct** - get to the point quickly
- **Present tense, active voice** - "You create a branch" not "A branch is created"
- **Authoritative but accessible** - technical depth appropriate for developers
- **Practical examples** - real-world use cases over abstract concepts

### Navigation and Linking
- **Cross-references** to related documentation
- **External documentation links** (to Prisma, Drizzle, framework docs, etc.)
- **Example repositories** on GitHub with working code
- **Decision frameworks** (flow charts, comparison tables) for complex choices

---

**Note**: Always load the actual content of relevant examples before generating new content to ensure accurate style matching and consistency with current documentation standards. The examples above represent the highest-quality documentation and should serve as templates for creating new pages.
