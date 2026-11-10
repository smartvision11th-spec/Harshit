import { useEffect, useRef } from 'react';
import { gsap } from '../animations/gsap';
import { useReducedMotion } from '../hooks/useMediaQuery';

/** Thin ember bar at the top of the viewport showing page scroll progress. */
export default function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.set(el, { scaleX: 0, transformOrigin: '0 50%' });
      gsap.to(el, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: reduced ? true : 0.2,
        },
      });
    });
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px]" aria-hidden="true">
      <div ref={bar} className="h-full w-full bg-ember will-change-transform" />
    </div>
  );
}
