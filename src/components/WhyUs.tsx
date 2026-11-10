import { useLayoutEffect, useRef } from 'react';
import { Eye, FlaskConical, ThumbsUp, UserCheck, Wrench, type LucideIcon } from 'lucide-react';
import { gsap } from '../animations/gsap';
import { staggerIn } from '../animations/scrollAnimations';
import { useReducedMotion } from '../hooks/useMediaQuery';
import { WHY_US } from '../config/site';

const ICONS: LucideIcon[] = [Wrench, UserCheck, FlaskConical, Eye, ThumbsUp];

export default function WhyUs() {
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced || !list.current) return;
    const ctx = gsap.context(() => {
      staggerIn(gsap.utils.toArray<HTMLElement>('[data-why-row]'), list.current!, { stagger: 0.14 });
      gsap.fromTo(
        '[data-rule]',
        { scaleX: 0 },
        {
          scaleX: 1,
          transformOrigin: '0 50%',
          duration: 1.3,
          ease: 'power3.inOut',
          stagger: 0.14,
          scrollTrigger: { trigger: list.current, start: 'top 82%', once: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="why-us" ref={root} className="relative bg-ink py-[clamp(5rem,11vw,10rem)]" aria-labelledby="why-title">
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <h2 id="why-title" className="display text-[clamp(3rem,6.6vw,6.6rem)]">
              Why choose Velocity
            </h2>
            <p className="mt-6 max-w-[40ch] text-silver">
              Good detailing is slow, careful work done with the right tools. This is how we approach every car that comes through the studio.
            </p>
          </div>
        </div>

        <ul ref={list} className="lg:col-span-7">
          {WHY_US.map((item, i) => {
            const Icon = ICONS[i] ?? Wrench;
            return (
              <li key={item.title} data-why-row className="group relative py-8 md:py-10">
                <div data-rule className="absolute inset-x-0 top-0 h-px bg-white/15" aria-hidden="true" />
                <div className="flex items-start gap-6 transition-transform duration-500 ease-out group-hover:translate-x-2">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/15 text-ember transition-colors duration-300 group-hover:border-ember group-hover:bg-ember/10">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="display text-[clamp(2rem,3.4vw,3rem)]">{item.title}</h3>
                    <p className="mt-2 max-w-[46ch] text-smoke">{item.text}</p>
                  </div>
                </div>
              </li>
            );
          })}
          <li aria-hidden="true" className="relative h-px">
            <div data-rule className="absolute inset-x-0 top-0 h-px bg-white/15" />
          </li>
        </ul>
      </div>
    </section>
  );
}
