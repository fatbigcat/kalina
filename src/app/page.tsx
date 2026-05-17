'use client';

import Link from 'next/link';
import { motion, useAnimation, type PanInfo } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ScrambleText from '@/components/ScrambleText';

const items = [
  { href: '/projects', label: 'PROJECTS', underConstruction: true },
  { href: '/music', label: 'MUSIC', underConstruction: true },
  { href: '/thoughts', label: 'THOUGHTS', underConstruction: true },
];

function MenuItem({
  href,
  label,
  underConstruction = false,
}: Readonly<{
  href: string;
  label: string;
  underConstruction?: boolean;
}>) {
  const [hover, setHover] = useState(false);
  const targetHref = underConstruction
    ? `/under-construction?from=${encodeURIComponent(href)}`
    : href;

  return (
    <motion.div
      className="relative"
      initial="rest"
      whileHover="hover"
      animate="rest"
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
    >
      <motion.div
        className="absolute -inset-3 rounded-full pointer-events-none"
        variants={{
          rest: { opacity: 0, scale: 0.9 },
          hover: { opacity: 0.22, scale: 1 },
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,255,255,0))',
          filter: 'blur(10px)',
        }}
      />
      <motion.div
        variants={{
          rest: { y: 0, rotate: 0, scale: 1 },
          hover: { y: -0.3, rotate: -0.3, scale: 1 },
        }}
        transition={{ type: 'spring', stiffness: 10, damping: 200 }}
      >
        <Link
          href={targetHref}
          className="relative inline-flex items-center px-2 py-2 text-white text-m font-semibold"
        >
          <ScrambleText text={label} active={hover} />
        </Link>
      </motion.div>
    </motion.div>
  );
}

type AnimatedLetterProps = Readonly<{
  char: string;
  index: number;
  position: { x: number; y: number };
  onMove: (index: number, pos: { x: number; y: number }) => void;
  resetSignal: number;
}>;

function AnimatedLetter({ char, index, position, onMove, resetSignal }: AnimatedLetterProps) {
  const controls = useAnimation();
  const letterRef = useRef<HTMLSpanElement | null>(null);
  const [dragBounds, setDragBounds] = useState<{
    left: number;
    right: number;
    top: number;
    bottom: number;
  } | null>(null);

  // Calculate bounds so the letter's edge can touch the viewport edge
  const updateDragBounds = () => {
    const el = letterRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDragBounds({
      left: position.x - rect.left,
      right: position.x + (window.innerWidth - rect.right),
      top: position.y - rect.top,
      bottom: position.y + (window.innerHeight - rect.bottom),
    });
  };

  // Clamp the final position to bounds
  const clamp = (pos: { x: number; y: number }) =>
    dragBounds
      ? {
          x: Math.min(dragBounds.right, Math.max(dragBounds.left, pos.x)),
          y: Math.min(dragBounds.bottom, Math.max(dragBounds.top, pos.y)),
        }
      : pos;

  useEffect(() => {
    controls.set({ rotate: 0, scale: 1 });
  }, [resetSignal, controls]);

  useLayoutEffect(() => {
    updateDragBounds();
    const onResize = () => updateDragBounds();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [position.x, position.y]);

  const handleTap = () => {
    controls.start({
      rotate: [0, 1, 0],
      scale: [1, 1.06, 1],
      transition: { duration: 0.2, ease: 'easeInOut' },
    });
  };

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    onMove(index, clamp({ x: position.x + info.offset.x, y: position.y + info.offset.y }));
  };

  return (
    <motion.span
      ref={letterRef}
      className="relative inline-block cursor-grab select-none active:cursor-grabbing"
      animate={controls}
      onTap={handleTap}
      onDragEnd={handleDragEnd}
      drag
      dragConstraints={dragBounds ?? undefined}
      dragMomentum
      dragElastic={0.01}
      dragTransition={{
        power: 0.42,
        timeConstant: 240,
        bounceStiffness: 420,
        bounceDamping: 15,
      }}
      whileDrag={{ scale: 1.12, zIndex: 30 }}
      style={{ x: position.x, y: position.y, touchAction: 'none' }}
    >
      {char}
    </motion.span>
  );
}

const NAME_CHARS = 'Kalina'.split('');

