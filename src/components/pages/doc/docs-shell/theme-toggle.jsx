'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const ICONS = {
  system: (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18" />
    </svg>
  ),
  light: (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
    </svg>
  ),
  dark: (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
    </svg>
  ),
};

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = mounted ? theme || 'system' : 'system';

  const cycle = () => {
    const order = ['system', 'light', 'dark'];
    const idx = order.indexOf(current);
    const next = order[(idx + 1) % order.length];
    setTheme(next);
  };

  return (
    <button
      aria-label={`Theme: ${current}`}
      className="flex size-8 items-center justify-center rounded-sm border border-transparent text-text-secondary transition-colors hover:border-border hover:text-text-primary"
      onClick={cycle}
      type="button"
    >
      {ICONS[current] || ICONS.system}
    </button>
  );
};

export default ThemeToggle;
