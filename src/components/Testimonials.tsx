import { useLayoutEffect, useRef } from 'react';
import { Quote } from 'lucide-react';
import { gsap } from '../animations/gsap';
import { staggerIn } from '../animations/scrollAnimations';
import { useReducedMotion } from '../hooks/useMediaQuery';
import { TESTIMONIALS } from '../config/site';

export default function Testimonials() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      staggerIn(gsap.utils.toArray<HTMLElement>('[data-testimonial]'), el.querySelector('[data-testimonial-grid]')!);
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="testimonials" ref={root} className="relative bg-ink py-[clamp(5rem,11vw,10rem)]" aria-labelledby="testimonials-title">
      <div className="container-x">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 id="testimonials-title" className="display text-[clamp(3rem,7vw,6.8rem)]">
            Customer words
          </h2>
          <p className="max-w-[40ch] text-smoke">Sample content below. Replace each card with a real review you have permission to publish.</p>
        </div>

        <div data-testimonial-grid className="mt-14 grid gap-6 md:grid-cols-3 md:[&>*:nth-child(2)]:mt-12">
          {TESTIMONIALS.map((t, i) => (
            <figure key={i} data-testimonial className="glass relative flex flex-col justify-between rounded-2xl p-8">
              <span className="absolute right-6 top-6 rounded-full border border-ember/50 px-3 py-1 text-xs text-ember">Sample</span>
              <Quote size={30} className="text-ember" aria-hidden="true" />
              <blockquote className="mt-6 text-lg leading-relaxed text-bone">{t.quote}</blockquote>
              <figcaption className="mt-8 border-t border-white/10 pt-4">
                <span className="block font-medium">{t.name}</span>
                <span className="text-sm text-smoke">{t.car}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
