import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap';
import { useReducedMotion } from '../hooks/useMediaQuery';

type ScrollOptions = { offset?: number; immediate?: boolean };

type SmoothScrollApi = {
  scrollTo: (target: string | number, options?: ScrollOptions) => void;
  stop: () => void;
  start: () => void;
};

const noop = () => undefined;
const SmoothScrollContext = createContext<SmoothScrollApi>({ scrollTo: noop, stop: noop, start: noop });

export const useSmoothScroll = () => useContext(SmoothScrollContext);

type Props = { children: ReactNode; locked?: boolean };

/**
 * Lenis smooth scrolling wired into GSAP's ticker so ScrollTrigger stays in sync.
 * Falls back to native scrolling when the visitor prefers reduced motion.
 */
export function SmoothScrollProvider({ children, locked = false }: Props) {
  const lenisRef = useRef<Lenis | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  // Lock scrolling while the preloader is visible.
  useEffect(() => {
    document.documentElement.classList.toggle('is-loading', locked);
    const lenis = lenisRef.current;
    if (lenis) {
      if (locked) lenis.stop();
      else lenis.start();
    }
    return () => document.documentElement.classList.remove('is-loading');
  }, [locked, reduced]);

  const scrollTo = useCallback((target: string | number, options: ScrollOptions = {}) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { offset: options.offset ?? 0, immediate: options.immediate, duration: 1.6 });
      return;
    }
    if (typeof target === 'number') {
      window.scrollTo({ top: target + (options.offset ?? 0) });
      return;
    }
    if (target === '#top') {
      window.scrollTo({ top: 0 });
      return;
    }
    const el = document.querySelector(target);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY + (options.offset ?? 0);
      window.scrollTo({ top });
    }
  }, []);

  const stop = useCallback(() => {
    lenisRef.current?.stop();
    if (!lenisRef.current) document.documentElement.style.overflow = 'hidden';
  }, []);
  const start = useCallback(() => {
    lenisRef.current?.start();
    document.documentElement.style.overflow = '';
  }, []);

  const api = useMemo(() => ({ scrollTo, stop, start }), [scrollTo, stop, start]);

  return <SmoothScrollContext.Provider value={api}>{children}</SmoothScrollContext.Provider>;
}
