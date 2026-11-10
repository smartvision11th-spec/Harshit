import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { gsap } from '../animations/gsap';
import { heroScrollOut } from '../animations/scrollAnimations';
import { useSmoothScroll } from '../animations/SmoothScroll';
import Magnetic from './Magnetic';
import SceneBoundary from '../three/SceneBoundary';
import { createSceneInput, type SceneInput } from '../three/sceneInput';
import { useCoarsePointer, useIsTabletUp, useReducedMotion } from '../hooks/useMediaQuery';
import { useWebGL } from '../hooks/useWebGL';
import { useInView } from '../hooks/useInView';

// The 3D stack (three + R3F + drei) is a separate chunk, fetched after the first paint.
const CarScene = lazy(() => import('../three/CarScene'));

type Props = { ready: boolean };

function whenIdle(cb: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(cb, { timeout: 1500 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(cb, 300);
  return () => window.clearTimeout(id);
}

export default function Hero({ ready }: Props) {
  const { scrollTo } = useSmoothScroll();
  const [root, inView] = useInView<HTMLElement>('100px 0px');
  const bg = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLDivElement>(null);
  const carLayer = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const input = useRef<SceneInput>(createSceneInput());

  const webgl = useWebGL();
  const reduced = useReducedMotion();
  const coarse = useCoarsePointer();
  const tabletUp = useIsTabletUp();
  const quality = !tabletUp || coarse ? 'low' : 'high';

  const [mountScene, setMountScene] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // Start fetching/initialising the 3D scene once the loader is gone and the browser is idle.
  useEffect(() => {
    if (!ready || !webgl) return;
    return whenIdle(() => setMountScene(true));
  }, [ready, webgl]);

  // Initial hidden state for the entrance animation.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      gsap.set('[data-hero-line]', { yPercent: 115 });
      gsap.set('[data-hero-fade]', { autoAlpha: 0, y: 24 });
      gsap.set('[data-hero-word]', { autoAlpha: 0 });
    }, el);
    return () => ctx.revert();
  }, [reduced, root]);

  // Entrance: plays once the preloader lifts.
  useEffect(() => {
    const el = root.current;
    if (!ready || !el || reduced) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.to('[data-hero-word]', { autoAlpha: 1, duration: 1.8, ease: 'power2.out' }, 0)
        .to('[data-hero-line]', { yPercent: 0, duration: 1.25, stagger: 0.12 }, 0.1)
        .to('[data-hero-fade]', { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.65);
    }, el);
    return () => ctx.revert();
  }, [ready, reduced, root]);

  // Scroll-out: headline lifts, background scales, car drifts toward the next section.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced || !copy.current || !bg.current || !carLayer.current) return;
    const ctx = gsap.context(() => {
      heroScrollOut({ trigger: el, copy: copy.current!, bg: bg.current!, car: carLayer.current! });
    }, el);
    return () => ctx.revert();
  }, [reduced, root]);

  // Mouse parallax (fine pointers only): drives both the DOM layers and the 3D camera/car.
  useEffect(() => {
    const el = root.current;
    if (!el || reduced || coarse || !word.current || !bg.current) return;
    const wx = gsap.quickTo(word.current, 'x', { duration: 1.2, ease: 'power3.out' });
    const wy = gsap.quickTo(word.current, 'y', { duration: 1.2, ease: 'power3.out' });
    const state = input.current;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const my = ((e.clientY - r.top) / r.height) * 2 - 1;
      state.mx = mx;
      state.my = my;
      wx(-mx * 32);
      wy(-my * 18);
    };
    const onLeave = () => {
      state.mx = 0;
      state.my = 0;
      wx(0);
      wy(0);
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [reduced, coarse, root]);

  const showFallback = !webgl || failed;

  return (
    <section
      id="top"
      ref={root}
      aria-label="Velocity Auto Detailing"
      className="relative isolate h-[100svh] min-h-[620px] w-full overflow-hidden bg-ink"
    >
      {/* Background: studio backdrop + oversized outline wordmark */}
      <div ref={bg} className="absolute inset-0 will-change-transform">
        <img
          src="/images/hero-poster.webp"
          alt=""
          width={1600}
          height={900}
          decoding="async"
          className="h-full w-full object-cover"
        />
        <div ref={word} className="pointer-events-none absolute inset-x-0 top-[12%] flex justify-center select-none md:top-[9%]" aria-hidden="true">
          <span data-hero-word className="display outline-text whitespace-nowrap text-[clamp(6rem,30vw,30rem)] leading-none">
            Velocity
          </span>
        </div>
        {showFallback && (
          <img
            src="/images/hero-fallback.webp"
            alt="Dark studio with a sports car in profile"
            width={1600}
            height={900}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-90"
          />
        )}
      </div>

      {/* 3D car */}
      <div
        ref={carLayer}
        className="pointer-events-none absolute inset-x-0 bottom-[24%] top-[4%] will-change-transform md:inset-0 md:top-[6%]"
      >
        {mountScene && !showFallback && (
          <SceneBoundary fallback={null} onError={() => setFailed(true)}>
            <Suspense fallback={null}>
              <div className={`h-full w-full transition-opacity duration-[1400ms] ${sceneReady ? 'opacity-100' : 'opacity-0'}`}>
                <CarScene
                  inputRef={input}
                  variant="hero"
                  quality={quality}
                  active={inView}
                  onReady={() => setSceneReady(true)}
                  onFail={() => setFailed(true)}
                />
              </div>
            </Suspense>
          </SceneBoundary>
        )}
      </div>

      {/* Legibility gradients */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(8,9,11,0.75)_100%)]" />

      {/* Copy */}
      <div ref={copy} className="relative z-10 flex h-full flex-col justify-end pb-[clamp(4.5rem,10vh,7.5rem)]">
        <div className="container-x">
          <h1 className="display text-[clamp(3.6rem,17vw,5.6rem)] leading-[0.86] md:text-[clamp(3.3rem,9.4vw,9rem)]">
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-hero-line className="block">
                Beyond clean.
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-hero-line className="metal-text block">
                Perfection in motion.
              </span>
            </span>
          </h1>

          <div className="mt-6 flex flex-col gap-8 md:mt-8 md:flex-row md:items-end md:justify-between">
            <p data-hero-fade className="max-w-[44ch] text-[1.05rem] text-silver md:text-lg">
              Precision detailing. Uncompromising protection. An entirely different standard of automotive care.
            </p>
            <div data-hero-fade className="flex flex-col gap-3 sm:flex-row">
              <Magnetic>
                <a
                  href="#booking"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo('#booking');
                  }}
                  className="btn btn-primary w-full sm:w-auto"
                >
                  Book Your Experience
                </a>
              </Magnetic>
              <Magnetic>
                <a
                  href="#services"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo('#services');
                  }}
                  className="btn btn-ghost w-full sm:w-auto"
                >
                  Explore Our Services
                </a>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 hidden justify-center md:flex" aria-hidden="true">
        <div data-hero-fade className="flex flex-col items-center gap-2 text-xs text-smoke">
          <span>Scroll</span>
          <ArrowDown size={16} className="animate-bounce" />
        </div>
      </div>
    </section>
  );
}
