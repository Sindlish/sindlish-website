export const countPages = (items = []) =>
  items.reduce((total, item) => {
    if (item && item.slug) {
      return total + 1;
    }

    if (Array.isArray(item?.items)) {
      return total + countPages(item.items);
    }

    return total;
  }, 0);

const slugFromPath = (path = '') => (path || '').replace(/^\/docs\/?/, '');

const itemHasSlug = (item, slug) => {
  if (!slug || !item) return false;
  if (item.slug === slug) return true;
  if (Array.isArray(item.items)) {
    return item.items.some((child) => itemHasSlug(child, slug));
  }
  return false;
};

export const findCurrentPillarIndex = (navigation = [], currentPath = '') => {
  const currentSlug = slugFromPath(currentPath);
  if (!currentSlug) return -1;

  return navigation.findIndex((pillar) => itemHasSlug(pillar, currentSlug));
};

export const getPillarSections = (items = []) => {
  return items
    .map((group) => {
      if (group && Array.isArray(group.items)) {
        return {
          title: group.section || null,
          pages: group.items.filter((page) => page && page.slug),
        };
      }

      if (group && group.slug) {
        return {
          title: null,
          pages: [group],
        };
      }

      return null;
    })
    .filter(Boolean);
};

export default {
  countPages,
  findCurrentPillarIndex,
  getPillarSections,
  slugFromPath,
};
