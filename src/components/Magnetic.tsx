import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from '../animations/gsap';
import { useCoarsePointer, useReducedMotion } from '../hooks/useMediaQuery';

type Props = { children: ReactNode; strength?: number; className?: string };

/** Wraps a button so it gently follows the pointer. Disabled on touch devices and for reduced motion. */
export default function Magnetic({ children, strength = 0.35, className = '' }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const coarse = useCoarsePointer();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || coarse) return;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      gsap.set(el, { clearProps: 'transform' });
    };
  }, [reduced, coarse, strength]);

  return (
    <span ref={ref} className={`inline-block -m-3 p-3 ${className}`}>
      {children}
    </span>
  );
}
