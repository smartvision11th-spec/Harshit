import type { MutableRefObject } from 'react';

/**
 * Mutable values shared between DOM-driven animation (GSAP / pointer events) and the 3D render loop.
 * Mutating this object never triggers a React re-render, which keeps the canvas smooth.
 */
export type SceneInput = {
  /** Pointer position, normalised to -1..1 across the section. */
  mx: number;
  my: number;
  /** Scroll progress through the owning section, 0..1. */
  progress: number;
};

export type SceneInputRef = MutableRefObject<SceneInput>;

export const createSceneInput = (): SceneInput => ({ mx: 0, my: 0, progress: 0 });
