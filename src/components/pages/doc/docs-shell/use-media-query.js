'use client';

import { useEffect, useState } from 'react';

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return undefined;
    }

    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);

    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
};

export default useMediaQuery;
