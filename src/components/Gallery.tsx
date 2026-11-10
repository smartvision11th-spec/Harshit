import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../animations/gsap';
import { useIsTabletUp, useReducedMotion } from '../hooks/useMediaQuery';
import { GALLERY } from '../config/site';

function Intro() {
  return (
    <div className="w-[80vw] shrink-0 md:w-[30vw]">
      <h2 className="display text-[clamp(3rem,5.6vw,5.6rem)]">Work that holds up under light</h2>
      <p className="mt-5 max-w-[34ch] text-silver">
        Close-ups of finishes we care about most: depth, clarity and clean reflections. Replace these placeholders with your own photography.
      </p>
    </div>
  );
}

export default function Gallery() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const tabletUp = useIsTabletUp();
  const reduced = useReducedMotion();
  const pinned = tabletUp && !reduced;

  // Desktop/tablet: vertical scroll drives a pinned horizontal track, with per-image parallax and reveal.
  useLayoutEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr || !pinned) return;

    const ctx = gsap.context(() => {
      const distance = () => Math.max(0, tr.scrollWidth - window.innerWidth);

      const scrollTween = gsap.to(tr, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      gsap.utils.toArray<HTMLElement>('[data-g-frame]').forEach((frame) => {
        const img = frame.querySelector('img');
        if (img) {
          gsap.fromTo(
            img,
            { xPercent: -8 },
            {
              xPercent: 8,
              ease: 'none',
              scrollTrigger: { trigger: frame, containerAnimation: scrollTween, start: 'left right', end: 'right left', scrub: true },
            },
          );
        }
        gsap.fromTo(
          frame,
          { clipPath: 'inset(0 0 0 100%)' },
          {
            clipPath: 'inset(0 0 0 0%)',
            ease: 'none',
            scrollTrigger: { trigger: frame, containerAnimation: scrollTween, start: 'left 100%', end: 'left 72%', scrub: true },
          },
        );
      });
    }, el);

    return () => ctx.revert();
  }, [pinned]);

  return (
    <section id="gallery" ref={root} aria-label="Gallery" className="relative bg-graphite">
      {pinned ? (
        <div className="flex h-[100svh] items-center overflow-hidden">
          <div ref={track} className="flex w-max items-center gap-[4vw] pl-[clamp(1.25rem,4vw,3.5rem)] pr-[12vw]">
            <Intro />
            {GALLERY.map((img) => (
              <div key={img.src} className={`${img.w} ${img.offset} shrink-0`}>
                <div data-g-frame className={`group relative overflow-hidden rounded-xl border border-white/10 bg-ink ${img.h}`}>
                  <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-110">
                    <img
                      src={img.src}
                      alt={img.alt}
                      width={900}
                      height={1200}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="-ml-[12.5%] h-full w-[125%] max-w-none object-cover"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-[clamp(4rem,10vw,7rem)]">
          <div className="container-x">
            <Intro />
          </div>
          <div
            className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[clamp(1.25rem,4vw,3.5rem)] pb-4"
            role="region"
            aria-label="Gallery images, scroll sideways"
            tabIndex={0}
          >
            {GALLERY.map((img) => (
              <div key={img.src} className="w-[78vw] max-w-[420px] shrink-0 snap-center sm:w-[56vw]">
                <div className="aspect-[3/4] overflow-hidden rounded-xl border border-white/10 bg-ink">
                  <img src={img.src} alt={img.alt} width={900} height={1200} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
