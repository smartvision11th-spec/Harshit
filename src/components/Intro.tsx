import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../animations/gsap';
import { maskReveal, parallaxY, scrubWords, staggerIn } from '../animations/scrollAnimations';
import { useReducedMotion } from '../hooks/useMediaQuery';
import { Words } from './SplitText';

const APPROACH = [
  { title: 'Inspection first', text: 'Every job starts with a close look at the paint, so the work is planned around your car.' },
  { title: 'The right product', text: 'Chemistry and coatings are chosen for the surface in front of us, not from a one-size routine.' },
  { title: 'Handover in daylight', text: 'We check the finish in natural light with you before the keys change hands.' },
];

export default function Intro() {
  const root = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced || !heading.current || !frame.current || !image.current) return;
    const ctx = gsap.context(() => {
      scrubWords(gsap.utils.toArray<HTMLElement>('[data-word]', heading.current), heading.current!, 'bottom 50%');
      maskReveal(frame.current!);
      parallaxY(image.current!, frame.current!, 34);
      staggerIn(gsap.utils.toArray<HTMLElement>('[data-approach]'), el.querySelector('[data-approach-wrap]')!);
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="about" ref={root} className="relative bg-ink py-[clamp(6rem,14vw,12rem)]">
      <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <h2 ref={heading} className="display text-[clamp(3rem,8.4vw,8.6rem)]">
            <Words text="Your car deserves more than a wash." />
          </h2>
          <p className="mt-10 max-w-[52ch] text-lg text-silver">
            Velocity is a detailing studio built around patience. We take the time to inspect, correct and protect your
            paint, so the finish looks sharper and stays that way. No rushed jobs and no shortcuts, just careful work on
            every panel.
          </p>
        </div>

        <div className="lg:col-span-5 lg:pt-24">
          <div ref={frame} className="relative aspect-[4/5] overflow-hidden rounded-sm border border-white/10 bg-graphite">
            <img
              ref={image}
              src="/images/gallery-3.webp"
              alt="Deep black paint with a mirror finish reflecting studio lights"
              width={900}
              height={1200}
              loading="lazy"
              decoding="async"
              className="absolute inset-x-0 -top-[10%] h-[120%] w-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="container-x mt-[clamp(4rem,9vw,8rem)]" data-approach-wrap>
        <ul className="grid gap-10 md:grid-cols-3 md:gap-8">
          {APPROACH.map((item) => (
            <li key={item.title} data-approach className="border-t border-white/15 pt-6">
              <h3 className="display text-3xl text-bone">{item.title}</h3>
              <p className="mt-3 max-w-[34ch] text-smoke">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
