'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import ScrambleText from '@/components/ScrambleText';
import MagnetItem from '@/components/MagnetItem';
import BoardPapers from '@/components/BoardPapers';

const TitleMagnet = dynamic(() => import('@/components/TitleMagnet'), { ssr: false });

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

export default function HomePage() {
  const boardRef = useRef<HTMLDivElement | null>(null);

  const titleWrapRef = useRef<HTMLHeadingElement | null>(null);
  const titleMeasureRef = useRef<HTMLSpanElement | null>(null);
  const [mobileTitleFontSizePx, setMobileTitleFontSizePx] = useState(120);
  const [resetSignal, setResetSignal] = useState(0);
  const [titleReady, setTitleReady] = useState(false);
  const [titlePosition, setTitlePosition] = useState({ x: 0, y: 0 });
  const titleMoved = titlePosition.x !== 0 || titlePosition.y !== 0;

  useEffect(() => {
    const fit = () => {
      if (window.matchMedia('(min-width: 768px)').matches) return;
      const wrap = titleWrapRef.current;
      const measure = titleMeasureRef.current;
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
    if (titleWrapRef.current) resizeObserver.observe(titleWrapRef.current);
    window.addEventListener('resize', fit);
    document.fonts.addEventListener('loadingdone', fit);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', fit);
      document.fonts.removeEventListener('loadingdone', fit);
    };
  }, []);

  const resetTitle = () => {
    setResetSignal((prev) => prev + 1);
    setTitlePosition({ x: 0, y: 0 });
  };

  return (
    <>
      <header className="absolute top-0 z-50 w-full">
        <div className="flex items-end justify-center px-6 py-6 md:justify-end relative">
          {titleMoved && (
            <button
              type="button"
              onClick={resetTitle}
              className="absolute left-6 top-16 text-xs text-white/60 cursor-pointer"
            >
              Reset title
            </button>
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
          className="h-full w-full object-cover object-center"
          src="/images/Texturelabs_Metal_228L.jpg"
          alt=""
          aria-hidden="true"
        />
      </div>

      <TitleMagnet onReadyChange={setTitleReady} />

      <div
        ref={boardRef}
        className="magnetic-board relative z-20 flex min-h-svh flex-col pt-28 md:pt-32"
      >
        <BoardPapers boundsRef={boardRef} />

        <div
          className="fixed bottom-1 left-5 z-20 w-[calc(100vw-2rem)] pt-12 md:w-auto"
          data-title-ready={titleReady || undefined}
        >
          <h1
            ref={titleWrapRef}
            className="title-magnet-heading display_font color-primary m-0 w-full leading-none"
            style={{ '--mobile-title-size': `${mobileTitleFontSizePx}px` } as CSSProperties}
          >
            <MagnetItem
              as="span"
              boundsRef={boardRef}
              label="Kalina title"
              className="title-magnet whitespace-nowrap text-[#626262] md:text-[#383838]"
              data-title-magnet=""
              position={titlePosition}
              onPositionChange={setTitlePosition}
              resetKey={resetSignal}
              shadow={false}
            >
              Kalina
            </MagnetItem>
            <span
              ref={titleMeasureRef}
              className="display_font invisible absolute left-0 top-0 whitespace-nowrap md:hidden"
              aria-hidden="true"
            >
              Kalina
            </span>
          </h1>
        </div>
      </div>
    </>
  );
}
