import { useEffect, useState } from 'react';

/** Subscribes to a CSS media query. Safe on first render (reads synchronously in the browser). */
export function useMediaQuery(query: string, defaultValue = false): boolean {
  const [matches, setMatches] = useState<boolean>(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : defaultValue,
  );

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
/** True on touch-first devices (phones, most tablets). */
export const useCoarsePointer = () => useMediaQuery('(pointer: coarse)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
export const useIsTabletUp = () => useMediaQuery('(min-width: 768px)');
