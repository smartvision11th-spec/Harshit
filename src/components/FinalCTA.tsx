import { useLayoutEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import { gsap } from '../animations/gsap';
import { useSmoothScroll } from '../animations/SmoothScroll';
import { useReducedMotion } from '../hooks/useMediaQuery';
import { SITE } from '../config/site';
import Magnetic from './Magnetic';
import { Chars } from './SplitText';

export default function FinalCTA() {
  const root = useRef<HTMLElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const { scrollTo } = useSmoothScroll();
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced || !bg.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        bg.current,
        { clipPath: 'circle(7% at 50% 55%)', scale: 1.25 },
        {
          clipPath: 'circle(80% at 50% 55%)',
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 85%', end: 'center 45%', scrub: true },
        },
      );
      gsap.fromTo(
        '[data-char]',
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 0.9,
          ease: 'power4.out',
          stagger: 0.03,
          scrollTrigger: { trigger: el, start: 'top 55%', once: true },
        },
      );
      gsap.fromTo(
        '[data-cta-fade]',
        { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12, scrollTrigger: { trigger: el, start: 'top 45%', once: true } },
      );
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  const waHref = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(`Hello ${SITE.name}, I'd like to know more about your detailing services.`)}`;

  return (
    <section
      ref={root}
      aria-labelledby="cta-title"
      className="relative flex min-h-[90svh] items-center justify-center overflow-hidden bg-ink py-32"
    >
      <div ref={bg} className="absolute inset-0 will-change-transform">
        <img src="/images/cta-bg.webp" alt="" width={1800} height={1100} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/40" />
      </div>

      <div className="container-x relative z-10 text-center">
        <h2 id="cta-title" className="display mx-auto max-w-[14ch] text-[clamp(3.6rem,13vw,11rem)]">
          <Chars text="Let's perfect your car." />
        </h2>
        <p data-cta-fade className="mx-auto mt-8 max-w-[42ch] text-lg text-silver">
          Tell us about your car and what you would like done. We will come back with a clear plan and quote.
        </p>
        <div data-cta-fade className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Magnetic strength={0.4}>
            <a
              href="#booking"
              onClick={(e) => {
                e.preventDefault();
                scrollTo('#booking');
              }}
              className="btn btn-primary h-14 px-8 text-base"
            >
              Book Your Experience
            </a>
          </Magnetic>
          <Magnetic strength={0.4}>
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-ghost h-14 px-8 text-base">
              <MessageCircle size={20} aria-hidden="true" />
              Chat on WhatsApp
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
