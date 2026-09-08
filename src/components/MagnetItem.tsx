'use client';

import {
  animate, motion, useDragControls, useMotionTemplate, useMotionValue,
  useReducedMotion, useTransform,
  type MotionStyle, type MotionValue,
} from 'framer-motion';
import {
  useCallback, useEffect, useLayoutEffect, useRef, useState,
  type CSSProperties, type KeyboardEvent, type PointerEvent,
  type ReactNode, type RefObject,
} from 'react';

export type MagnetPosition = { x: number; y: number };
type Bounds = { left: number; right: number; top: number; bottom: number };

export const MAGNET_LIFT_PX = 24;
const ORIGIN = { x: 0, y: 0 };

export type MagnetItemProps = {
  children: ReactNode;
  label: string;
  as?: 'div' | 'span';
  position?: MagnetPosition;
  defaultPosition?: MagnetPosition;
  onPositionChange?: (position: MagnetPosition) => void;
  resetKey?: string | number;
  boundsRef?: RefObject<HTMLElement | null>;
  /** Disable the DOM shadow when an external 3D renderer supplies the visual. */
  shadow?: boolean;
  className?: string;
  style?: CSSProperties;
} & { [key: `data-${string}`]: string | number | undefined };

/** Shared press → lift → drag → attach behavior for any object on the board. */
export default function MagnetItem({
  children, label, as = 'div', position, defaultPosition = ORIGIN,
  onPositionChange, resetKey, boundsRef, shadow = true, className = '', style,
  ...dataAttributes
}: MagnetItemProps) {
  const initialPosition = useRef(defaultPosition);
  const controlledX = position?.x;
  const controlledY = position?.y;
  const element = useRef<HTMLElement | null>(null);
  const pointer = useRef<number | null>(null);
  const holding = useRef(false);
  const moved = useRef(false);
  const [held, setHeld] = useState(false);
  const [bounds, setBounds] = useState<Bounds>();
  const boundsValue = useRef<Bounds | undefined>(undefined);
  const positionChange = useRef(onPositionChange);
  useLayoutEffect(() => { positionChange.current = onPositionChange; });
  const controls = useDragControls();
  const reducedMotion = useReducedMotion();
  const x = useMotionValue(position?.x ?? defaultPosition.x);
  const y = useMotionValue(position?.y ?? defaultPosition.y);
  const lift = useMotionValue(0);
  const scale = useTransform(lift, [0, 1], [1, reducedMotion ? 1 : 1.04]);
  const shadowY = useTransform(lift, [0, 1], [2, 12]);
  const shadowBlur = useTransform(lift, [0, 1], [1, 8]);
  const filter = useMotionTemplate`drop-shadow(1px ${shadowY}px ${shadowBlur}px rgb(0 0 0 / 0.28))`;

  const measureBounds = useCallback(() => {
    const node = element.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const board = boundsRef?.current?.getBoundingClientRect() ?? {
      left: 0, top: 0, right: document.documentElement.clientWidth, bottom: window.innerHeight,
    };
    // Include rotated sheets and protruding magnets, not just the wrapper's box.
    const visuals = [rect, ...Array.from(node.querySelectorAll('[data-magnet-visual]'),
      child => child.getBoundingClientRect())];
    const currentScale = scale.get();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const left = centerX + (Math.min(...visuals.map(r => r.left)) - centerX) / currentScale - x.get();
    const right = centerX + (Math.max(...visuals.map(r => r.right)) - centerX) / currentScale - x.get();
    const top = centerY + (Math.min(...visuals.map(r => r.top)) - centerY) / currentScale - y.get();
    const bottom = centerY + (Math.max(...visuals.map(r => r.bottom)) - centerY) / currentScale - y.get();
    // Reserve the pickup expansion and a small shadow/bevel margin at every edge.
    const marginX = (right - left) * 0.02 + 4;
    const marginY = (bottom - top) * 0.02 + 4;
    const next = {
      left: board.left + marginX - left,
      right: board.right - marginX - right,
      top: board.top + marginY - top,
      bottom: board.bottom - marginY - bottom,
    };
    // Oversized generic content stays anchored at the start, never at negative scroll.
    next.right = Math.max(next.left, next.right);
    next.bottom = Math.max(next.top, next.bottom);
    boundsValue.current = next;
    setBounds(next);
  }, [boundsRef, scale, x, y]);

  const clampPosition = useCallback(() => {
    const limit = boundsValue.current;
    if (limit) {
      x.set(Math.max(limit.left, Math.min(limit.right, x.get())));
      y.set(Math.max(limit.top, Math.min(limit.bottom, y.get())));
    }
    return { x: x.get(), y: y.get() };
  }, [x, y]);

  const attach = useCallback(() => {
    if (!holding.current) return;
    holding.current = false;
    pointer.current = null;
    controls.cancel();
    x.stop();
    y.stop();
    lift.stop();
    lift.set(0); // Attach on release: no glide, bounce, or delayed lowering.
    setHeld(false);
    if (moved.current) {
      const next = clampPosition();
      onPositionChange?.(next);
    }
  }, [clampPosition, controls, lift, onPositionChange, x, y]);

  const pickUp = () => {
    measureBounds();
    holding.current = true;
    moved.current = false;
    setHeld(true);
    lift.stop();
    if (reducedMotion) lift.set(1);
    else animate(lift, 1, { duration: 0.1, ease: 'easeOut' });
  };

  const press = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0 || !event.isPrimary || holding.current) return;
    const target = event.target as HTMLElement;
    if (target.closest('a, button, input, textarea, select, [contenteditable="true"], [data-magnet-no-drag]')) return;
    event.preventDefault();
    pointer.current = event.pointerId;
    pickUp();
    controls.start(event, { distanceThreshold: 0 });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const keyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (!holding.current) pickUp();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      attach();
    } else if (holding.current && pointer.current === null && event.key.startsWith('Arrow')) {
      event.preventDefault();
      const step = event.shiftKey ? 1 : 10;
      if (event.key === 'ArrowLeft') x.set(x.get() - step);
      if (event.key === 'ArrowRight') x.set(x.get() + step);
      if (event.key === 'ArrowUp') y.set(y.get() - step);
      if (event.key === 'ArrowDown') y.set(y.get() + step);
      moved.current = true;
      clampPosition();
    }
  };

  useLayoutEffect(() => {
    holding.current = false;
    pointer.current = null;
    controls.cancel();
    lift.stop();
    lift.set(0);
    setHeld(false);
    x.set(controlledX ?? initialPosition.current.x);
    y.set(controlledY ?? initialPosition.current.y);
  }, [resetKey, controlledX, controlledY, controls, lift, x, y]);

  useLayoutEffect(() => {
    let frame = 0;
    const reflow = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const node = element.current;
        if (!node?.getClientRects().length) return; // Ignore the hidden title variant.
        measureBounds();
        const previous = { x: x.get(), y: y.get() };
        const next = clampPosition();
        if (Math.abs(previous.x - next.x) > 0.01 || Math.abs(previous.y - next.y) > 0.01) {
          positionChange.current?.(next);
        }
      });
    };
    reflow();
    const observer = new ResizeObserver(reflow);
    if (element.current) observer.observe(element.current);
    element.current?.querySelectorAll('[data-magnet-visual]').forEach(child => observer.observe(child));
    if (element.current?.parentElement) observer.observe(element.current.parentElement);
    if (boundsRef?.current) observer.observe(boundsRef.current);
    window.addEventListener('resize', reflow);
    window.addEventListener('scroll', reflow, true);
    document.fonts.addEventListener('loadingdone', reflow);
    element.current?.addEventListener('load', reflow, true);
    const node = element.current;
    // Editor changes can move an attachment without changing the wrapper's size.
    const mutations = new MutationObserver(records => {
      if (records.some(record => record.target !== node &&
        (record.target as Element).matches('[data-magnet-visual]'))) reflow();
    });
    if (node) mutations.observe(node, { attributes: true, attributeFilter: ['style'], subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutations.disconnect();
      window.removeEventListener('resize', reflow);
      window.removeEventListener('scroll', reflow, true);
      document.fonts.removeEventListener('loadingdone', reflow);
      node?.removeEventListener('load', reflow, true);
    };
  }, [boundsRef, measureBounds, clampPosition, x, y, controlledX, controlledY, resetKey]);

  useEffect(() => {
    const released = (event: globalThis.PointerEvent) => {
      if (event.pointerId === pointer.current) attach();
    };
    const hidden = () => { if (document.hidden) attach(); };
    window.addEventListener('pointerup', released);
    window.addEventListener('pointercancel', released);
    window.addEventListener('blur', attach);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      window.removeEventListener('pointerup', released);
      window.removeEventListener('pointercancel', released);
      window.removeEventListener('blur', attach);
      document.removeEventListener('visibilitychange', hidden);
    };
  }, [attach]);

  useEffect(() => () => {
    controls.cancel();
    lift.stop();
  }, [controls, lift]);

  const Tag = as === 'span' ? motion.span : motion.div;
  const motionStyle: MotionStyle & { '--magnet-lift': MotionValue<number> } = {
    ...style, x, y, scale,
    '--magnet-lift': lift,
    zIndex: held ? 40 : style?.zIndex,
    touchAction: 'none',
    filter: shadow ? filter : undefined,
    cursor: held ? 'grabbing' : 'grab',
  };
  return (
    <Tag
      {...dataAttributes}
      ref={node => { element.current = node; }}
      className={`magnet-item relative inline-block select-none ${className}`}
      role="group"
      tabIndex={0}
      aria-label={label}
      aria-roledescription="movable magnet"
      aria-description="Hold Space or Enter and use arrow keys to move. Release to attach."
      data-magnet-state={held ? 'held' : 'attached'}
      drag
      dragListener={false}
      dragControls={controls}
      dragConstraints={bounds}
      dragElastic={0}
      dragMomentum={false}
      onPointerDown={press}
      onLostPointerCapture={attach}
      onDrag={() => { moved.current = true; clampPosition(); }}
      onDragEnd={attach}
      onDragStartCapture={event => event.preventDefault()}
      onKeyDown={keyDown}
      onKeyUp={event => {
        if (event.target !== event.currentTarget) return;
        if (pointer.current === null && (event.key === ' ' || event.key === 'Enter')) {
          event.preventDefault();
          attach();
        }
      }}
      onBlur={attach}
      style={motionStyle}
    >
      {children}
    </Tag>
  );
}
