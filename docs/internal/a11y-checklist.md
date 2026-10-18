# Manual accessibility checklist

Eight checks the automated gates cannot make (spec #44): tooling catches
roughly a third of real issues, the rest are found by a person with a
keyboard, a screen reader and a narrow window. This list is **part of the
merge bar** for the rebuild: run it before a PR claiming UI changes lands,
and record the result in the PR description.

Each item names the route to load, the selector that scopes what to inspect,
how to verify by hand, and what enforcement already exists so nobody re-tests
what a gate already proves. The structure of this file is itself gated —
`npm run check:a11y` fails if an item loses its route, selector, steps or
enforcement line, or if a route no longer exists in the app.

### 1. Focus order through the sticky header

- **Route:** `/docs/basics/variables`
- **Selector:** `header a[href], header button, [role="navigation"] a`
- **How to verify:** Load the page, click nothing, and press Tab from the top. Focus must travel through the header and sidebar in visual order (logo → primary nav → search → theme toggle → sidebar links), never jumping into the article before the chrome is exhausted, and never sticking on one element.
- **Enforcement:** manual keyboard pass; `eslint-plugin-jsx-a11y` covers the static markup half but cannot see visual order.

### 2. A working skip link

- **Route:** `/`
- **Selector:** `a[href="#main"]`
- **How to verify:** Press Tab once from the top of the page: "Skip to content" must become visible (it is `sr-only` until focused), and pressing Enter must move focus into the `#main` landmark so the next Tab lands in the content, not the header.
- **Enforcement:** manual focus pass; the component itself is `src/components/shared/skip-link`.

### 3. Alt text that says the function

- **Route:** `/docs`
- **Selector:** `img[alt]`
- **How to verify:** Every image's `alt` describes what it shows or does, not its filename ("screenshot of the install dialog", not "Screenshot 2024-06-01"); purely decorative images use `alt=""`. Today no docs page ships an image, so this is a gate-on-arrival check: the first screenshot added must pass before merge. (Gate 3 already proves the referenced file exists.)
- **Enforcement:** manual read of every `alt`; `jsx-a11y/alt-text` catches only the missing case.

### 4. The page makes sense read aloud

- **Route:** `/docs/basics/variables`
- **Selector:** `main h1, main h2, main h3, main a`
- **How to verify:** Walk the heading outline (a screen reader's rotor, or the DOM) top to bottom: no skipped levels, every heading describes the section under it, and every link's text means something out of context ("Read and parse user input", not "click here").
- **Enforcement:** manual read-through; heading order is not lintable with confidence.

### 5. Scrollable code blocks reachable and named

- **Route:** `/docs/basics/variables`
- **Selector:** `.code-block div[tabindex]`
- **How to verify:** A code block wider than the column must be keyboard-reachable: Tab into its scroll region, then arrow-key horizontally through the whole snippet without the page scrolling away. The region announces a name when the fence declares one (filename), so a screen reader user knows what they are scrolling.
- **Enforcement:** manual keyboard pass on the widest block on the page.

### 6. Workbench panes operable, divider not a trap

- **Route:** `/workbench`
- **Selector:** `[role="separator"]`
- **How to verify:** Both panes (editor and output) are independently scrollable and focusable. The divider takes focus, and with it Left/Right resizes and Home/End jump to the limits; focus must always be able to leave the divider (no trap) and reach the Run button and the output.
- **Enforcement:** manual keyboard pass; the divider's ARIA contract is unit-covered by the workbench components.

### 7. Colour never the only signal

- **Route:** `/docs`
- **Selector:** `div[role="region"][aria-label]`
- **How to verify:** Admonitions (note, warning, …) carry an icon and a text title, not just a tint — check one of each type in the rendered docs. Same rule anywhere else colour distinguishes state: errors, active tabs, form validation.
- **Enforcement:** manual visual check in both light and dark themes.

### 8. Survival at 200% zoom and 320px

- **Route:** `/docs`
- **Selector:** `body`
- **How to verify:** At 200% browser zoom, and at a 320px-wide viewport (a 320×640 device or devtools emulation): no horizontal scrollbar at page level, no clipped or overlapping text, the nav still reachable, and every control still tappable at 44px.
- **Enforcement:** manual viewport pass on every template (docs page, docs index, workbench, home).
