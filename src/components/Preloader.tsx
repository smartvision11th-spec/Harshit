import { useEffect, useRef } from 'react';
import { gsap } from '../animations/gsap';
import { useReducedMotion } from '../hooks/useMediaQuery';

type Props = { onDone: () => void };

/** Full-screen loader: the wordmark fills from the bottom as the counter climbs, then the panel lifts away. */
export default function Preloader({ onDone }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    let cancelled = false;
    const fontsReady: Promise<unknown> = Promise.race([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);

    const state = { p: 0 };
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.to(state, {
        p: 100,
        duration: reduced ? 0.25 : 1.9,
        ease: 'power2.inOut',
        onUpdate: () => {
          const p = Math.round(state.p);
          if (count.current) count.current.textContent = String(p).padStart(3, '0');
          if (fill.current) fill.current.style.clipPath = `inset(${100 - state.p}% 0 0 0)`;
          if (line.current) line.current.style.transform = `scaleX(${state.p / 100})`;
        },
      });

      // Hold until web fonts are ready so the hero never flashes unstyled text.
      tl.add(() => {
        tl.pause();
        fontsReady.then(() => {
          if (!cancelled) tl.play();
        });
      });

      tl.to(content.current, { opacity: 0, y: -20, duration: reduced ? 0.1 : 0.45, ease: 'power2.in' }, '+=0.15');
      tl.to(
        root.current,
        {
          yPercent: -100,
          duration: reduced ? 0.2 : 0.95,
          ease: 'power4.inOut',
          onStart: () => doneRef.current(),
        },
        '-=0.1',
      );
      tl.set(root.current, { display: 'none' });
    }, root);

    return () => {
      cancelled = true;
      ctx.revert();
    };
  }, [reduced]);

  return (
    <div
      ref={root}
      role="status"
      aria-label="Loading Velocity Auto Detailing"
      className="fixed inset-0 z-[200] flex flex-col justify-between bg-ink px-[clamp(1.25rem,4vw,3.5rem)] py-8"
    >
      <div ref={content} className="flex h-full flex-col justify-between">
        <p className="text-sm text-smoke">Velocity Auto Detailing</p>

        <div className="relative mx-auto select-none">
          <span className="display outline-text block text-[clamp(4.5rem,22vw,15rem)]" aria-hidden="true">
            Velocity
          </span>
          <span
            ref={fill}
            className="display absolute inset-0 block text-[clamp(4.5rem,22vw,15rem)] text-bone"
            style={{ clipPath: 'inset(100% 0 0 0)' }}
            aria-hidden="true"
          >
            Velocity
          </span>
        </div>

        <div>
          <div className="flex items-end justify-between">
            <span ref={count} className="display text-5xl tabular-nums text-bone">
              000
            </span>
            <span className="text-sm text-smoke">Preparing the studio</span>
          </div>
          <div className="mt-4 h-px w-full bg-white/10">
            <div ref={line} className="h-full origin-left bg-ember" style={{ transform: 'scaleX(0)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
