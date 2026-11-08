import React from "react";

/** Global SVG filters: subtle static refractive displacement for liquid-glass hover states. */
export function LiquidFilters() {
  return (
    <svg aria-hidden="true" width="0" height="0" style={{ position: "absolute", width: 0, height: 0 }}>
      <defs>
        <filter id="liquid-distort" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves={2} seed={7} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={4} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="liquid-soft">
          <feTurbulence type="turbulence" baseFrequency="0.008" numOctaves={1} seed={2} result="t" />
          <feDisplacementMap in="SourceGraphic" in2="t" scale={6} />
        </filter>
      </defs>
    </svg>
  );
}