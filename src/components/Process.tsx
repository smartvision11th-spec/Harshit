import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../animations/gsap';
import { maskReveal, staggerIn } from '../animations/scrollAnimations';
import { useIsDesktop, useReducedMotion } from '../hooks/useMediaQuery';
import { PROCESS_STEPS } from '../config/site';

const pad = (n: number) => String(n + 1).padStart(2, '0');

export default function Process() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();
  const reduced = useReducedMotion();
  const pinned = isDesktop && !reduced;
  const n = PROCESS_STEPS.length;

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      if (pinned && pin.current) {
        const layers = gsap.utils.toArray<HTMLElement>('[data-layer]');
        const layerImgs = gsap.utils.toArray<HTMLElement>('[data-layer-img]');
        const steps = gsap.utils.toArray<HTMLElement>('[data-step]');
        const texts = gsap.utils.toArray<HTMLElement>('[data-step-text]');

        gsap.set(layers.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' });
        gsap.set(layerImgs.slice(1), { scale: 1.25 });
        gsap.set(steps.slice(1), { opacity: 0.3 });
        gsap.set(texts.slice(1), { height: 0, opacity: 0 });

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: pin.current,
            start: 'top top',
            end: `+=${n * 85}%`,
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
          },
        });

        tl.to({}, { duration: n }, 0);
        tl.fromTo('[data-line]', { scaleY: 0 }, { scaleY: 1, duration: n - 1, transformOrigin: '50% 0%' }, 0.2);

        for (let i = 1; i < n; i++) {
          tl.to(layers[i], { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power2.inOut' }, i - 0.45);
          tl.to(layerImgs[i], { scale: 1, duration: 0.9 }, i - 0.45);
          tl.to(steps[i], { opacity: 1, duration: 0.2 }, i - 0.2);
          tl.to(texts[i], { height: 'auto', opacity: 1, duration: 0.25, ease: 'power2.out' }, i - 0.2);
        }
        for (let i = 0; i < n - 1; i++) {
          tl.to(steps[i], { opacity: 0.3, duration: 0.2 }, i + 0.8);
          tl.to(texts[i], { height: 0, opacity: 0, duration: 0.25, ease: 'power2.in' }, i + 0.75);
        }
      } else if (!reduced) {
        gsap.utils.toArray<HTMLElement>('[data-m-image]').forEach((img) => maskReveal(img));
        staggerIn(gsap.utils.toArray<HTMLElement>('[data-m-copy]'), el, { stagger: 0.05 });
      }
    }, el);

    return () => ctx.revert();
  }, [pinned, reduced, n]);

  return (
    <section id="process" ref={root} className="relative bg-ink" aria-labelledby="process-title">
      {pinned ? (
        <div ref={pin} className="relative flex h-[100svh] items-center overflow-hidden">
          <div className="container-x grid w-full grid-cols-12 items-center gap-10">
            <div className="col-span-5">
              <h2 id="process-title" className="display text-[clamp(3rem,5.6vw,5.6rem)]">
                The Velocity process
              </h2>

              <div className="relative mt-10 pl-9">
                <div className="absolute bottom-2 left-[7px] top-2 w-px bg-white/10">
                  <div data-line className="h-full w-full origin-top bg-ember" />
                </div>
                <ol className="space-y-6">
                  {PROCESS_STEPS.map((step, i) => (
                    <li key={step.title} data-step className="relative">
                      <span className="absolute -left-9 top-[0.55rem] h-[15px] w-[15px] rounded-full border border-white/30 bg-ink" aria-hidden="true" />
                      <div className="flex items-baseline gap-4">
                        <span className="text-sm tabular-nums text-smoke">{pad(i)}</span>
                        <h3 className="display text-[clamp(1.9rem,2.8vw,2.7rem)]">{step.title}</h3>
                      </div>
                      <div data-step-text className="overflow-hidden">
                        <p className="max-w-[44ch] pb-1 pl-9 pt-2 text-silver">{step.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="col-span-7">
              <div className="relative h-[72svh] overflow-hidden rounded-2xl border border-white/10 bg-graphite">
                {PROCESS_STEPS.map((step, i) => (
                  <div key={step.title} data-layer className="absolute inset-0 overflow-hidden">
                    <img
                      data-layer-img
                      src={step.image}
                      alt={`${step.title} stage, illustrative image`}
                      width={1000}
                      height={1250}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container-x py-[clamp(5rem,12vw,9rem)]">
          <h2 id="process-title" className="display text-[clamp(3rem,12vw,5rem)]">
            The Velocity process
          </h2>
          <ol className="mt-12 space-y-16">
            {PROCESS_STEPS.map((step, i) => (
              <li key={step.title} className="grid gap-6 md:grid-cols-2 md:items-center md:gap-10">
                <div data-m-image className="aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-graphite">
                  <img
                    src={step.image}
                    alt={`${step.title} stage, illustrative image`}
                    width={1000}
                    height={1250}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div data-m-copy>
                  <span className="text-sm tabular-nums text-ember">{pad(i)}</span>
                  <h3 className="display mt-1 text-4xl md:text-5xl">{step.title}</h3>
                  <p className="mt-3 max-w-[44ch] text-silver">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
