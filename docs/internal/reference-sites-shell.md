# Reference documentation site shells — sourced facts

Facts only. No recommendations, no decisions, no proposed values. Every number, colour,
file path and code excerpt below is quoted or derived from the source linked in the same
paragraph. Where a value could not be established from a primary source, it is listed in
§7 rather than guessed.

Research for issue #26. Companion to [llms-directory-guide.md](./llms-directory-guide.md).
Inkeep AI search is **not** kept: this effort drops every third-party SaaS and replaces
search with a static local index. Section 5 is therefore contrast material for designing
that index and its results surface, not a description of a system we are adopting.

**Method.** Values were read from repository source at the default branch, not from
rendered pages, except where a rendered page is explicitly named. Rendering pipelines
fingerprint assets, so live CSS filenames do not match repo filenames; both are recorded
where relevant. Dates and versions in §2.2 and §3.1 are as observed on 2026-10-04.

---

## 1. rust-lang

### 1.1 The Book

The Book is a stock mdBook with a nearly empty theme of its own. The Book's default branch is
`main`, and it overrides mdBook with exactly four stylesheets and one script:

```toml
# book.toml, [output.html]
additional-css = ["ferris.css", "theme/2018-edition.css",
                  "theme/semantic-notes.css", "theme/listing.css"]
additional-js = ["ferris.js"]
```

