import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from '../animations/gsap';
import SceneBoundary from '../three/SceneBoundary';
import { createSceneInput, type SceneInput } from '../three/sceneInput';
import { useCoarsePointer, useIsTabletUp, useReducedMotion } from '../hooks/useMediaQuery';
import { useWebGL } from '../hooks/useWebGL';
import { useInView } from '../hooks/useInView';

const CarScene = lazy(() => import('../three/CarScene'));

const CAPTIONS = [
  { title: 'Every angle, inspected.', text: 'We walk the whole car under dedicated light before and after the work, so no panel gets missed.' },
  { title: 'Light shows the truth.', text: 'Swirls, haze and fine scratches only show up under the right lighting, and that is where correction begins.' },
  { title: 'Finished to be seen up close.', text: 'The aim is paint that holds up when you stand next to it, not just from across the road.' },
] as const;

const BACKDROPS = ['/images/gallery-2.webp', '/images/gallery-4.webp', '/images/gallery-6.webp'] as const;

export default function CarShowcase() {
  const [root, inView] = useInView<HTMLElement>('300px 0px');
  const input = useRef<SceneInput>(createSceneInput());
  const reduced = useReducedMotion();
  const coarse = useCoarsePointer();
  const tabletUp = useIsTabletUp();
  const webgl = useWebGL();
  const [mount, setMount] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // Mount the canvas the first time the section approaches the viewport.
  useEffect(() => {
    if (inView && webgl) setMount(true);
  }, [inView, webgl]);

  // Reduced motion: static three-quarter view, no pinning.
  useEffect(() => {
    if (reduced) input.current.progress = 0.45;
  }, [reduced]);

  // Pinned, scroll-scrubbed story: the car turns, captions and backdrops hand over to each other.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      const caps = gsap.utils.toArray<HTMLElement>('[data-cap]');
      const bgs = gsap.utils.toArray<HTMLElement>('[data-showcase-bg]');

      gsap.set(bgs, { opacity: 0 });
      gsap.set(bgs[0], { opacity: 0.5 });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: tabletUp ? '+=300%' : '+=240%',
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          onUpdate: (self) => {
            input.current.progress = self.progress;
          },
        },
      });

      tl.to({}, { duration: 1 }, 0);
      tl.fromTo('[data-rail]', { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0);
      tl.fromTo('[data-showcase-word]', { xPercent: 12 }, { xPercent: -32, duration: 1 }, 0);

      caps.forEach((cap, i) => {
        const start = i * 0.34;
        tl.fromTo(cap, { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.08, ease: 'power2.out' }, start + 0.02);
        if (i < caps.length - 1) tl.to(cap, { autoAlpha: 0, y: -40, duration: 0.07, ease: 'power2.in' }, start + 0.28);
      });

      // Backdrop hand-over between the three layers.
      tl.to(bgs[0], { opacity: 0, duration: 0.12 }, 0.3);
      tl.to(bgs[1], { opacity: 0.5, duration: 0.12 }, 0.3);
      tl.to(bgs[1], { opacity: 0, duration: 0.12 }, 0.64);
      tl.to(bgs[2], { opacity: 0.5, duration: 0.12 }, 0.64);
    }, el);
    return () => ctx.revert();
  }, [reduced, tabletUp, root]);

  const showFallback = !webgl || failed;
  const quality = !tabletUp || coarse ? 'low' : 'high';

  const scene =
    mount && !showFallback ? (
      <SceneBoundary fallback={null} onError={() => setFailed(true)}>
        <Suspense fallback={null}>
          <div className={`h-full w-full transition-opacity duration-1000 ${sceneReady ? 'opacity-100' : 'opacity-0'}`}>
            <CarScene
              inputRef={input}
              variant="showcase"
              quality={quality}
              active={inView}
              onReady={() => setSceneReady(true)}
              onFail={() => setFailed(true)}
            />
          </div>
        </Suspense>
      </SceneBoundary>
    ) : null;

  if (reduced) {
    return (
      <section id="showcase" ref={root} aria-label="Vehicle showcase" className="relative bg-ink py-24">
        <div className="relative mx-auto h-[56vh] max-w-5xl">
          {showFallback ? (
            <img src="/images/hero-fallback.webp" alt="Sports car in a dark studio" width={1600} height={900} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            scene
          )}
        </div>
        <div className="container-x mt-12 grid gap-10 md:grid-cols-3">
          {CAPTIONS.map((cap) => (
            <div key={cap.title}>
              <h3 className="display text-4xl">{cap.title}</h3>
              <p className="mt-3 text-silver">{cap.text}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="showcase" ref={root} aria-label="Vehicle showcase" className="relative h-[100svh] w-full overflow-hidden bg-ink">
      {BACKDROPS.map((src) => (
        <img
          key={src}
          data-showcase-bg
          src={src}
          alt=""
          width={900}
          height={1200}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-0"
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/55 to-ink" />

      <div className="pointer-events-none absolute inset-x-0 top-[16%] overflow-hidden select-none md:top-[12%]" aria-hidden="true">
        <span data-showcase-word className="display outline-text block whitespace-nowrap text-[clamp(7rem,34vw,34rem)] leading-none">
          Every detail
        </span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[36%] top-[8%] md:inset-0 md:bottom-0 md:top-0">
        {showFallback ? (
          <img
            src="/images/hero-fallback.webp"
            alt="Sports car in a dark studio"
            width={1600}
            height={900}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          scene
        )}
      </div>

      <div className="absolute inset-x-0 bottom-[7%] z-10 md:bottom-[12%]">
        <div className="container-x">
          <div className="relative h-44 max-w-[34rem] md:h-52">
            {CAPTIONS.map((cap) => (
              <div key={cap.title} data-cap className="absolute inset-0 opacity-0">
                <h2 className="display text-[clamp(2.6rem,6vw,4.8rem)]">{cap.title}</h2>
                <p className="mt-3 max-w-[40ch] text-silver">{cap.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute right-4 top-1/2 z-10 h-40 w-px -translate-y-1/2 bg-white/15 md:right-10" aria-hidden="true">
        <div data-rail className="h-full w-full origin-top bg-ember" />
      </div>
    </section>
  );
}
