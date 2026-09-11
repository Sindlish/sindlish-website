---
description: 'DEPRECATED — use /create-pr-report instead. Generate changelog from all repos using parallel extraction agents.'
---

# Changelog Triage Command (Agent-Based)

> **Deprecated.** `/create-pr-report` is the primary tool for generating the weekly PR report and changelog. This command still works but is no longer maintained. Use `/create-pr-report` for all new work.

You are the Changelog Orchestrator. Your job is to coordinate extraction agents, compile their analysis, and generate a publication-ready changelog.

## Architecture

**Phase 1: Extraction & Analysis (Parallel Agents)**
- Launch repo-specific agents in parallel
- Each agent extracts PRs and analyzes them autonomously
- Agents return structured summaries with triage decisions

**Phase 2: Compilation & Drafting (Main Claude)**
- Compile agent summaries into triage report
- Generate changelog draft using golden examples
- Present to user for review

## Usage

```
/triage-changelog              # All repos (default)
/triage-changelog core         # Language repo only
/triage-changelog docs         # Docs repo only
/triage-changelog core,docs    # Multiple repos
```

## Step 1: Determine Repositories to Process

Check if user provided repo selection, otherwise default to all.

**Available repositories:**
- `core` - Sindlish language repo (Sindlish/Sindlish)
- `docs` - Sindlish website/docs repo (current repository)

**Default:** Process all repositories

If no parameter provided, ask user: "Which repositories would you like to process? (core, docs, or all - default: all)"

Parse user response and set flags:
- `PROCESS_CORE=true/false`
- `PROCESS_DOCS=true/false`

## Step 2: Calculate Date Range

Calculate once for all repositories:

```bash
TODAY=$(date '+%Y-%m-%d')
DOW=$(date '+%u')

# Calculate last Friday (7 days ago if today is Friday, otherwise previous Friday)
if [ "$DOW" -eq 5 ]; then
  LAST_FRIDAY=$(date -v-7d '+%Y-%m-%d')
elif [ "$DOW" -gt 5 ]; then
  DAYS_BACK=$((DOW - 5))
  LAST_FRIDAY=$(date -v-"${DAYS_BACK}"d '+%Y-%m-%d')
else
  DAYS_BACK=$((DOW + 2))
  LAST_FRIDAY=$(date -v-"${DAYS_BACK}"d '+%Y-%m-%d')
fi

# Calculate publication date (today if Friday, otherwise next Friday)
if [ "$DOW" -eq 5 ]; then
  PUBLICATION_DATE="$TODAY"
else
  DAYS_UNTIL_FRIDAY=$(( (5 - DOW + 7) % 7 ))
  PUBLICATION_DATE=$(date -v+"${DAYS_UNTIL_FRIDAY}"d '+%Y-%m-%d')
fi

echo "=== CHANGELOG GENERATION ==="
echo "PR Date Range: $LAST_FRIDAY to $TODAY"
echo "Publication Date: $PUBLICATION_DATE"
echo "============================"
```

## Step 3: Setup Repository Paths and Output Directory

Detect repository locations and create dated output folder:

```bash
WEBSITE_REPO=$(pwd)
BASE_OUTPUT_DIR="/Users/$(whoami)/changelog_work"

# Create dated subfolder for this triage run
# This keeps all files for one release together and enables historical analysis
OUTPUT_DIR="$BASE_OUTPUT_DIR/$PUBLICATION_DATE"
mkdir -p "$OUTPUT_DIR"

echo "📁 Output directory: $OUTPUT_DIR"

# Auto-detect repositories
CORE_REPO="$HOME/Documents/GitHub/Sindlish"
DOCS_REPO="$HOME/Documents/GitHub/sindlish-website"

# Check if repos exist and warn if not
if [ "$PROCESS_CORE" = "true" ] && [ ! -d "$CORE_REPO" ]; then
  echo "⚠️  Core repo not found at $CORE_REPO"
fi
if [ "$PROCESS_DOCS" = "true" ] && [ ! -d "$DOCS_REPO" ]; then
  echo "⚠️  Docs repo not found at $DOCS_REPO"
fi

# Fetch latest changes from all repositories
echo ""
echo "📥 Fetching latest changes from repositories..."

if [ "$PROCESS_CORE" = "true" ] && [ -d "$CORE_REPO" ]; then
  echo "Updating Sindlish core..."
  (cd "$CORE_REPO" && git fetch origin)
fi

if [ "$PROCESS_DOCS" = "true" ] && [ -d "$DOCS_REPO" ]; then
  echo "Updating docs..."
  (cd "$DOCS_REPO" && git fetch origin)
fi

echo "✅ All repositories updated"
```

## Step 4: Launch Extraction & Analysis Agents

**IMPORTANT:** Launch ALL enabled agents in parallel using a single message with multiple Task tool calls.