The three files under `theme/` are
[`2018-edition.css`](https://raw.githubusercontent.com/rust-lang/book/main/theme/2018-edition.css),
[`semantic-notes.css`](https://raw.githubusercontent.com/rust-lang/book/main/theme/semantic-notes.css)
and [`listing.css`](https://raw.githubusercontent.com/rust-lang/book/main/theme/listing.css);
there is no `theme/book.css`, `theme/general.css` or `theme/highlight.css`. All layout,
type and colour therefore comes from the pinned mdBook release, not from the Book's own
CSS. `book.toml` also supplies **22 `[output.html.redirect]` entries**, every one of the
form `"ch17-00-oop.html" = "ch18-00-oop.html"` — one chapter number higher on the right.
Source chapters `ch17`, `ch18`, `ch19` and `ch20` appear 4, 4, 6 and 8 times respectively.

[`book.toml`](https://raw.githubusercontent.com/rust-lang/book/main/book.toml) sets one
search-relevant flag, `[output.html.search] use-boolean-and = true`, meaning every term in
a query must match. It does not set `[output.html.playground]`.

The Book has **no** right-hand "on this page" rail. The sidebar (chapter tree + search) is
the only navigation column.

### 1.2 rustdoc (the standard library docs)

The largest of the three. Rustdoc's own
[`rustdoc.css`](https://raw.githubusercontent.com/rust-lang/rust/master/src/librustdoc/html/static/css/rustdoc.css)
is 98,295 bytes per the GitHub API (98,129 characters decoded) and is the single
stylesheet.

Type and colour tokens, verbatim from the `:root` block:

| Token | Value |
| --- | --- |
| `--font-family` | `"Source Serif 4", NanumBarunGothic, serif` |
| `--font-family-code` | `"Source Code Pro", monospace` |
| `--desktop-sidebar-width` | `200px` |
| `--src-sidebar-width` | `300px` |
| `--docblock-indent` | `24px` |
| `--code-block-border-radius` | `6px` |

`:root.sans-serif-fonts` (a runtime-toggled class) swaps the stacks to `"Fira Sans"` and
`"Fira Mono"`.

Light theme: `--main-background-color: white`, `--main-color: black`,
`--sidebar-background-color: #f5f5f5`, `--link-color: #3873ad`,
`--code-highlight-kw-color: #8959a8`, `--code-highlight-string-color: #718c00`.

Dark theme: `--main-background-color: #353535`, `--main-color: #ddd`,
`--sidebar-background-color: #505050`.

Ayu theme: `--main-background-color: #0f1419`.

`--code-block-background-color` is `#eaeaea` (light), `#2A2A2A` (dark), `#191f26` (ayu) —
note the inconsistent hex casing between themes in the same file.

Layout and type:

- `body { font: 1rem/1.5 var(--font-family) }` — the source carries the reason inline:
  `/* Line spacing at least 1.5 per Web Content Accessibility Guidelines
  https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation.html */`.
- `h1` `1.5rem` (24px), `h2` `1.375rem` (22px), `h3` `1.25rem` (20px); all
  `font-weight: 500`.
- `main { padding: 10px 15px 40px 45px }`.
- `.width-limiter { max-width: 960px }`.
- `pre { padding: 14px; line-height: 1.5 }`.
- `div.where { white-space: pre-wrap; font-size: 0.875rem }` — the same size as
  `.item-info code`.

Breakpoints. `rustdoc.css` has exactly three media queries — `max-width: 850px`,
`max-width: 700px` and `max-width: 464px`. The 700px one is mirrored as a JS constant
rather than read from CSS:

```js
const RUSTDOC_MOBILE_BREAKPOINT = 700;
```

Rustdoc has no right-hand "on this page" rail.

Theming: themes are selected on the document element, not on `<body>` —
`:root[data-theme="light" | "dark" | "ayu"]`, with `:root:not([data-theme])` supplying
fallback values. [`storage.js`](https://raw.githubusercontent.com/rust-lang/rust/master/src/librustdoc/html/static/js/storage.js)
is loaded render-blocking in `<head>` and calls `switchTheme()` from
`matchMedia("(prefers-color-scheme: dark)")` before first paint, with
`builtinThemes = ["light", "dark", "ayu"]`, `darkThemes = ["dark", "ayu"]`, and
`localStorage` keys prefixed `rustdoc-`.
[`noscript.css`](https://raw.githubusercontent.com/rust-lang/rust/master/src/librustdoc/html/static/css/noscript.css)
covers the no-JS case; [`theme.rs`](https://raw.githubusercontent.com/rust-lang/rust/master/src/librustdoc/theme.rs)
parses the query-string theme override.

Search. Shortcuts live in `main.js`, not `search.js` — `handleShortcut(ev)` dispatches on
`getVirtualKey(ev)`:

```js
case "s":
case "S":
case "/":
    ev.preventDefault();
    window.searchState.focus();
    break;
case "+":
case "=":
    expandAllDocs();      break;
case "-":
    collapseAllDocs(false); break;
case "_":
    collapseAllDocs(true);  break;
case "?":
    showHelp();          break;
```

The handler opts out entirely when any modifier is held
(`if (ev.ctrlKey || ev.altKey || ev.metaKey || disableShortcuts) { return; }`) or when a
`disable-shortcuts` setting is `"true"` — so a user can switch the shortcuts off. While a
text input has focus, only `Escape` is bound. The search input's placeholder, set in
`main.js` line 292, is literally:

```
Type `S' or `/' to search, `?' for more options.
```

`search.js` renders a `"Loading..."` placeholder element while results are pending
(`placeholder.innerHTML = "Loading..."`, class `search-results active` when it is the
current tab).

### 1.3 rust-lang.org landing page

The site source is the repository `rust-lang/www.rust-lang.org` (the name
`www-rust-lang` 404s). Styles are Sass: [`src/styles/app.scss`](https://raw.githubusercontent.com/rust-lang/www.rust-lang.org/master/src/styles/app.scss)
and [`src/styles/fonts.scss`](https://raw.githubusercontent.com/rust-lang/www.rust-lang.org/master/src/styles/fonts.scss).
This is a marketing page, not a documentation shell, and shares no tokens with rustdoc or
mdBook. See §6 for the two defects observed in it.

---

## 2. docs.python.org

### 2.1 Build configuration

[`Doc/conf.py`](https://raw.githubusercontent.com/python/cpython/main/Doc/conf.py):

```python
html_theme = 'python_docs_theme'
html_theme_path = ['tools']
html_theme_options = {
    'collapsiblesidebar': True,
    'issues_url': '/bugs.html',
    'license_url': '/license.html',
    'root_include_title': False,  # We use the version switcher instead.
}
templates_path = ['tools/templates']
html_sidebars = {
    '**': ['localtoc.html', 'relations.html', 'customsourcelink.html'],
    'index': ['indexsidebar.html'],
}
html_last_updated_fmt = '%b %d, %Y (%H:%M UTC)'
html_use_opensearch = 'https://docs.python.org/' + version
html_copy_source = False
```

Pinned versions, from
[`Doc/requirements.txt`](https://raw.githubusercontent.com/python/cpython/main/Doc/requirements.txt):
`sphinx<9.0.0`, `pygments>=2.21`, `python-docs-theme>=2023.3.1,!=2023.7`. The file
explains the pin: new Sphinx versions that introduce warnings would otherwise break
builds.

Search is Sphinx's built-in `sphinx.search` (not listed in `extensions`, so it is
default-on). CPython adds one search-relevant extension of its own,
[`glossary_search`](https://raw.githubusercontent.com/python/cpython/main/Doc/tools/extensions/glossary_search.py),
which collects every glossary term and writes `_static/glossary.json` as
`{term.lower(): {"title": ..., "body": ...}}` at build finish — a separate index from the
main search index.

### 2.2 Layout as actually served

The theme is the external package
[`python/python-docs-theme`](https://github.com/python/python-docs-theme), consumed via
`html_theme_path`/overrides. On 2026-10-04 the live page
`https://docs.python.org/3/library/stdtypes.html` reported
**"Search within Python 3.14.8 documentation"** in its OpenSearch title.

That page's DOM, verbatim:

```html
<div class="sphinxsidebarwrapper">
  <div>
    <h3><a href="../contents.html">Table of Contents</a></h3>
```

So the right-hand rail is `div.sphinxsidebarwrapper`, rendered by Sphinx's stock
`localtoc.html`. The words "On this page" do not appear anywhere on the page.

Stylesheets linked by the live page:

```html
<link rel="stylesheet" type="text/css" href="../_static/pygments.css?v=b86133f3" />
<link rel="stylesheet" type="text/css" href="../_static/classic.css?v=234b1a7c" />
<link rel="stylesheet" type="text/css" href="../_static/pydoctheme.css?v=48df1187" />
<link id="pygments_dark_css" media="(prefers-color-scheme: dark)" rel="stylesheet" href="../_static/pygments_dark.css?v=0fc419ee" />
<link rel="stylesheet" href="../_static/pydoctheme_dark.css" media="(prefers-color-scheme: dark)" id="pydoctheme_dark_css">
```

Dark mode is a **second full stylesheet** gated on `prefers-color-scheme`, not a token
flip. `?v=` fingerprints exist on the Sphinx-generated files only.

Scripts: `copybutton.js`, `doctools.js`, `documentation_options.js`, `menu.js`,
`rtd_switcher.js`, `search-focus.js`, `sidebar.js`, `sphinx_highlight.js`, `switchers.js`,
`themetoggle.js`.

### 2.3 Concrete CSS values

From [`pydoctheme.css`](https://raw.githubusercontent.com/python/python-docs-theme/main/python_docs_theme/static/pydoctheme.css):

```css
div.document { display: flex; overflow-wrap: break-word; }
div.sphinxsidebar {
    display: flex;
    width: min(25vw, 350px);
    flex-shrink: 0;
    margin: 0;
    order: 0;
    float: none;
    position: sticky;
    top: 0;
    max-height: 100vh;
    color: #444;
    background-color: #eee;
    border-radius: 5px;
    line-height: 130%;
    font-size: smaller;
}
div.documentwrapper { flex: 1; min-width: 0; order: 1; }
div.sphinxsidebarwrapper {
    box-sizing: border-box;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    float: none;
    flex-grow: 1;
}
```

The layout is a two-child flex row: a sticky left sidebar, then a growing content column
that contains the right rail. The rail is not a third sibling — it lives inside the
content column and scrolls independently.

### 2.3a Declared-but-unused theme options

[`theme.toml`](https://raw.githubusercontent.com/python/python-docs-theme/main/python_docs_theme/theme.toml)
declares a full colour and font palette:

```toml
[theme]
inherit = "default"
stylesheets = ["classic.css", "pydoctheme.css"]
pygments_style = { default = "default", dark = "monokai" }

[options]
bodyfont  = "-apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Cantarell, Ubuntu, roboto, noto, arial, sans-serif"
headfont  = "<same stack>"
linkcolor      = "#0090c0"
visitedlinkcolor = "#00608f"
codebgcolor    = "#eeffcc"
codetextcolor  = "#333333"
```

None of these reach the rendered page: `pydoctheme.css` contains zero occurrences of
`var(--linkcolor)`, `var(--bodyfont)` or `bodyfont`, and hardcodes its own values instead —
links are `#0072aa`, not the declared `#0090c0`. The only options that visibly take effect
are the boolean/string ones passed through `html_theme_options` (`collapsiblesidebar`,
`issues_url`, `license_url`, `root_include_title`, `hosted_on`).

The `stylesheets` list also names `classic.css`, which is **not** in the repository; it is
a Sphinx-generated file, which is why it alone carries a `?v=` fingerprint on the served
page alongside `pygments.css`.

Other values: `body { margin-left: 1em; margin-right: 1em }` (the longhand pair, not
`margin`), body line-height `1.6`, links `#0072aa`, visited
`#6363bb`, hover `#00b0e4`, hover inside the sidebar `#0095c4`; `div.body pre` has
`border-radius: 3px; border: 1px solid #ac9`; `.code-block-caption` has
`background: #eee; border: 1px solid #ac9; font-size: 90%`; code font
`Menlo, Consolas, Monaco, Liberation Mono, Lucida Console, monospace` at
`font-size: 96.5%`.

Responsive switch is a single breakpoint at **1023/1024px**. Below it:

```css
div.related li.right, div.related li.switchers, div.sphinxsidebar { display: none; }
html { scroll-padding-top: 40px; }
body { margin-top: 40px; }
.mobile-nav {
    display: block; height: 40px; width: 100%;
    position: fixed; top: 0; inset-inline-start: 0;
    box-shadow: rgba(0, 0, 0, 0.25) 0 0 2px 0; z-index: 1;
}
.toggler__input { display: none; }
.toggler__label { width: 40px; padding: 8px; flex-shrink: 0; }
```

Dark values, from [`pydoctheme_dark.css`](https://raw.githubusercontent.com/python/python-docs-theme/main/python_docs_theme/static/pydoctheme_dark.css):
body `#222`, text `rgba(255, 255, 255, 0.87)`, sidebar `#333`, `aside.sidebar #424242`. It
also sets `color-scheme: dark` and `scrollbar-color: #616161 transparent`.

### 2.4 Search

Both search forms are plain GET forms to `search.html`. From
[`layout.html`](https://raw.githubusercontent.com/python/python-docs-theme/main/python_docs_theme/layout.html):

```html
<div class="inline-search" role="search">
  <form class="inline-search" action="{{ pathto('search') }}" method="get">
    <input placeholder="{{ _('Quick search') }}" aria-label="{{ _('Quick search') }}"
           type="search" name="q" id="search-box">
    <input type="submit" value="{{ _('Go') }}">
  </form>
```

and a second form in the relbar with an inline SVG magnifier,
`<form role="search" class="search" action="{{ pathto('search') }}" method="get">`.
The live page carries **three** search forms total (one relbar, two `inline-search`).

[`search-focus.js`](https://raw.githubusercontent.com/python/python-docs-theme/main/python_docs_theme/static/search-focus.js)
implements a `/` hotkey:

```js
document.addEventListener('keydown', function(event) {
  if (event.key === '/') {
    if (!isInputFocused()) {
      event.preventDefault();
      document.getElementById('search-box').focus();
    }
  }
});
```

There is no Ctrl+K binding and no in-page results panel — submitting navigates to a
Sphinx-generated results page. Both inputs carry `aria-label` but no `<label>` element, and
the submit control is a text button (`value="Go"`), not an icon.

---

## 3. mdBook v0.4.15

The pinned release this repo builds against is v0.4.15 (see `build_docs.sh`). Values below
are from that tag.

### 3.1 Tokens and base type

[`src/theme/css/variables.css`](https://raw.githubusercontent.com/rust-lang/mdBook/v0.4.15/src/theme/css/variables.css):

```css
:root {
    --sidebar-width: 300px;
    --page-padding: 15px;
    --content-max-width: 750px;
    --menu-bar-height: 50px;
}
```

[`src/theme/css/general.css`](https://raw.githubusercontent.com/rust-lang/mdBook/v0.4.15/src/theme/css/general.css):

```css
:root { font-size: 62.5%; }         /* 1rem === 10px */
body  { font-size: 1.6rem; }        /* 16px */
html  { font-family: "Open Sans", sans-serif; }
code  { font-family: "Source Code Pro", monospace; font-size: 0.875em; }
.content p, .content ol, .content ul { line-height: 1.45em; }
.content main { max-width: var(--content-max-width); }
```

The `62.5%` root means every `rem` in the theme is 10px-based and non-obvious; `1.6rem`
body is the only place 16px is expressed.

Theme selection is a class on `<html>`: `.ayu`, `.coal`, `.light`, `.navy`, `.rust`.
Light: `--bg: hsl(0, 0%, 100%)`, `--fg: hsl(0, 0%, 0%)`, `--links: #20609f`,
`--inline-code-color: #301900`, `--sidebar-active: #1f1fff`,
`--quote-bg: hsl(197, 37%, 96%)`. Coal: `--bg: hsl(200, 7%, 8%)`, `--fg: #98a3ad`. Rust:
`--bg: hsl(60, 9%, 87%)`, `--fg: #262625`, `--sidebar-bg: #3b2e2a`.

The `no-js` fallback is done with a media query on a class, not with a script:

```css
@media (prefers-color-scheme: dark) {
    html.light.no-js { /* coal's values */ }
}
```

**mdBook has no right-hand "on this page" rail** at any width.

### 3.2 Breakpoints

[`src/theme/css/chrome.css`](https://raw.githubusercontent.com/rust-lang/mdBook/v0.4.15/src/theme/css/chrome.css)
contains exactly five media queries:

```css
@media only screen and (max-width: 420px) { … }
@media only screen and (max-width: 1080px) { … }
@media only screen and (max-width: 1380px) { … }
@media only screen and (min-width: 620px) { … }
@media (-moz-touch-enabled: 1), (pointer: coarse) { … }
```

The last is a pointer-capability query, not a width breakpoint — it is how mdBook
switches sidebar behaviour for touch devices. The string `1080` does not appear anywhere
in `book.js`; the four width breakpoints are CSS-only.

Sidebar width is user-resizable and persisted by writing an inline custom property onto
`document.documentElement`, clamped to a `150px` floor and `window.innerWidth - 100`:

```js
if (current_width < 150) {
  document.documentElement.style.setProperty('--sidebar-width', '150px');
}
pos = Math.min(pos, window.innerWidth - 100);
```

There is no reset control. The same file contains a drag threshold of
`Math.min(document.body.clientWidth * 0.25, 300)`.

### 3.3 Search

[`src/theme/searcher/searcher.js`](https://raw.githubusercontent.com/rust-lang/mdBook/v0.4.15/src/theme/searcher/searcher.js)
drives a panel in the sidebar whose markup lives in
[`index.hbs`](https://raw.githubusercontent.com/rust-lang/mdBook/v0.4.15/src/theme/index.hbs):

```html
<div id="search-wrapper" class="hidden">
<input type="search" id="searchbar" name="searchbar" placeholder="Search this book ..."
       aria-controls="searchresults-outer" aria-describedby="searchresults-header">
```

It is inline in the sidebar, not an overlay or modal. `searcher.js` reaches the markup by
`getElementById` on `search-wrapper`, `searchbar`, `searchbar-outer`, `searchresults`,
`searchresults-outer`, `searchresults-header` and `search-toggle`. Indexing is
[`elasticlunr.min.js`](https://raw.githubusercontent.com/rust-lang/mdBook/v0.4.15/src/theme/searcher/elasticlunr.min.js);
highlighting is [`mark.min.js`](https://raw.githubusercontent.com/rust-lang/mdBook/v0.4.15/src/theme/searcher/mark.min.js),
driven as `marker = new Mark(content)` then `marker.mark(words, …)` with
`window.setTimeout(() => marker.unmark(), 300)`.

Every key binding is a **numeric keycode constant**, never `event.key`:

```js
SEARCH_HOTKEY_KEYCODE = 83,   // "S"
ESCAPE_KEYCODE        = 27,
DOWN_KEYCODE          = 40,
UP_KEYCODE            = 38,
SELECT_KEYCODE        = 13;   // Enter
```

The hotkey only fires when the field does **not** already have focus
(`!hasFocus() && e.keyCode === SEARCH_HOTKEY_KEYCODE`), so typing `S` into the box inserts
an `S` rather than re-triggering the panel. Arrow keys move the selection, Enter selects,
and a document-level listener at line 265 catches all of it. Submit events are suppressed
so Enter does not reload the page.

Other values: `limit_results: 30`, `teaser_word_count: 30`, and the query is reflected in
the URL as `?search=` with `?highlight=`. Configuration is per-book in `book.toml`
(`[output.html.search]`); the Rust Book sets `use-boolean-and = true`.

### 3.4 Playground integration

`book.js` handles `[output.html.playground]`:

- POSTs to `https://play.rust-lang.org/evaluate.json`.
- `fetch_with_timeout` defaults to **6 seconds**.
- Sets `result_block.innerText = "Running..."` before the request.
- On an empty result it writes the literal string `"No output"` and adds the class
  `result-no-output` to the block.
- **Ctrl-Enter** runs from the Ace editor.
- The play button is hidden when the code contains `extern crate <name>` where `<name>` is
  not in `https://play.rust-lang.org/meta/crates`, or when the code block carries the
  `.no_run` class.

Only one result region exists, so compile output and runtime output are not separated.

---

## 4. Interactive "Run" patterns

### 4.1 The `evaluate.json` contract

The endpoint rustdoc embeds is the same one mdBook calls.
[`ui/src/server_axum.rs`](https://raw.githubusercontent.com/rust-lang/rust-playground/main/ui/src/server_axum.rs)
labels it explicitly:

```rust
// This is a backwards compatibilty shim. The Rust documentation uses
// this to run code in place.
async fn evaluate(...)
```

Request and response types, from
[`ui/src/public_http_api.rs`](https://raw.githubusercontent.com/rust-lang/rust-playground/main/ui/src/public_http_api.rs):

```rust
pub(crate) struct EvaluateRequest {
    pub(crate) version: String,
    pub(crate) optimize: String,
    pub(crate) code: String,
    #[serde(default)] pub(crate) edition: String,
    #[serde(default)] pub(crate) tests: bool,
}
pub(crate) struct EvaluateResponse {
    pub(crate) result: String,
    pub(crate) error: Option<String>,
}
```

`code` is an untagged enum — a bare string for one file, or a list of named files:

```rust
#[serde(untagged)]
pub(crate) enum Code { Single(String), Multiple(Vec<CodeFile>) }
pub(crate) struct CodeFile { pub(crate) name: String, pub(crate) content: String }
```

Error handling is coarse: **every** server-side failure is HTTP 500 with a single
`{"error": "..."}` body, and only a deserialization failure is HTTP 400 with
`{"error": "Unable to deserialize request: ..."}` (`server_axum.rs` lines 770–804). There
is no machine-readable error code or category.

The newer endpoint used by the Playground UI itself,
`POST /execute`, has a richer response:
`{ success: bool, exitDetail: String, stdout: String, stderr: String }` — stdout and
stderr separated, and a boolean for "did it run".

### 4.2 Streaming, stale-response rejection, and cancellation

The Playground UI
([`reducers/output/execute.ts`](https://raw.githubusercontent.com/rust-lang/rust-playground/main/ui/frontend/reducers/output/execute.ts))
can use either HTTP POST or a WebSocket. The WebSocket path is the interesting one:

- Output arrives as discrete messages: `wsExecuteBegin`, `wsExecuteStdout`,
  `wsExecuteStderr`, `wsExecuteStatus`, `wsExecuteEnd`.
- `wsExecuteStatus` carries `{ totalTimeSecs, residentSetSizeBytes }` while running.
- Every message carries a `sequenceNumber`; `sequenceNumberMatches` drops any message
  whose number is not the current one. A late reply from a superseded run cannot
  overwrite a newer one.
- `state.requestsInProgress` is the loading flag, incremented on `pending` and decremented
  on `fulfilled`/`rejected`; `wsExecuteEnd` sets it to `0`.
- Stdin is a first-class channel: `wsExecuteStdin`, `wsExecuteStdinClose`,
  `wsExecuteKillCurrent`.
- On `success: false`, `state.error = payload.exitDetail`. Compilation errors and
  non-zero exits are therefore surfaced in the same field, with no distinction.
- `allowLongRun` is reset to `false` on each new run.

### 4.3 Output rendering

[`Output/SimplePane.tsx`](https://raw.githubusercontent.com/rust-lang/rust-playground/main/ui/frontend/Output/SimplePane.tsx)
renders three labelled sections, in this order, always:

```jsx
{props.requestsInProgress > 0 && <Loader />}
<Section kind="error" label="Errors">{props.error}</Section>
<HighlightErrors label="Standard Error">{props.stderr}</HighlightErrors>
<Section kind="stdout" label="Standard Output">{props.stdout}</Section>
```

[`Output/Section.tsx`](https://raw.githubusercontent.com/rust-lang/rust-playground/main/ui/frontend/Output/Section.tsx)
omits any section whose child count is zero:

```jsx
React.Children.count(children) === 0 ? null : (
  <div data-test-id={`output-${kind}`}>
    <Header label={label} />
    <pre><code className={styles.code}>{children}</code></pre>
  </div>
)
```

stderr additionally goes through `OutputPrism language="rust_errors"`, and the copy
handler rewrites the clipboard to plain text:

```jsx
// Blank out HTML copy data.
// Though linkified output is handy in the Playground, it does more harm
// than good when copied elsewhere, and terminal output is usable on its own.
```

### 4.4 MDN interactive examples

MDN has two separate mechanisms. Content declares the first with a fence info string —
from [`mdn/content`](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/javascript/reference/statements/for-await...of/index.md):

````
```js interactive-example
async function* foo() {
  yield 1;
  yield 2;
}
```
````

embedded elsewhere with `{ {InteractiveExampleQueryEmbed("foo", "js")} }`.

The components are Lit custom elements under
[`client/src/lit/interactive-example/`](https://github.com/mdn/yari/tree/main/client/src/lit/interactive-example)
and [`client/src/lit/play/`](https://github.com/mdn/yari/tree/main/client/src/lit/play).
Facts from source:

- Three templates, chosen in
  [`index.js`](https://raw.githubusercontent.com/mdn/yari/main/client/src/lit/interactive-example/index.js):
  `choices` if the example has variants; `console` if it is JS-only or JS+WAT; `tabbed`
  otherwise. Composition is a mixin chain:
  `InteractiveExampleWithChoices(InteractiveExampleWithTabs(InteractiveExampleWithConsole(InteractiveExampleBase)))`.
- `LANGUAGE_CLASSES = ["html", "js", "css", "wat"]`.
- The console template renders `<h4>`, `<button id="execute">Run</button>`,
  `<button id="reset">Reset</button>`, `<play-console>`, `<play-runner>`.
- Execution is **explicit**: [`controller.js`](https://raw.githubusercontent.com/mdn/yari/main/client/src/lit/play/controller.js)
  defaults `runOnStart = false` and `runOnChange = false`. Nothing runs until Run is
  clicked.
- `run()` clears the console first, then assigns `runner.code`, which is what triggers
  execution.
- Languages suffixed `-hidden` are concatenated in front of the visible code rather than
  shown, so examples can carry boilerplate.

Execution is sandboxed in an iframe and **isolated per instance by a random subdomain**.
[`play/runner.js`](https://raw.githubusercontent.com/mdn/yari/main/client/src/lit/play/runner.js):

```js
this._subdomain = crypto.randomUUID();
...
sandbox="allow-scripts allow-same-origin allow-forms ${this.sandbox}"
```

The host is built as `${protocol}//${subdomain}.${PLAYGROUND_BASE_HOST}/runner.html`, and
`PLAYGROUND_BASE_HOST` defaults to `mdnplay.dev` in
[`env.ts`](https://raw.githubusercontent.com/mdn/yari/main/client/src/env.ts). On
`localhost` the subdomain is omitted and a `uuid` query parameter is used instead, with the
comment `origin doesn't contain the uuid on localhost`.

Code reaches the sandbox as a URL parameter, not a POST:

```js
const { state } = await compressAndBase64Encode(
  JSON.stringify({ html: code?.html || "", css: code?.css || "", js: code?.js || "",
                   defaults: defaults, theme: theme })
);
url.searchParams.set("state", state);
this._iframe.value?.contentWindow?.location.replace(src);
```

[`utils.ts`](https://raw.githubusercontent.com/mdn/yari/main/client/src/playground/utils.ts)
compresses with `new CompressionStream("deflate-raw")` and base64-encodes. Note the
subdomain scheme differs by caller: the inline `play-runner` uses a random UUID per
instance, while `initPlayIframe` (the standalone Playground page) uses the first 20 bytes of
`SHA-256` over the **compressed** bytes, hex-encoded — so identical code lands on an
identical subdomain there. `location.replace` is used deliberately "to update iframe src
without adding to browser history".

Two details worth recording because they are not obvious from the outside:

- **Ready handshake.** `postMessage` is gated on a promise resolved only by an inbound
  `typ === "ready"` message; there is no timeout on that promise.
- **Messages are origin-checked.** `_onMessage` extracts the expected uuid from the
  `origin` hostname and ignores anything that does not match `this._subdomain`.

WAT is compiled in the browser: `await import("@mdn/watify")` then
`watify(wat)` → `data:application/wasm;base64,…`, with `{%wasm-url%}` in the JS source
replaced by that data URL.

### 4.5 Output rendering and errors in MDN

[`play/console.js`](https://raw.githubusercontent.com/mdn/yari/main/client/src/lit/play/console.js)
implements a `VirtualConsole` where **every level collapses to `log`**:

```js
error(...args) { return this.log(...args); }
warn(...args)  { return this.log(...args); }
```

`console.error` is visually identical to `console.log`. Console format specifiers `%o %O
%d %i %s %f %c %%` are handled, except `%c`, which is explicitly unimplemented:

```js
case "c":
  // TODO: Not implemented yet, so just remove the argument
  args.splice(1, 1);
  return "";
```

Unrecognised console methods produce a visible sentinel rather than silence:

```js
this.vconsole.warn("[Playground] Unsupported console message (see browser console)");
```

Output is a plain list, one line per call, with the host applying the marker and wrapping:

```css
/* console.scss */
:host { font-size: 0.875rem; }
li { padding: 0 0.5em; &::before { content: ">"; } }
code { tab-size: 4; white-space: pre-wrap; }
```

Editor facts, from
[`play/editor.js`](https://raw.githubusercontent.com/mdn/yari/main/client/src/lit/play/editor.js):
CodeMirror 6 with `minimalSetup`, `lineNumbers`, `indentOnInput`, `autocompletion`,
`highlightActiveLine`, `EditorView.lineWrapping`; `oneDark` applied only when the theme
value is `"dark"`. Change events are debounced by `this.delay = 1000` ms. Formatting is
`prettier/standalone` imported dynamically, with a different plugin set per language.

Layout, from
[`interactive-example/index.scss`](https://raw.githubusercontent.com/mdn/yari/main/client/src/lit/interactive-example/index.scss):

```scss
.template-console {
  grid-template-areas: "header header" "editor editor" "buttons console";
  grid-template-rows: max-content 1fr 8rem;   /* console is a fixed 8rem row */
}
.template-tabbed  { grid-template-columns: 6fr 4fr; }
.template-choices { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
```

Console and tabbed layouts stack to one column at `$screen-sm` / `$screen-lg`
respectively. Those are Sass variables from
[`client/src/ui/_vars.scss`](https://raw.githubusercontent.com/mdn/yari/main/client/src/ui/_vars.scss),
and their concrete values are:

```scss
$screen-sm: 426px;
$screen-md: 769px;
$screen-lg: 992px;
$screen-xl: 1200px;
```

An unsupported choice is marked with `border-color: #ffb800` plus a background warning
icon, revealed by a `content: "▶"` marker that is `opacity: 0` until `.selected`.

### 4.6 MDN live samples (the other mechanism)

The older iframe-based samples are still generated, by
[`kumascript/macros/EmbedLiveSample.ejs`](https://raw.githubusercontent.com/mdn/yari/main/kumascript/macros/EmbedLiveSample.ejs):

```html
<iframe class="sample-code-frame"
  title="<%= title %> sample" id="frame_<%= id %>"
  src="about:blank" data-live-path="<%=env.url%>" data-live-id="<%=id%>"
  sandbox="allow-same-origin allow-scripts"></iframe>
```

Parameters `$3` (screenshot URL), `$4` (slug) and `$5` (class name) are all deprecated;
the macro calls `mdn.deprecatedParams(...)` for each. A `MIN_HEIGHT = 60` floor is forced
onto the iframe height, with a comment explaining that the old 30px was "too cramped".
Feature permissions go through an `allow="…"` attribute, semicolon-separated.

### 4.7 Pyodide — the layer a Pyodide-backed Run button sits on

Sindlish's Run button loads a bundled interpreter through pyodide (`CONTEXT.md`), so the
pyodide loader contract is directly relevant.
[`src/js/pyodide.ts`](https://raw.githubusercontent.com/pyodide/pyodide/main/src/js/pyodide.ts):

```ts
indexURL?: string;                              // default: resolved from script location
lockFileURL?: string;                           // default: `${indexURL}/pyodide-lock.json`
loadPackage?: string;                           // default: `${indexURL}/python_stdlib.zip`
stdin?: () => string | null;                    // default: globalThis.prompt ? () => globalThis.prompt() : undefined
stdout?: (msg: string) => void;
stderr?: (msg: string) => void;
```

with a load-bearing comment at the point of normalisation:

```ts
indexURL = withTrailingSlash(resolvePath(indexURL)); // A relative indexURL causes havoc.
```

Two facts that constrain any embedder:

- **stdout/stderr are batched callbacks of a single string.** There is no per-character or
  per-line streaming hook, so progressive output requires chunking in the caller.
- **`pyodide.ts` contains no DOM code at all** — zero occurrences of `document.`,
  `createElement`, `innerHTML`, `role=`, or `aria-`. Pyodide renders no loading indicator
  and no error UI; that is entirely the embedder's job.

Errors are typed, discriminated by `instanceof`, from
[`src/core/error_handling.ts`](https://raw.githubusercontent.com/pyodide/pyodide/main/src/core/error_handling.ts):
`PythonError`, `CppException`, `FatalPyodideError`, `Exit`, `NoGilError`, all `Error`
subclasses. `PythonError` carries the Python exception class name in `.type`:

```ts
export class PythonError extends Error {
  /** The name of the Python error class, e.g, RuntimeError or KeyError. */
  type: string;
  constructor(type: string, message: string, error_address: number) { … }
}
```

During a fatal load, Python's traceback is captured from fd 2 and appended to the thrown
message rather than returned separately:

```ts
API.fatal_loading_error = function (...args: string[]) {
  let message = args.join(" ");
  if (_PyErr_Occurred()) {
    API.capture_stderr();
    _PyErr_Print();
    message += "\n" + API.restore_stderr();
  }
  throw new FatalPyodideError(message);
};
```

### 4.8 Try React — retired, not inspected

Try React no longer exists as a running service. `https://tryreact.com/` returns HTTP 301
redirecting to `https://www.pluralsight.com/codeschool`; the Wayback Machine records that
redirect as of **14 July 2025**. The GitHub repository it was built from
(`josephburnett/jab`) is no longer reachable and returns 404 from the GitHub API. No
primary source for its execution, error or a11y handling could be retrieved, so nothing
about it is asserted here.

---

## 5. Search UX: modal vs inline, and hotkeys

### 5.1 Comparison

| | mdBook 0.4.15 | rustdoc | docs.python.org | MDN |
| --- | --- | --- | --- | --- |
| Pattern | inline panel in sidebar | inline input in sidebar | inline form(s) → separate results page | inline site search |
| Modal/overlay | no | no | no | no |
| Hotkeys | `S` (`SEARCH_HOTKEY_KEYCODE = 83`) | `s`, `S`, `/` | `/` | `/` |
| Results in page | yes | yes | no — navigates to `search.html?q=` | yes |
| Deep-linkable | `?search=`, `?highlight=` | no | yes, via the results URL | no |
| Configurable | yes, `[output.html.search]` in `book.toml` | no | no (Sphinx built-in) | no |
| Result cap | `limit_results: 30` | not established | not established | not established |
| Term logic | `use-boolean-and` toggle | not established | Sphinx default | not established |

Not one of the four uses a modal, a `⌘K` palette, or an overlay. Three of four bind a
single unmodified letter or `/`.

### 5.2 What the shared patterns are

- **A visible, permanent input.** In all four the search field is always in the layout; it
  is not behind a button. The hotkey is a shortcut to an already-visible control, not the
  only way in.
- **One bare key, never a chord.** `S`, `s`, `/`. No `⌘K`/`Ctrl+K` anywhere in this set.
- **Type-ahead on the same page.** mdBook and rustdoc both render results inline and keep
  focus in the field; only python.org leaves the page.
- **A guard before stealing the key.** python.org's `/` handler checks
  `isInputFocused()` first, so `/` still types into a focused textarea.
- **The state is in the URL.** mdBook writes `?search=` and `?highlight=`; python.org's
  query string is the query. Results are linkable on both.
- **The hotkey is discoverable from the field.** rustdoc's placeholder is
  ``Type `S' or `/' to search, `?' for more options.``
- **The hotkey is also declared to assistive tech.** mdBook puts it in the toggle's
  accessible metadata:
  `<button id="search-toggle" … aria-keyshortcuts="S" aria-expanded="false"
  aria-controls="searchbar">`, and its chapter links carry
  `aria-keyshortcuts="Left"` / `"Right"`. This is the pattern that makes a shortcut
  discoverable without putting it in visible prose.
- **Every site lets the user turn the shortcut off**, or at least yields it to the
  platform: rustdoc checks a `disable-shortcuts` setting and bails on any modifier key;
  python.org's `/` handler skips when an input is focused.

---

## 6. What not to copy

Each item is a defect or dated choice observed in a cited source. None is a judgement
about the sites as a whole.

### 6.1 Dated patterns

- **rust-lang.org kills its focus ring.**
  [`app.scss`](https://raw.githubusercontent.com/rust-lang/www.rust-lang.org/master/src/styles/app.scss)
  nests this inside `.button` (line 91, written `&:hover, &:focus`):

  ```scss
  &:hover,
  &:focus {
    outline: 0;
  }
  ```

  The focus indicator is removed with no replacement.
- **rust-lang.org's screen-reader helper predates `clip-path`.** The same file's `.hidden`
  uses the legacy technique — `clip: rect(0 0 0 0)` with `height: 1px; margin: -1px;
  overflow: hidden` — and contains no `clip-path` at all.
- **docs.python.org's copy button is hover-only.** `.copybutton` is `display: none` and is
  revealed only by `.highlight:hover .copybutton { display: block }` and
  `.highlight:active .copybutton { display: block }`. There is no `:focus` rule, so the
  button is unreachable by keyboard.
- **mdBook pins every search key binding to a numeric keycode** —
  `SEARCH_HOTKEY_KEYCODE = 83`, `ESCAPE_KEYCODE = 27`, `DOWN_KEYCODE = 40`,
  `UP_KEYCODE = 38`, `SELECT_KEYCODE = 13` — with no `event.key`, layout or IME
  consideration. On a non-QWERTY layout `83` is a different physical key.
- **mdBook's search input has a placeholder but no accessible name.**
  `<input type="search" id="searchbar" placeholder="Search this book …">` carries
  `aria-controls` and `aria-describedby` but no `aria-label` and no `<label for>`.
- **docs.python.org ships dark mode as a second full stylesheet** (`pydoctheme_dark.css`,
  linked with `media="(prefers-color-scheme: dark)"`) rather than as token overrides, so
  every colour is declared twice.
- **docs.python.org's `theme.toml` palette is dead configuration.** `linkcolor`,
  `visitedlinkcolor`, `bodyfont`, `headfont` and the `codebgcolor`/`codetextcolor` pair are
  all declared and none are referenced by `pydoctheme.css`, which hardcodes its own values.
  Changing the declared link colour has no effect on the rendered page.
- **The Book's own theme is three near-empty CSS files.** Everything a reader sees comes
  from the pinned mdBook tag, so the Book cannot adjust its own appearance without
  forking mdBook.

### 6.2 Over-built features

Scoped against a documentation page that has to explain one language, not a full IDE.

- **rustdoc's seven interactive tools per run**: execute, compile to LLVM IR / assembly /
  MIR, rustfmt, clippy, miri, macro expansion — each with its own request type, response
  type, Redux slice, reducer set and output pane (`ui/src/public_http_api.rs`,
  `ui/frontend/reducers/output/`).
- **The Playground's interactive process control**: a WebSocket channel carrying
  `wsExecuteStdin`, `wsExecuteStdinClose`, `wsExecuteKillCurrent`, plus
  `residentSetSizeBytes`/`totalTimeSecs` reporting and an `allowLongRun` escalation flag.
- **MDN's three example templates and per-example telemetry.** One example can be a
  console, a tabbed editor, or a set of switchable variants; `_telemetryHandler` fires
  Mozilla Glean events on `focus`, `copy`, `cut`, `paste` and `click` for every one.
- **MDN's client-side WAT toolchain** — `watify` compiling WebAssembly text to a base64
  data URL in the browser, as a fourth "language".
- **rustdoc's `-`/`+` expand-all / collapse-all**, `?` shortcut-help panel, and three
  parallel font stacks (serif, sans, code) with a runtime class to switch them.

### 6.3 Accessibility problems, with evidence

| Observation | Evidence |
| --- | --- |
| MDN's console output is never announced. `PlayConsole` renders a bare `<ul><li><code>` with no `aria-live`, `role="log"` or `role="status"`, and the only reaction to new output is `scrollTo({ top: this.scrollHeight })`. | [`play/console.js`](https://raw.githubusercontent.com/mdn/yari/main/client/src/lit/play/console.js), `render()` and `updated()` |
| MDN's loading state is invisible to assistive tech. Nothing renders while a run is in flight: `run()` clears the console, sets `runner.code`, and there is no pending flag anywhere in `controller.js` or `runner.js`. | [`play/controller.js`](https://raw.githubusercontent.com/mdn/yari/main/client/src/lit/play/controller.js) `run()` |
| MDN's error output is indistinguishable from output. `VirtualConsole.error` and `.warn` both `return this.log(...args)`, and `%c` is dropped rather than shown. | [`play/console.js`](https://raw.githubusercontent.com/mdn/yari/main/client/src/lit/play/console.js) |
| The Rust Playground's loader is three decorative glyphs. `<div data-test-id="loader">` containing `<span>⬤</span>` ×3, with no `role`, no `aria-live`, no `aria-label`, no visually-hidden text and no `prefers-reduced-motion` handling. | [`ui/frontend/Loader.tsx`](https://raw.githubusercontent.com/rust-lang/rust-playground/main/ui/frontend/Loader.tsx) |
| MDN's runner iframe is titled "runner". Every sandboxed output iframe on a page gets the same generic accessible name. | [`play/runner.js`](https://raw.githubusercontent.com/mdn/yari/main/client/src/lit/play/runner.js), `title="runner"` |
| MDN's sandbox attribute defeats its own sandboxing. `allow-scripts` combined with `allow-same-origin` on content the page can reach removes the sandbox's protection entirely — the combination the attribute exists to prevent. | [`play/runner.js`](https://raw.githubusercontent.com/mdn/yari/main/client/src/lit/play/runner.js); same pairing in [`EmbedLiveSample.ejs`](https://raw.githubusercontent.com/mdn/yari/main/kumascript/macros/EmbedLiveSample.ejs) |
| mdBook's search results list is unlabelled. The current row is tracked with a bare `li.focus` class — `searcher.js` contains zero occurrences of `role=`, `listbox`, `aria-activedescendant` or `aria-selected`. The rest of the shell *is* ARIA-complete (`role="menu"`/`menuitem` on the theme picker, `aria-expanded` on both toggles), so this is an isolated gap, not a general one. | [`searcher/searcher.js`](https://raw.githubusercontent.com/rust-lang/mdBook/v0.4.15/src/theme/searcher/searcher.js); contrast [`index.hbs`](https://raw.githubusercontent.com/rust-lang/mdBook/v0.4.15/src/theme/index.hbs) |
| docs.python.org's nav toggle is a checkbox with contradictory ARIA. `#menuToggler` is `<input type="checkbox" role="button" aria-pressed="false" aria-expanded="false" aria-label="Menu">`, then also declares `aria-controls="navigation"` — but the element it names is the sibling `<nav class="nav-content" role="navigation">`, which is never hidden or collapsed by the checkbox. `aria-pressed` and `aria-expanded` are both asserted as `"false"` in the template. The input is `display: none` and a 40px `<label for="menuToggler">` stands in for it visually. | [`layout.html`](https://raw.githubusercontent.com/python/python-docs-theme/main/python_docs_theme/layout.html); [`pydoctheme.css`](https://raw.githubusercontent.com/python/python-docs-theme/main/python_docs_theme/static/pydoctheme.css) `.toggler__input { display: none }` |
| docs.python.org's search inputs have no visible label. Both forms rely on `aria-label` plus `placeholder`, and the submit control is `<input type="submit" value="Go">`. | [`layout.html`](https://raw.githubusercontent.com/python/python-docs-theme/main/python_docs_theme/layout.html) |
| The Playground's result regions are plain `<pre><code>` with no live region, so streamed stdout arriving over the WebSocket is never announced. | [`Output/Section.tsx`](https://raw.githubusercontent.com/rust-lang/rust-playground/main/ui/frontend/Output/Section.tsx) |

---

## 7. Not established

Recorded so these are not mistaken for findings.

- **The live rustdoc stylesheet could not be fetched.**
  `https://doc.rust-lang.org/std/static.files/rustdoc-<hash>.css` is unavailable — the
  nightly content-hashed files are purged. The live std page reported
  `Rust 1.101.0-nightly db8f076d2` and `crates1.99.0.js`, which do not correspond to
  anything in the `main` branch source read above. All rustdoc values in §1.2 are from
  repository source, not from the served page.
- **Which python.org release and Sphinx version are deployed.** `Doc/requirements.txt`
  pins `sphinx<9.0.0` and `python-docs-theme>=2023.3.1,!=2023.7`, but the resolved version
  of the live deployment could not be read. The live page is Python 3.14.8 documentation;
  the corresponding `Doc/conf.py` revision was not identified.
- **mdBook's search result cap and term logic for the Book and for std docs.** `S`
  (keycode 83) was verified. Result caps, teaser lengths, ranking and whether
  `use-boolean-and` defaults to on or off in each shipped book were not confirmed; only
  the Rust Book's explicit `use-boolean-and = true` is sourced.
- **Whether MDN's `<ix-tab>` wrapper implements the ARIA tabs pattern** (roles,
  `aria-selected`, arrow-key roving tabindex) — [`tabs.js`](https://raw.githubusercontent.com/mdn/yari/main/client/src/lit/interactive-example/tabs.js)
  was retrieved but its tab semantics were not read in full.
- **MDN's `PLAYGROUND_BASE_HOST` in production.** It defaults to `mdnplay.dev` in
  `client/src/env.ts`; the deployed value was not confirmed.
- **Nothing about Try React**, for the reasons in §4.8.
- **No runtime or audit-tool evidence anywhere in this document.** Every accessibility
  claim in §6.3 is a source-level observation of markup or attributes. No axe, Lighthouse
  or NVDA/JAWS run was performed against any of these sites.

---

## References

Sources read for this note, in the order cited above.

**rust-lang**

- Book: [`book.toml`](https://raw.githubusercontent.com/rust-lang/book/main/book.toml), [`theme/2018-edition.css`](https://raw.githubusercontent.com/rust-lang/book/main/theme/2018-edition.css), [`theme/semantic-notes.css`](https://raw.githubusercontent.com/rust-lang/book/main/theme/semantic-notes.css), [`theme/listing.css`](https://raw.githubusercontent.com/rust-lang/book/main/theme/listing.css), [`ferris.css`](https://raw.githubusercontent.com/rust-lang/book/main/ferris.css) — <https://github.com/rust-lang/book>
- rustdoc: [`rustdoc.css`](https://raw.githubusercontent.com/rust-lang/rust/master/src/librustdoc/html/static/css/rustdoc.css), [`main.js`](https://raw.githubusercontent.com/rust-lang/rust/master/src/librustdoc/html/static/js/main.js), [`search.js`](https://raw.githubusercontent.com/rust-lang/rust/master/src/librustdoc/html/static/js/search.js), [`storage.js`](https://raw.githubusercontent.com/rust-lang/rust/master/src/librustdoc/html/static/js/storage.js), [`noscript.css`](https://raw.githubusercontent.com/rust-lang/rust/master/src/librustdoc/html/static/css/noscript.css), [`theme.rs`](https://raw.githubusercontent.com/rust-lang/rust/master/src/librustdoc/theme.rs) — <https://github.com/rust-lang/rust/tree/master/src/librustdoc/html>
- Landing page: [`src/styles/app.scss`](https://raw.githubusercontent.com/rust-lang/www.rust-lang.org/master/src/styles/app.scss), [`src/styles/fonts.scss`](https://raw.githubusercontent.com/rust-lang/www.rust-lang.org/master/src/styles/fonts.scss) — <https://github.com/rust-lang/www.rust-lang.org>
- Playground: [`README.md`](https://raw.githubusercontent.com/rust-lang/rust-playground/master/README.md), [`ui/README.md`](https://raw.githubusercontent.com/rust-lang/rust-playground/main/ui/README.md), [`public_http_api.rs`](https://raw.githubusercontent.com/rust-lang/rust-playground/main/ui/src/public_http_api.rs), [`server_axum.rs`](https://raw.githubusercontent.com/rust-lang/rust-playground/main/ui/src/server_axum.rs), [`evaluate_spec.rb`](https://raw.githubusercontent.com/rust-lang/rust-playground/main/tests/spec/requests/evaluate_spec.rb), [`ui/frontend/api.ts`](https://raw.githubusercontent.com/rust-lang/rust-playground/main/ui/frontend/api.ts), [`reducers/output/execute.ts`](https://raw.githubusercontent.com/rust-lang/rust-playground/main/ui/frontend/reducers/output/execute.ts), [`Output.tsx`](https://raw.githubusercontent.com/rust-lang/rust-playground/main/ui/frontend/Output.tsx), [`Output/SimplePane.tsx`](https://raw.githubusercontent.com/rust-lang/rust-playground/main/ui/frontend/Output/SimplePane.tsx), [`Output/Section.tsx`](https://raw.githubusercontent.com/rust-lang/rust-playground/main/ui/frontend/Output/Section.tsx), [`Output/Execute.tsx`](https://raw.githubusercontent.com/rust-lang/rust-playground/main/ui/frontend/Output/Execute.tsx), [`Output/Loader.tsx`](https://raw.githubusercontent.com/rust-lang/rust-playground/main/ui/frontend/Output/Loader.tsx), [`Loader.tsx`](https://raw.githubusercontent.com/rust-lang/rust-playground/main/ui/frontend/Loader.tsx) — <https://github.com/rust-lang/rust-playground>

**mdBook v0.4.15**

- [`variables.css`](https://raw.githubusercontent.com/rust-lang/mdBook/v0.4.15/src/theme/css/variables.css), [`general.css`](https://raw.githubusercontent.com/rust-lang/mdBook/v0.4.15/src/theme/css/general.css), [`chrome.css`](https://raw.githubusercontent.com/rust-lang/mdBook/v0.4.15/src/theme/css/chrome.css), [`index.hbs`](https://raw.githubusercontent.com/rust-lang/mdBook/v0.4.15/src/theme/index.hbs), [`book.js`](https://raw.githubusercontent.com/rust-lang/mdBook/v0.4.15/src/theme/book.js), [`searcher/searcher.js`](https://raw.githubusercontent.com/rust-lang/mdBook/v0.4.15/src/theme/searcher/searcher.js) — <https://github.com/rust-lang/mdBook/tree/v0.4.15/src/theme>

**docs.python.org**

- [`Doc/conf.py`](https://raw.githubusercontent.com/python/cpython/main/Doc/conf.py), [`Doc/requirements.txt`](https://raw.githubusercontent.com/python/cpython/main/Doc/requirements.txt), [`Doc/tools/extensions/glossary_search.py`](https://raw.githubusercontent.com/python/cpython/main/Doc/tools/extensions/glossary_search.py) — <https://github.com/python/cpython/tree/main/Doc>
- Theme: [`pydoctheme.css`](https://raw.githubusercontent.com/python/python-docs-theme/main/python_docs_theme/static/pydoctheme.css), [`pydoctheme_dark.css`](https://raw.githubusercontent.com/python/python-docs-theme/main/python_docs_theme/static/pydoctheme_dark.css), [`layout.html`](https://raw.githubusercontent.com/python/python-docs-theme/main/python_docs_theme/layout.html), [`search-focus.js`](https://raw.githubusercontent.com/python/python-docs-theme/main/python_docs_theme/static/search-focus.js), [`menu.js`](https://raw.githubusercontent.com/python/python-docs-theme/main/python_docs_theme/static/menu.js), [`themetoggle.js`](https://raw.githubusercontent.com/python/python-docs-theme/main/python_docs_theme/static/themetoggle.js), [`copybutton.js`](https://raw.githubusercontent.com/python/python-docs-theme/main/python_docs_theme/static/copybutton.js), `theme.toml` — <https://github.com/python/python-docs-theme>
- Live: <https://docs.python.org/3/library/stdtypes.html>

**MDN**

- Content: [`files/en-us/web/javascript/reference/statements/for-await...of/index.md`](https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/javascript/reference/statements/for-await...of/index.md) — <https://github.com/mdn/content>
- Site: [`kumascript/macros/EmbedLiveSample.ejs`](https://raw.githubusercontent.com/mdn/yari/main/kumascript/macros/EmbedLiveSample.ejs), [`interactive-example/index.js`](https://raw.githubusercontent.com/mdn/yari/main/client/src/lit/interactive-example/index.js), [`interactive-example/with-console.js`](https://raw.githubusercontent.com/mdn/yari/main/client/src/lit/interactive-example/with-console.js), [`interactive-example/with-choices.js`](https://raw.githubusercontent.com/mdn/yari/main/client/src/lit/interactive-example/with-choices.js), [`interactive-example/tabs.js`](https://raw.githubusercontent.com/mdn/yari/main/client/src/lit/interactive-example/tabs.js), [`interactive-example/index.scss`](https://raw.githubusercontent.com/mdn/yari/main/client/src/lit/interactive-example/index.scss), [`play/controller.js`](https://raw.githubusercontent.com/mdn/yari/main/client/src/lit/play/controller.js), [`play/runner.js`](https://raw.githubusercontent.com/mdn/yari/main/client/src/lit/play/runner.js), [`play/console.js`](https://raw.githubusercontent.com/mdn/yari/main/client/src/lit/play/console.js), [`play/console.scss`](https://raw.githubusercontent.com/mdn/yari/main/client/src/lit/play/console.scss), [`play/editor.js`](https://raw.githubusercontent.com/mdn/yari/main/client/src/lit/play/editor.js), [`ui/_vars.scss`](https://raw.githubusercontent.com/mdn/yari/main/client/src/ui/_vars.scss), [`playground/utils.ts`](https://raw.githubusercontent.com/mdn/yari/main/client/src/playground/utils.ts), [`env.ts`](https://raw.githubusercontent.com/mdn/yari/main/client/src/env.ts) — <https://github.com/mdn/yari>

**Pyodide**

- [`src/js/pyodide.ts`](https://raw.githubusercontent.com/pyodide/pyodide/main/src/js/pyodide.ts), [`src/core/error_handling.ts`](https://raw.githubusercontent.com/pyodide/pyodide/main/src/core/error_handling.ts) — <https://github.com/pyodide/pyodide>

**Retired**

- Try React redirect record, 14 July 2025 — <https://web.archive.org/web/2024/https://tryreact.com/>
