import { useLayoutEffect, useRef, useState } from 'react';
import { ChevronsLeftRight } from 'lucide-react';
import { gsap } from '../animations/gsap';
import { maskReveal } from '../animations/scrollAnimations';
import { useReducedMotion } from '../hooks/useMediaQuery';

export default function BeforeAfter() {
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const [pos, setPos] = useState(50);
  const reduced = useReducedMotion();

  // Reveal the frame, then sweep the divider once to hint that it can be dragged.
  useLayoutEffect(() => {
    const el = root.current;
    const fr = frame.current;
    if (!el || !fr || reduced) return;
    const ctx = gsap.context(() => {
      maskReveal(fr);
      const state = { v: 96 };
      tween.current = gsap.fromTo(
        state,
        { v: 96 },
        {
          v: 50,
          duration: 2.2,
          ease: 'power3.inOut',
          onUpdate: () => setPos(state.v),
          scrollTrigger: { trigger: fr, start: 'top 65%', once: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    tween.current?.kill();
    setPos(Number(e.target.value));
  };

  return (
    <section id="results" ref={root} className="relative bg-graphite py-[clamp(5rem,11vw,10rem)]" aria-labelledby="results-title">
      <div className="container-x">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 id="results-title" className="display text-[clamp(3rem,7.4vw,7.2rem)]">
            See the difference
          </h2>
          <p className="max-w-[40ch] text-silver">
            Drag the divider to compare untreated paint with a professionally corrected and protected finish.
          </p>
        </div>

        <div
          ref={frame}
          className="relative mt-12 aspect-[4/3] w-full select-none overflow-hidden rounded-2xl border border-white/10 bg-ink sm:aspect-[16/10]"
        >
          <img
            src="/images/after.webp"
            alt="Paint after professional correction: deep gloss with sharp, clean reflections"
            width={1600}
            height={1000}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <img
              src="/images/before.webp"
              alt="Untreated paint with swirl marks and surface haze"
              width={1600}
              height={1000}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          <span className="glass pointer-events-none absolute left-4 top-4 rounded-full px-4 py-1.5 text-sm font-medium">Before</span>
          <span className="glass pointer-events-none absolute right-4 top-4 rounded-full px-4 py-1.5 text-sm font-medium">After</span>

          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={pos}
            onChange={onChange}
            aria-label="Before and after comparison. Move left or right to reveal more of each image."
            className="compare-range absolute inset-0 z-10 h-full w-full cursor-ew-resize opacity-0"
            style={{ touchAction: 'pan-y' }}
          />

          <div className="pointer-events-none absolute inset-y-0 z-[5] w-px bg-white/80" style={{ left: `${pos}%` }} aria-hidden="true">
            <div
              data-handle
              className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ember text-ink shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            >
              <ChevronsLeftRight size={22} />
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-smoke">Illustrative placeholder images. Replace before.webp and after.webp with photos of your own work.</p>
      </div>
    </section>
  );
}