For each enabled repository, prepare the agent prompt with environment variables:

### Agent Launch Template

For each agent, create a prompt like this:

```
You are running the [REPO] extraction and analysis agent.

Environment variables:
- REPO_PATH: [path to repo]
- OUTPUT_DIR: [/Users/user/changelog_work/YYYY-MM-DD]
- LAST_FRIDAY: [YYYY-MM-DD]
- TODAY: [YYYY-MM-DD]

Follow the instructions in your agent file to:
1. Extract PRs to pr_data_[repo]_[date].txt
2. Analyze them for customer-facing impact
3. Create a detailed analysis report: [repo]_analysis_report.md
4. Return a brief summary for the triage report

IMPORTANT:
- Write your detailed analysis to: $OUTPUT_DIR/[repo]_analysis_report.md
- Include ALL PRs with clickable links in the detailed report
- Return only a brief summary (not the full detailed analysis) in your final message

Your agent file is: .claude/agents/extract-analyze-[repo].md
Read that file and execute its instructions.
```

### Launch Agents in Parallel

Use a single message with multiple Task tool calls:

**If PROCESS_CONSOLE:**
```
Task: extract-analyze-console
Description: Extract and analyze Console PRs
Prompt: [formatted prompt with env vars as above]
Subagent: general-purpose
Model: haiku
```

**If PROCESS_MCP:**
```
Task: extract-analyze-mcp
Description: Extract and analyze MCP PRs
Prompt: [formatted prompt with env vars]
Subagent: general-purpose
```

**If PROCESS_CORE:**
```
Task: extract-analyze-core
Description: Extract and analyze Sindlish core PRs
Prompt: [formatted prompt with env vars as above]
Subagent: general-purpose
Model: haiku
```

**If PROCESS_DOCS:**
```
Task: extract-analyze-docs
Description: Extract and analyze docs PRs
Prompt: [formatted prompt with env vars]
Subagent: general-purpose
```

**Example of launching 2 agents in parallel:**
```
I'm launching 2 extraction agents in parallel: core and docs.

[Two Task tool calls in a single message]
```

## Step 5: Collect Agent Results

Each agent will return a structured summary. Save their outputs:

- Core: `CORE_SUMMARY`
- Docs: `DOCS_SUMMARY`

Check for failures. If any agent failed, note it and continue with successful agents.

## Step 6: Check for Non-PR Announcements

Before compiling the triage report, check for major announcements that might not appear in PRs:

```bash
# Check recent blog posts (if available)
echo "Checking for recent blog posts or announcements..."

# Look for pricing/quota config changes in website repo
echo "Checking for pricing or quota changes in docs..."
git log --since="$LAST_FRIDAY" --until="$TODAY" --oneline -- content/docs | head -20 || true

# Check changelog drafts that might exist
ls -la content/changelog/*.md 2>/dev/null | tail -5 || true
```

**Look for evidence of:**
- Pricing changes (compute rates, storage rates)
- Quota/limit increases (projects, storage, branches)
- Plan changes (new tiers, feature availability)
- Compliance announcements (HIPAA, SOC 2, etc.)
- Partnership announcements (integrations, marketplace)

**If you find any of these**, add a note to the triage report under "NON-PR ANNOUNCEMENTS" section for human review.

## Step 7: Generate Triage Report (Executive Summary)

Create a high-level triage report that summarizes findings and links to detailed analysis files.

**Note:** Agents have already written detailed analysis files (`console_analysis_report.md`, etc.) with ALL PRs, links, and reasoning. The triage report is an executive summary that links to those files.

**File:** `$OUTPUT_DIR/triage_report.md`

**Structure:**

```markdown
# Changelog Triage Report
## [Date Range]

**Date Range:** YYYY-MM-DD to YYYY-MM-DD
**Publication Date:** YYYY-MM-DD (Friday)
**Output Directory:** `/Users/[user]/changelog_work/YYYY-MM-DD/`

---

## Summary by Repository

### Core
- **Total PRs:** [X] ([Y] releases)
- **Customer-Facing:** [Z]
- **Top Recommendations:** [List 2-3 H2-worthy items with brief titles]
- 📋 **[Detailed Analysis](./core_analysis_report.md)** - Full PR list with clickable links

### Docs
- **Total PRs:** [X]
- **Customer-Facing:** [Z]
- **Top Recommendations:** [List H2-worthy items]
- 📋 **[Detailed Analysis](./docs_analysis_report.md)** - Full PR list with clickable links

---

## Key Themes This Week

1. **[Theme 1]** - [Brief description of pattern across repos]
2. **[Theme 2]** - [Brief description]
3. **[Theme 3]** - [Brief description]

---

## Recommended Changelog Sections

### H2 Entries ([count] items):
1. **[Title]** - [One sentence description] (from [Repo] PR #[X])
2. **[Title]** - [One sentence description] (from [Repo] PR #[X])
[... list all H2-worthy items]

### Fixes Section ([count] items):
- **[Repo]:** [Brief fix] (PR #[X])
- **[Repo]:** [Brief fix] (PR #[X])
[... list all Fixes-worthy items]

---

## Files Generated

This directory contains:
- `triage_report.md` (this file) - Executive summary
- `core_analysis_report.md` - Detailed Sindlish core analysis with all PRs
- `docs_analysis_report.md` - Detailed docs analysis with all PRs
- `pr_data_core_YYYY-MM-DD.txt` - Raw core extraction
- `pr_data_docs_YYYY-MM-DD.txt` - Raw docs extraction
- [Additional pr_data files as needed]

---

## Validation Workflow

1. **Start here** - Review this summary for overall themes and H2/Fixes recommendations
2. **Click detailed analysis links** - Spot-check decisions in individual repo reports
3. **Use clickable PR links** - Validate specific PRs by viewing on GitHub
4. **Review EXCLUDE sections** - Each detailed report has collapsed sections with ALL excluded PRs
```

