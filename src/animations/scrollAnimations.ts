import { gsap, ScrollTrigger } from './gsap';

/**
 * Reusable scroll-driven animation helpers.
 * Always call these inside a gsap.context() so ctx.revert() cleans up every tween and ScrollTrigger.
 */

/** Scrubbed word-by-word reveal. `words` are elements that each wrap one word. */
export function scrubWords(words: Element[] | NodeListOf<Element>, trigger: Element, end = 'bottom 55%') {
  gsap.fromTo(
    words,
    { opacity: 0.14 },
    {
      opacity: 1,
      ease: 'none',
      stagger: 0.08,
      scrollTrigger: { trigger, start: 'top 80%', end, scrub: 0.5 },
    },
  );
}

/** One-shot staggered entrance for a group, fired when the trigger enters the viewport. */
export function staggerIn(targets: Element[] | NodeListOf<Element>, trigger: Element, vars: gsap.TweenVars = {}) {
  gsap.fromTo(
    targets,
    { autoAlpha: 0, y: 48 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.12,
      ...vars,
      scrollTrigger: { trigger, start: 'top 82%', once: true },
    },
  );
}

/** Vertical parallax for an element relative to its own trigger box. */
export function parallaxY(el: Element, trigger: Element, distance = 80) {
  gsap.fromTo(
    el,
    { y: -distance },
    { y: distance, ease: 'none', scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: true } },
  );
}

/** Mask (clip-path) reveal from the bottom edge as the element scrolls in. */
export function maskReveal(el: Element, trigger: Element = el) {
  gsap.fromTo(
    el,
    { clipPath: 'inset(100% 0% 0% 0%)' },
    {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1.2,
      ease: 'power4.inOut',
      scrollTrigger: { trigger, start: 'top 85%', once: true },
    },
  );
}

/** Hero exit: headline fades up, background scales, vehicle lifts toward the next section. */
export function heroScrollOut(opts: {
  trigger: Element;
  copy: Element;
  bg: Element;
  car: Element;
  onProgress?: (p: number) => void;
}) {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: opts.trigger,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.6,
      onUpdate: (self) => opts.onProgress?.(self.progress),
    },
  });
  tl.to(opts.copy, { yPercent: -18, opacity: 0, ease: 'none' }, 0)
    .to(opts.bg, { scale: 1.18, ease: 'none' }, 0)
    .to(opts.car, { yPercent: -8, scale: 1.12, opacity: 0.2, ease: 'none' }, 0.1);
  return tl;
}

export function refreshScrollTriggers() {
  ScrollTrigger.refresh();
}