export default function HomePage() {
  const desktopTitleSize = 'min(50vh, 38vw)';
  const titleBottomTrim = '0.12em';
  const desktopFingerprintTransform = 'translate(-50%, -13%) rotate(40deg) scale(2)';
  const mobileFingerprintTransform = 'translate(-45%, -40%) rotate(17deg) scale(1.5)';

  const mobileTitleWrapRef = useRef<HTMLHeadingElement | null>(null);
  const mobileTitleMeasureRef = useRef<HTMLSpanElement | null>(null);
  const [mobileTitleFontSizePx, setMobileTitleFontSizePx] = useState(120);
  const [resetSignal, setResetSignal] = useState(0);
  const [letterPositions, setLetterPositions] = useState(() =>
    NAME_CHARS.map(() => ({ x: 0, y: 0 })),
  );

  const anyLetterMoved = letterPositions.some((pos) => pos.x !== 0 || pos.y !== 0);

  const handleLetterMove = (index: number, pos: { x: number; y: number }) => {
    setLetterPositions((prev) => {
      const next = [...prev];
      next[index] = pos;
      return next;
    });
  };

  useEffect(() => {
    const fit = () => {
      const wrap = mobileTitleWrapRef.current;
      const measure = mobileTitleMeasureRef.current;
      if (!wrap || !measure) return;
      const available = wrap.clientWidth;
      const measured = measure.getBoundingClientRect().width;
      if (available <= 0 || measured <= 0) return;
      const fontSize = parseFloat(getComputedStyle(measure).fontSize);
      if (!Number.isFinite(fontSize) || fontSize <= 0) return;
      const next = (available / measured) * fontSize;
      setMobileTitleFontSizePx((prev) => (Math.abs(prev - next) < 0.25 ? prev : next));
    };
    fit();
    const resizeObserver = new ResizeObserver(fit);
    if (mobileTitleWrapRef.current) resizeObserver.observe(mobileTitleWrapRef.current);
    window.addEventListener('resize', fit);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, []);

  const resetLetters = () => {
    setResetSignal((prev) => prev + 1);
    setLetterPositions(NAME_CHARS.map(() => ({ x: 0, y: 0 })));
  };

  return (
    <>
      <header className="fixed top-0 z-50 w-full">
        <div className="flex items-end justify-center px-6 py-6 md:justify-end relative">
          {anyLetterMoved && (
            <span
              onClick={resetLetters}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  resetLetters();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Reset letters"
              title="Reset letters"
              className="absolute left-6 top-8 h-8 w-8 flex items-center justify-center text-white cursor-pointer"
              style={{ opacity: 0.3 }}
            >
              <svg aria-hidden="true" viewBox="0 0 30 30" className="h-6 w-6" fill="currentColor">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" />
              </svg>
            </span>
          )}
          <nav className="flex items-center gap-3 w-full md:justify-end justify-center">
            {items.map((it) => (
              <MenuItem
                key={it.href}
                href={it.href}
                label={it.label}
                underConstruction={it.underConstruction}
              />
            ))}
          </nav>
        </div>
      </header>

      <div className="fixed inset-0 z-10 pointer-events-none">
        <img
          className="absolute left-0 bottom-0 hidden origin-bottom-left object-contain md:block"
          src="/images/652973.svg"
          alt=""
          style={{
            width: '140vw',
            height: '140vh',
            opacity: 0.88,
            transform: desktopFingerprintTransform,
            transformOrigin: 'bottom left',
          }}
          aria-hidden="true"
        />
        <img
          className="absolute left-0 bottom-0 block origin-bottom-left object-contain md:hidden"
          src="/images/652973.svg"
          alt=""
          style={{
            width: '190vw',
            height: '190vh',
            maxHeight: '140vw',
            maxWidth: '140vh',
            opacity: 0.88,
            transform: mobileFingerprintTransform,
            transformOrigin: 'bottom left',
          }}
          aria-hidden="true"
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 m-4 md:right-auto">
        <h1
          ref={mobileTitleWrapRef}
          className="display_font color-primary m-0 w-full leading-none md:hidden"
          style={{
            width: '100%',
            fontSize: `${mobileTitleFontSizePx}px`,
            transform: `translateY(${titleBottomTrim})`,
          }}
        >
          <span className="inline-block whitespace-nowrap">
            {NAME_CHARS.map((char, i) => (
              <AnimatedLetter
                key={`${char}-${i}-${resetSignal}`}
                char={char}
                index={i}
                position={letterPositions[i]}
                onMove={handleLetterMove}
                resetSignal={resetSignal}
              />
            ))}
          </span>
          <span
            ref={mobileTitleMeasureRef}
            className="display_font invisible absolute left-0 top-0 whitespace-nowrap"
            aria-hidden="true"
          >
            Kalina
          </span>
        </h1>

        <h1
          className="display_font color-primary m-0 hidden leading-none md:block"
          style={{
            fontSize: desktopTitleSize,
            transform: `translateY(${titleBottomTrim})`,
          }}
        >
          <span className="inline-block px-0">
            {NAME_CHARS.map((char, i) => (
              <AnimatedLetter
                key={`desktop-${char}-${i}-${resetSignal}`}
                char={char}
                index={i}
                position={letterPositions[i]}
                onMove={handleLetterMove}
                resetSignal={resetSignal}
              />
            ))}
          </span>
        </h1>
      </div>
    </>
  );
}