## Step 8: Generate Changelog Draft

**File:** `content/changelog/${PUBLICATION_DATE}.md`

### Check for Existing Changelog

First, check if the changelog file already exists:

```bash
if [ -f "content/changelog/${PUBLICATION_DATE}.md" ]; then
  echo "📝 Existing changelog found: content/changelog/${PUBLICATION_DATE}.md"
  echo "This file will be updated with new agent findings."
else
  echo "📝 Creating new changelog: content/changelog/${PUBLICATION_DATE}.md"
fi
```

**IMPORTANT: Different workflows based on whether file exists:**

**If creating NEW changelog:**
1. Read all agent analysis report files
2. Extract all Draft H2 Descriptions from agents
3. Copy agent drafts verbatim into new changelog
4. Follow golden examples for structure

**If UPDATING existing changelog:**
1. Read the existing changelog file first
2. Identify what sections/items already exist
3. Read all agent analysis report files
4. For each agent-recommended item:
   - If it's NOT in the existing changelog → Add it using agent's draft
   - If similar content exists → Leave existing content as-is (human already edited it)
   - If agent draft is better → Replace with agent draft (preserve human intent)
5. Add a comment at the top: `<!-- Updated with agent findings from [DATE] run -->`

**Decision rule:** When in doubt, preserve human-edited content over agent drafts. Agents are finding NEW items since the last run, not re-analyzing everything.

### Drafting Process

Read the golden examples file: use `/golden-corpus` for style and structure reference.

### CRITICAL: Read Agent Analysis Files

Before drafting the changelog, you MUST read each agent's detailed analysis report to access their Draft H2 Descriptions:

```bash
# Read each agent's analysis report
cat "$OUTPUT_DIR/core_analysis_report.md"
cat "$OUTPUT_DIR/docs_analysis_report.md"
```

These files contain the Draft H2 Descriptions that agents wrote. The brief summaries you received in Step 5 do NOT include the draft descriptions.

1. **Read golden examples** to understand voice and structure patterns

2. **Trust agent recommendations:**
   - If an agent recommends H2, include it as H2 (do not demote to Fixes)
   - If an agent recommends Fixes, include it in Fixes
   - Agents analyzed full PR context you don't have - respect their judgment

3. **Use agent drafts directly:**
   - For H2-worthy items, agents provide "Draft H2 Description" and "Suggested Title"
   - Use the agent's suggested title (edit only for minor wording, not content changes)
   - Use the agent's draft description (edit only for polish and consistency, not restructuring)
   - Do not rewrite agent drafts from scratch - they contain specific details from PRs

4. **Cross-repo coordination:**
   - If multiple agents have related H2 items (e.g., core + docs), combine into one H2
   - Merge the agent drafts together, preserving details from both
   - Example: core compiler change + docs update = one "Compiler update" H2

5. **Consolidate same-component items:**
   - **CRITICAL:** If multiple H2-worthy items are from the same component/product, consolidate into one H2
   - Example: 3 separate language feature changes → One "Language enhancements" H2 with bullet points
   - Example: Multiple docs improvements → One "Docs improvements" H2
   - Each bullet should be concise (1-2 sentences) highlighting the specific feature
   - Only create separate H2s if the items are major launches or significantly different in scope

6. **Verify all documentation links exist:**
   - **CRITICAL:** Never include links to documentation that doesn't exist
   - Before adding any link like `[Text](/docs/path)`, verify the file exists in `content/docs/`
   - Use Glob tool to check: `content/docs/reference/standard-library.md`, `content/docs/basics/variables.md`, etc.
   - If doc doesn't exist, either:
     - Omit the link entirely (preferred)
     - Link to a parent page that exists (e.g., `/docs/basics` instead of `/docs/basics/nonexistent`)
   - Common valid paths: `/docs/basics/`, `/docs/reference/`, `/docs/get-started/`, `/docs/data-structures/`
   - Agent drafts may suggest links - you must validate them

