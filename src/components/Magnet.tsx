import type { CSSProperties } from 'react';

export const magnetAssets = {
  baguette: 'baguette_magnet.png',
  'chair-black': 'chairmagnet_black.png',
  'chair-white': 'chairmagnet_white.png',
  'duct-tape': 'ducttape.png',
  flower: 'flowermagnet.png',
  'gold-star': 'goldstar_sticker.png',
  'kitty-black': 'kittymagnet_black.png',
  'kitty-spotty': 'kittymagnet_spotty.png',
  penguin: 'penguinmagnet.png',
  'shiny-star': 'shinystar_magnet.png',
} as const;

export type MagnetType = keyof typeof magnetAssets;
export const magnetTypes = Object.keys(magnetAssets) as MagnetType[];

export type MagnetProps = {
  type: MagnetType;
  /** Longest side in local design pixels. Inside Paper, the shared group transform
   * scales this with the sheet and writing; no independent viewport sizing. */
  size?: CSSProperties['width'];
  rotation?: number;
  className?: string;
  style?: CSSProperties;
  alt?: string;
};

/** Asset-only visual. Wrap in MagnetItem when it should move independently. */
export default function Magnet({
  type, size = 52, rotation = 0, className = '', style, alt = '',
}: MagnetProps) {
  return (
    <img
      src={`/images/magnets/${magnetAssets[type]}`}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      draggable={false}
      className={`paper-magnet ${className}`}
      style={{ width: size, height: size, rotate: `${rotation}deg`, ...style }}
      data-magnet-type={type}
      data-magnet-visual=""
    />
  );
}
