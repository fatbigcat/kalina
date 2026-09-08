'use client';

import { useId, type HTMLAttributes } from 'react';

export type WritingVariant = 'pencil' | 'pen' | 'marker';
export type WrittenTextProps = HTMLAttributes<HTMLElement> & {
  as?: 'span' | 'div' | 'p';
  variant?: WritingVariant;
  /** Adds a faint ink halo beneath the intact strokes. Off by default. */
  bleed?: boolean;
};

// CSS-pixel values for the board's 19–30px writing. Never scale by font size.
const materials = {
  pencil: { density: 0.72, floor: 0.38, edge: 0.22, softness: 0.06 },
  pen: { density: 0.28, floor: 0.75, edge: 0.12, softness: 0.1 },
  marker: { density: 0.42, floor: 0.66, edge: 0.18, softness: 0.14 },
};

/** Real HTML with static, glyph-clipped pigment variation. Fonts remain overridable. */
export default function WrittenText({
  as: Tag = 'span', variant = 'pen', bleed = false, children,
  className = '', style, ...attributes
}: WrittenTextProps) {
  const id = `writing-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const material = materials[variant];
  const channel = material.density / 3;

  return (
    <>
      <svg width="0" height="0" aria-hidden="true" focusable="false"
        style={{ position: 'absolute', pointerEvents: 'none' }}>
        <defs>
          <filter id={id} x="-3%" y="-5%" width="106%" height="110%"
            primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.78" numOctaves="3"
              seed="17" result="grain" />
            <feDisplacementMap in="SourceGraphic" in2="grain" scale={material.edge}
              xChannelSelector="R" yChannelSelector="G" result="edges" />
            {/* Convert grain luminance into a bounded alpha field, not visible noise. */}
            <feColorMatrix in="grain" type="matrix" values={`
              0 0 0 0 1
              0 0 0 0 1
              0 0 0 0 1
              ${channel} ${channel} ${channel} 0 ${material.floor}`}
              result="coverage" />
            <feComposite in="edges" in2="coverage" operator="in" result="ink" />
            {bleed && <>
              <feGaussianBlur in="ink" stdDeviation={material.softness} />
              <feComponentTransfer result="bleed">
                <feFuncA type="linear" slope="0.12" />
              </feComponentTransfer>
              <feMerge><feMergeNode in="bleed" /><feMergeNode in="ink" /></feMerge>
            </>}
          </filter>
        </defs>
      </svg>
      <Tag {...attributes} className={`written-text ${className}`}
        data-writing-style={variant} style={{ filter: `url(#${id})`, ...style }}>
        {children}
      </Tag>
    </>
  );
}