7. **For Fixes items:**
   - Write concise bullets (10-30 words each)
   - Group by repo or feature area
   - Use agent reasoning as the base for your bullet text

8. **Quality check before writing:**
   - Count how many H2-worthy items agents recommended
   - Verify your changelog includes all of them (unless combining related items)
   - Do not skip H2 items without explicit reason
   - Extension updates and capacity changes are always H2-worthy
   - All links have been verified to exist

### Pre-Writing Validation Checklist

Before writing the changelog file, verify:

- [ ] I have read all 5 agent analysis report files above
- [ ] I have extracted each "Draft H2 Description" from agent reports
- [ ] I have the agent's "Suggested Title" for each H2-worthy item
- [ ] For items I'm combining across repos, I have drafts from both agents
- [ ] I will copy agent drafts verbatim (edit only for typos/polish)
- [ ] I will NOT rewrite agent drafts from scratch

9. **Changelog structure:**

```markdown
---
title: TBD
---

[Include ALL H2-worthy items from agents - order by impact]

## [Agent's suggested title - use verbatim or minor edits only]

[Agent's draft description - copy directly, edit only for polish]

[Optional: Screenshot reference if mentioned in triage report]
[Optional: Code example if in agent draft]

For more information, see [link from agent draft or relevant docs].

## [Next H2 from agents]

[Agent's draft - preserve specifics and examples from PRs]

<details>
<summary>**Fixes & improvements**</summary>

[Group fixes from all repos by area]
- **[Repo/Area]:** [Use agent's reasoning as base for bullet]
- [Include all Fixes-recommended items]

</details>
```

**Example of using agent drafts correctly:**
- Agent says: "Suggested Title: Data masking improvements" → Use that title
- Agent provides draft with specific UI pages → Keep those specifics
- Agent recommends H2 → Include as H2, don't demote to Fixes

## Step 9: Commit Changelog (Optional)

After generating the changelog draft, ask the user if they want to create a branch and commit it:

**Prompt:** "Changelog generated at `content/changelog/${PUBLICATION_DATE}.md`. Would you like me to create a new branch and commit it? (Y/n)"

If the user confirms (Y or yes), execute the following:

```bash
# Save current branch
CURRENT_BRANCH=$(git branch --show-current)

# Create and switch to new changelog branch from main
git checkout main
git checkout -b changelog-${PUBLICATION_DATE}

# Add and commit the changelog
git add content/changelog/${PUBLICATION_DATE}.md
git commit -m "docs: add changelog for ${PUBLICATION_DATE}

[Brief summary of major updates from H2 entries]

Generated using /triage-changelog command.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Return to original branch
git checkout "$CURRENT_BRANCH"

echo ""
echo "✅ Changelog committed to branch: changelog-${PUBLICATION_DATE}"
echo ""
echo "📋 Next steps:"
echo "1. Switch to the changelog branch: git checkout changelog-${PUBLICATION_DATE}"
echo "2. Review the changelog: content/changelog/${PUBLICATION_DATE}.md"
echo "3. Add screenshots to /public/docs/changelog/ if needed"
echo "4. Validate documentation links"
echo "5. Push branch: git push -u origin changelog-${PUBLICATION_DATE}"
echo "6. Create PR when ready"
```

If the user declines, inform them:
- The changelog file is at `content/changelog/${PUBLICATION_DATE}.md`
- They can commit it manually when ready
- The triage report is at `${OUTPUT_DIR}/triage_report.md`

## Step 10: Generate Summary

Output a final summary for the user:

```
=== CHANGELOG GENERATION COMPLETE ===

📊 Repositories Processed:
[List with PR counts and customer-facing counts]

📁 Files Generated:
- Triage report: [path]
- Changelog: [path]
- PR data files: [list paths]

📝 Changelog Summary:
- Main features (H2): [count]
- Fixes & improvements: [count]

📋 Next Steps:
1. Review triage report for accuracy
2. Review and edit changelog draft
3. If you created a branch (Step 9), switch to it and push
4. Update title after reviewing content
5. Add screenshots to /public/docs/changelog/
6. Validate all documentation links
7. Create PR and request reviews
8. Merge and publish on Friday
```

## Error Handling

If any agent fails:
- Note the failure in summary
- Continue with successful agents
- Generate triage report and changelog with available data
- Warn user about missing repo data

## Notes

- Agents run autonomously - you won't see their intermediate steps
- Each agent returns a final summary with all its decisions
- Your job is to compile summaries and draft the changelog
- Use golden examples extensively when drafting
- Be concise in narration - let the agents do the work
- The triage report shows all agent reasoning for transparency
