# Wayfinder: how this map is worked

The rebuild of the Sindlish site is being planned on GitHub, not built. This file records how
that planning work is organised in git, so the branch layout is not something you have to
remember.

The map itself is issue
[#25](https://github.com/Sindlish/sindlish-website/issues/25) on
`Sindlish/sindlish-website`. It is the single source of truth for what has been decided and
what has not. Everything here is a convenience for working on it.

## Branches

| Branch | Holds | Merged to `main` when |
|---|---|---|
| `wayfinder/map` | Planning artifacts: the research deliverable, this file, and anything else produced while deciding rather than building | Never, on its own. It is working material. Cherry-pick what is genuinely wanted. |
| `wayfinder/prototypes` | One prototype per file, built to answer a design question | When a prototype has served its purpose and the decision is recorded on its ticket. Probably never wholesale. |

`main` carries only things that are true regardless of how the rebuild turns out. The glossary
in `CONTEXT.md` is the main example: domain vocabulary, not design decisions.

**Rule of thumb.** If it is a decision, it goes on an issue. If it is an artefact produced
while deciding, it goes on `wayfinder/map`. If it is a thing that exists to be looked at, it
goes on `wayfinder/prototypes`.

## Prototype tickets

Three tickets are labelled `wayfinder:prototype`. Their resolution comes *from* the prototype,
not before it, so the order matters:

| Ticket | Prototype | State |
|---|---|---|
| [#29](https://github.com/Sindlish/sindlish-website/issues/29) | The docs app shell: header, sidebar, content column, drawer | **Resolved.** `prototypes/docs-shell.html`, two rounds |
| [#36](https://github.com/Sindlish/sindlish-website/issues/36) | The workbench: docs pane beside the editor | Open. Was blocked by #29, now unblocked |
| [#31](https://github.com/Sindlish/sindlish-website/issues/31) | Where the mascot appears in the UI and what it does | Blocked by #27, the variant art. Not blocked by anything we can do |

All three live on `wayfinder/prototypes`, one file each, so they can be opened side by side and
compared. They will not agree perfectly, and where they disagree that is signal.

### A prototype is allowed to be wrong about its own question

#29 is the example worth keeping. The first version had no persistent navigation, built to the
question as originally framed, and it was rejected on sight: a docs site with nothing that stays
in position reads as unfinished. The second version, with a sidebar, was accepted unchanged.

The lesson, recorded on the ticket: the first prototype answered the question correctly and the
*question* was wrong, because the style reference had been framed as "the Rust docs shell" when
it should have been rust-lang.org. Building it is what exposed that. A prototype is not only a
way to test an answer; it is also the cheapest way to find out that you asked the wrong thing.

**Keep rejected versions in git history rather than overwriting them.** The rejected one is
evidence, and it is the only record that the question was ever framed wrongly.

## How a prototype is built

**Static HTML, no app code.** The rebuild deletes the entire UI, so a prototype written against
the current components would be arguing with code that is already scheduled for deletion. A
standalone file that a browser can open answers a design question; nothing more is asked of it.

**Real content, not lorem ipsum.** The corpus is 33 real pages with around 240 real code
blocks. A shell that looks right against placeholder text and wrong against a 6,566-character
reference page is not a shell that has been tested.

**Tokens from [#28](https://github.com/Sindlish/sindlish-website/issues/28), as CSS custom
properties.** Not approximations of them. If a prototype needs a colour that is not in the
token layer, that is a finding: either a token is missing or the design is wrong, and both are
worth knowing.

**One question per prototype.** A prototype that answers four questions answers none of them
sharply. The question is written at the top of the file and the answer at the bottom, so the
artefact is readable without the issue thread.

## Working rules

- **One ticket per session.** Except research. The discipline is what stops a decision from
  being made twice in two sessions by two different understandings.
- **Claim before starting**: `gh issue edit <n> --add-assignee "@me"`.
- **Findings that contradict a ticket's premise go on the ticket in the open**, not quietly
  folded into a resolution. Two decisions on this map were taken without the evidence in hand
  and had to be flagged afterwards; both were on [#30](https://github.com/Sindlish/sindlish-website/issues/30),
  where every MDX component turned out to have zero usage, and on the mermaid question, which
  was decided to keep a rendering dependency that no doc page uses.
- **Update the map when a ticket closes**, and graduate any fog the ticket clears. A map whose
  fog list only grows is not tracking anything.

## Branches that are now redundant

`research/reference-sites-shell` held the research deliverable, which is now cherry-picked
onto `wayfinder/map`. Safe to delete.