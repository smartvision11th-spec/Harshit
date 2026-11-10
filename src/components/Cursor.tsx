import { useEffect, useRef } from 'react';
import { gsap } from '../animations/gsap';
import { useMediaQuery, useReducedMotion } from '../hooks/useMediaQuery';

/** Desktop-only custom cursor: a small dot plus a trailing ring that grows over interactive elements. */
export default function Cursor() {
  const fine = useMediaQuery('(hover: hover) and (pointer: fine)');
  const reduced = useReducedMotion();
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const dotEl = dot.current;
    const ringEl = ring.current;
    const labelEl = label.current;
    if (!fine || reduced || !dotEl || !ringEl || !labelEl) return;

    document.documentElement.classList.add('has-custom-cursor');
    gsap.set([dotEl, ringEl], { xPercent: -50, yPercent: -50, opacity: 0 });

    const dx = gsap.quickTo(dotEl, 'x', { duration: 0.08, ease: 'none' });
    const dy = gsap.quickTo(dotEl, 'y', { duration: 0.08, ease: 'none' });
    const rx = gsap.quickTo(ringEl, 'x', { duration: 0.4, ease: 'power3.out' });
    const ry = gsap.quickTo(ringEl, 'y', { duration: 0.4, ease: 'power3.out' });

    let visible = false;
    const show = () => {
      if (visible) return;
      visible = true;
      gsap.to([dotEl, ringEl], { opacity: 1, duration: 0.3 });
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      show();
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };

    const onOver = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest?.('a, button, [role="button"], input[type="range"], [data-cursor]');
      if (target) {
        const text = (target as HTMLElement).dataset.cursor ?? '';
        labelEl.textContent = text;
        gsap.to(ringEl, { scale: text ? 2.6 : 1.7, backgroundColor: 'rgba(255,90,31,0.16)', borderColor: 'rgba(255,90,31,0.9)', duration: 0.3 });
        gsap.to(dotEl, { scale: text ? 0 : 0.6, duration: 0.2 });
      } else {
        labelEl.textContent = '';
        gsap.to(ringEl, { scale: 1, backgroundColor: 'rgba(255,90,31,0)', borderColor: 'rgba(245,245,245,0.55)', duration: 0.3 });
        gsap.to(dotEl, { scale: 1, duration: 0.2 });
      }
    };

    const onLeaveDoc = () => {
      visible = false;
      gsap.to([dotEl, ringEl], { opacity: 0, duration: 0.2 });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeaveDoc);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      document.documentElement.removeEventListener('mouseleave', onLeaveDoc);
      document.documentElement.classList.remove('has-custom-cursor');
      gsap.killTweensOf([dotEl, ringEl]);
    };
  }, [fine, reduced]);

  if (!fine || reduced) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[120]">
      <div
        ref={ring}
        className="absolute left-0 top-0 grid h-9 w-9 place-items-center rounded-full border border-white/55 will-change-transform"
      >
        <span ref={label} className="select-none text-[0.42rem] font-semibold uppercase tracking-widest text-bone" />
      </div>
      <div ref={dot} className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-ember will-change-transform" />
    </div>
  );
}
