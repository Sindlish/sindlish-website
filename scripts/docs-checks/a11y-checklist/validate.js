/**
 * Manual a11y checklist gate (issue #52): the eight-item checklist in
 * `docs/internal/a11y-checklist.md` stays structurally intact and points only
 * at routes that still exist.
 *
 * The items themselves are human work — a keyboard, a screen reader, a narrow
 * window. What this gate proves is that the list is still the eight checks
 * spec #44 named, that each still says where to look, how to verify and what
 * is already enforced, and that nobody is sent to a route the rebuild has
 * since retired.
 */

const fs = require('fs');
const path = require('path');

const { buildInventory } = require('../_lib/inventory');
const { resolveInternalHref } = require('../internal-links/links');

const { parseChecklist, validateRoutes } = require('./checklist');

const CHECKLIST = 'docs/internal/a11y-checklist.md';

/**
 * Run the gate over the real tree.
 *
 * @param {string} [projectRoot=process.cwd()] Repository root.
 * @returns {{invocations: number, errors: {kind: string, file: string, line: number, raw: string, message: string}[]}} Report.
 */
function validate(projectRoot = process.cwd()) {
  const markdown = fs.readFileSync(path.join(projectRoot, CHECKLIST), 'utf8');
  const { items, errors: structuralErrors } = parseChecklist(markdown);

  const inventory = buildInventory(projectRoot);
  const routeExists = (route) => resolveInternalHref(route, inventory).ok;

  const errors = [...structuralErrors, ...validateRoutes(items, routeExists)].map((error) => ({
    file: CHECKLIST,
    ...error,
  }));

  return { invocations: items.length, errors };
}

module.exports = { validate };
