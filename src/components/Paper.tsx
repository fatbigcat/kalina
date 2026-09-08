'use client';

import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react';
import Magnet, { magnetTypes, type MagnetProps, type MagnetType } from './Magnet';
import MagnetItem, { type MagnetItemProps, type MagnetPosition } from './MagnetItem';
import WrittenText, { type WritingVariant } from './WrittenText';

export const paperAssets = {
  crumpled: { file: 'paper_1.png', ratio: '313 / 439', padding: '13% 12%' },
  clipped: { file: 'paper_with_clip.png', ratio: '735 / 1029', padding: '23% 15% 13%' },
  perforated: { file: 'perforated_paper.png', ratio: '724 / 912', padding: '18% 10% 10%' },
  stained: { file: 'light-stained-paper-textured_53876-94322.avif', ratio: '740 / 493', padding: '10%' },
  white: { file: 'nonreflective-white-paper-texture-background_907220-374.avif', ratio: '555 / 740', padding: '12%' },
  textured: { file: 'paper-texture_23-2147786515.avif', ratio: '626 / 417', padding: '10%' },
} as const;

export type PaperType = keyof typeof paperAssets | 'vellum';
export type WritingStyle = WritingVariant | 'ballpoint';
export type PaperProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  children?: React.ReactNode;
  type?: PaperType;
  width?: CSSProperties['width'];
  rotation?: number;
  position?: MagnetPosition;
  writingStyle?: WritingStyle;
  writingBleed?: boolean;
  contentClassName?: string;
  contentStyle?: CSSProperties;
  /** Reuses the board's lift/drag behavior and automatically attaches a magnet. */
  onBoard?: boolean;
  label?: string;
  magnet?: MagnetType | false;
  magnetProps?: Omit<MagnetProps, 'type'>;
  /** Attachment coordinates within the sheet. */
  attachment?: { left: CSSProperties['left']; top: CSSProperties['top'] };
  boundsRef?: MagnetItemProps['boundsRef'];
  onPositionChange?: MagnetItemProps['onPositionChange'];
  resetKey?: MagnetItemProps['resetKey'];
};

// Seeded selection avoids server/client mismatches and stays fixed across rerenders.
function selectMagnet(seed: string): MagnetType {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) hash = Math.imul(hash ^ seed.charCodeAt(i), 16777619);
  return magnetTypes[(hash >>> 0) % magnetTypes.length];
}

export default function Paper({
  children, type = 'crumpled', width, rotation = 0, position,
  writingStyle = 'pen', writingBleed = false, contentClassName = '', contentStyle,
  onBoard = false, label = 'Paper note', magnet, magnetProps,
  attachment, boundsRef, onPositionChange, resetKey,
  className = '', style, ...attributes
}: PaperProps) {
  const seed = useId();
  const frameRef = useRef<HTMLDivElement>(null);
  const [groupScale, setGroupScale] = useState(1);
  const asset = type === 'vellum' ? undefined : paperAssets[type];
  const attachedMagnet = magnet === false ? undefined : magnet ?? (onBoard ? selectMagnet(seed) : undefined);
  const ratio = asset?.ratio ?? '3 / 4';
  const [ratioWidth, ratioHeight] = ratio.split(' / ').map(Number);
  const designWidth = 240;
  const designHeight = designWidth * ratioHeight / ratioWidth;
  const dimensions: CSSProperties = { width, aspectRatio: ratio };
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const fit = () => setGroupScale(parseFloat(getComputedStyle(frame).width) / designWidth);
    fit();
    const observer = new ResizeObserver(entries => {
      setGroupScale(entries[0].contentRect.width / designWidth);
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);
  const sheet = (
    <div
      ref={frameRef}
      {...attributes}
      className={`paper-frame ${onBoard ? '' : className}`}
      data-paper-type={type}
      data-magnet-visual=""
      style={{
        ...dimensions, width: onBoard ? '100%' : width,
        rotate: `${rotation}deg`,
        ...(!onBoard && position ? { translate: `${position.x}px ${position.y}px` } : {}),
        ...(!onBoard ? style : {}),
      }}
    >
      <div className="paper" data-magnet-visual="" style={{
        position: 'absolute', width: designWidth, height: designHeight, maxWidth: 'none',
        transform: `scale(${groupScale})`, transformOrigin: 'top left',
      }}>
      {asset ? (
        <img className="paper-surface" src={`/images/paper/${asset.file}`} alt="" aria-hidden="true" draggable={false} />
      ) : (
        <div className="paper-surface paper-vellum" aria-hidden="true" />
      )}
      <WrittenText
        as="div"
        variant={writingStyle === 'ballpoint' ? 'pen' : writingStyle}
        bleed={writingBleed}
        className={`paper-writing ${contentClassName}`}
        style={{ padding: asset?.padding ?? '14% 12%', ...contentStyle }}
      >
        {children}
      </WrittenText>
      {attachedMagnet && (
        <Magnet
          type={attachedMagnet}
          {...magnetProps}
          style={{
            position: 'absolute', zIndex: 2,
            left: type === 'clipped' ? '30%' : '50%',
            top: type === 'perforated' ? '10%' : '6%',
            translate: '-50% -50%', ...attachment, ...magnetProps?.style,
          }}
        />
      )}
      </div>
    </div>
  );

  return onBoard ? (
    <MagnetItem
      label={label} className={`paper-board-item ${className}`}
      style={{ ...dimensions, ...style }} defaultPosition={position}
      boundsRef={boundsRef} onPositionChange={onPositionChange} resetKey={resetKey}
      shadow={false}
    >
      {sheet}
    </MagnetItem>
  ) : sheet;
}
