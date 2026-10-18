/**
 * Pure parsing for the manual a11y checklist gate (issue #52).
 *
 * The checklist is prose for humans; this module makes its *structure*
 * checkable so the doc cannot quietly rot into "## stuff we should test":
 * exactly eight numbered items, each naming a route, a selector, the manual
 * steps and the enforcement that already exists.
 */

/** Every item must state all four. */
const REQUIRED_FIELDS = ['Route', 'Selector', 'How to verify', 'Enforcement'];

/** Spec #44 fixes the bar at eight manual checks. */
const EXPECTED_ITEMS = 8;

const ITEM_HEADING = /^###\s+(\d+)\.\s+(.+)$/;
const FIELD_BULLET = /^-\s+\*\*([^*:]+):\*\*\s*(.*)$/;

/**
 * Parse the checklist markdown.
 *
 * @param {string} markdown File contents.
 * @returns {{items: {number: number, heading: string, fields: {Route?: {value: string, line: number}, Selector?: {value: string, line: number}, [key: string]: {value: string, line: number} | undefined}, line: number}[], errors: {kind: string, line: number, raw: string, message: string}[]}} Parsed items and structural errors.
 */
function parseChecklist(markdown) {
  const lines = markdown.split(/\r?\n/);
  const items = [];
  const errors = [];

  let current = null;

  lines.forEach((line, index) => {
    const heading = line.match(ITEM_HEADING);

    if (heading) {
      current = { number: Number(heading[1]), heading: heading[2], fields: {}, line: index + 1 };
      items.push(current);
      return;
    }

    const field = line.match(FIELD_BULLET);
    if (field && current) {
      current.fields[field[1]] = { value: field[2].trim(), line: index + 1 };
    }
  });

  if (items.length !== EXPECTED_ITEMS) {
    errors.push({
      kind: 'a11y-checklist/item-count',
      line: 1,
      raw: String(items.length),
      message: `the checklist must contain exactly ${EXPECTED_ITEMS} numbered items (spec #44), found ${items.length}`,
    });
  }

  for (const item of items) {
    for (const field of REQUIRED_FIELDS) {
      const parsed = item.fields[field];

      if (!parsed) {
        errors.push({
          kind: 'a11y-checklist/missing-field',
          line: item.line,
          raw: field,
          message: `checklist item ${item.number} ("${item.heading}") has no "- **${field}:** ..." line`,
        });
      } else if (!parsed.value) {
        errors.push({
          kind: 'a11y-checklist/empty-field',
          line: parsed.line,
          raw: field,
          message: `checklist item ${item.number} ("${item.heading}") has an empty "${field}" value`,
        });
      }
    }
  }

  return { items, errors };
}

/**
 * Validate each item's Route: a single `/`-rooted path that resolves.
 *
 * @param {{number: number, heading: string, fields: {Route?: {value: string, line: number}}}[]} items Parsed items.
 * @param {(route: string) => boolean} routeExists Resolver, usually the internal-links inventory.
 * @returns {{kind: string, line: number, raw: string, message: string}[]} Errors.
 */
function validateRoutes(items, routeExists) {
  const errors = [];

  for (const item of items) {
    const route = item.fields.Route;
    if (!route) continue;

    const value = route.value.replace(/^`|`$/g, '');

    if (!value.startsWith('/')) {
      errors.push({
        kind: 'a11y-checklist/invalid-route',
        line: route.line,
        raw: route.value,
        message: `checklist item ${item.number} ("${item.heading}") route "${route.value}" is not a /-rooted site path`,
      });
      continue;
    }

    if (!routeExists(value)) {
      errors.push({
        kind: 'a11y-checklist/dead-route',
        line: route.line,
        raw: route.value,
        message: `checklist item ${item.number} ("${item.heading}") names route "${value}", which no longer resolves; re-point it at a live page`,
      });
    }
  }

  return errors;
}

module.exports = { EXPECTED_ITEMS, REQUIRED_FIELDS, parseChecklist, validateRoutes };
