/**
 * Frame-shared mutable scroll state (no React re-renders).
 * Written by Lenis/ScrollTrigger, read inside R3F useFrame loops.
 */
export const scrollState = {
  velocity: 0, // lenis velocity (px/frame-ish)
  smoothVelocity: 0,
  deckProgress: 0, // 0..1 pinned deck progress
  deckVisible: false,
  focusDistance: 8, // camera -> center card distance (world units) for rack focus
  heroVisible: true,
};
