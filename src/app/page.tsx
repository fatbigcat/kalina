"use client";

import Link from "next/link";
import { motion, useAnimation, type PanInfo } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import ScrambleText from "@/components/ScrambleText";

const items = [
  { href: "/frontflip", label: "PROJECTS" },
  { href: "/music", label: "MUSIC" },
  { href: "/thoughts", label: "THOUGHTS" },
];

function MenuItem({ href, label }: { href: string; label: string }) {
  const [hover, setHover] = useState(false);

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
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,255,255,0))",
          filter: "blur(10px)",
        }}
      />

      <motion.div
        variants={{
          rest: { y: 0, rotate: 0, scale: 1 },
          hover: { y: -0.3, rotate: -0.3, scale: 1 },
        }}
        transition={{ type: "spring", stiffness: 10, damping: 200 }}
      >
        <Link
          href={href}
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
  resetSignal: number;
}>;

function AnimatedLetter({ char, resetSignal }: AnimatedLetterProps) {
  const controls = useAnimation();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setPosition({ x: 0, y: 0 });
    controls.set({ rotate: 0, scale: 1 });
  }, [resetSignal, controls]);

  const handleTap = () => {
    controls.start({
      rotate: [0, 1.5, 0],
      scale: [1, 1.06, 1],
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    });
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    setPosition((prev) => ({
      x: prev.x + info.offset.x,
      y: prev.y + info.offset.y,
    }));
  };

  return (
    <motion.span
      className="relative inline-block cursor-grab select-none active:cursor-grabbing"
      animate={controls}
      onTap={handleTap}
      onDragEnd={handleDragEnd}
      drag
      dragMomentum
      dragElastic={0.32}
      dragTransition={{
        power: 0.35,
        timeConstant: 220,
        bounceStiffness: 220,
        bounceDamping: 18,
      }}
      whileDrag={{ scale: 1.12, zIndex: 30 }}
      style={{ x: position.x, y: position.y, touchAction: "none" }}
    >
      {char}
    </motion.span>
  );
}

const NAME_CHARS = "Kalina".split("");

const fingerprintFilter =
  "invert(29%) sepia(98%) saturate(6800%) hue-rotate(225deg) brightness(115%) contrast(121%) blur(0.2px)";

export default function HomePage() {
  const desktopTitleSize = "min(50vh, 38vw)";
  const titleBottomTrim = "0.12em";
  const desktopFingerprintTransform =
    "translate(-50%, -13%) rotate(40deg) scale(2)";
  const mobileFingerprintTransform =
    "translate(-80%, 10%) rotate(40deg) scale(1.75)";

  const mobileTitleWrapRef = useRef<HTMLHeadingElement | null>(null);
  const mobileTitleMeasureRef = useRef<HTMLSpanElement | null>(null);
  const [mobileTitleFontSizePx, setMobileTitleFontSizePx] = useState(120);
  const [resetSignal, setResetSignal] = useState(0);

  useEffect(() => {
    const fitMobileTitleToWidth = () => {
      const wrap = mobileTitleWrapRef.current;
      const measure = mobileTitleMeasureRef.current;
      if (!wrap || !measure) return;

      const availableWidth = wrap.clientWidth;
      const measuredWidth = measure.getBoundingClientRect().width;
      if (availableWidth <= 0 || measuredWidth <= 0) return;

      const currentFontSize = Number.parseFloat(
        getComputedStyle(measure).fontSize,
      );
      if (!Number.isFinite(currentFontSize) || currentFontSize <= 0) return;

      const nextFontSize = (availableWidth / measuredWidth) * currentFontSize;
      setMobileTitleFontSizePx((prev) =>
        Math.abs(prev - nextFontSize) < 0.25 ? prev : nextFontSize,
      );
    };

    fitMobileTitleToWidth();

    const resizeObserver = new ResizeObserver(fitMobileTitleToWidth);
    if (mobileTitleWrapRef.current) {
      resizeObserver.observe(mobileTitleWrapRef.current);
    }

    globalThis.addEventListener("resize", fitMobileTitleToWidth);
    return () => {
      resizeObserver.disconnect();
      globalThis.removeEventListener("resize", fitMobileTitleToWidth);
    };
  }, []);

  const resetLetters = () => {
    setResetSignal((prev) => prev + 1);
  };

  return (
    <>
      <button
        type="button"
        onClick={resetLetters}
        aria-label="Reset letters"
        title="Reset letters"
        className="fixed left-6 top-6 z-60 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/35 bg-black/40 text-white backdrop-blur-sm transition hover:bg-white/10"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 11a8 8 0 1 0 2.2 5.5" />
          <path d="M20 4v7h-7" />
        </svg>
      </button>

      <header className="fixed top-0 z-50 w-full">
        <div className="flex items-end justify-center px-6 py-6 md:justify-end">
          <nav className="flex items-center gap-3">
            {items.map((it) => (
              <MenuItem key={it.href} href={it.href} label={it.label} />
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
            width: "140vw",
            height: "140vh",
            opacity: 0.88,
            transform: desktopFingerprintTransform,
            transformOrigin: "bottom left",
            filter: fingerprintFilter,
          }}
          aria-hidden="true"
        />
        <img
          className="absolute left-0 bottom-0 block origin-bottom-left object-contain md:hidden"
          src="/images/652973.svg"
          alt=""
          style={{
            width: "190vw",
            height: "190vh",
            opacity: 0.9,
            transform: mobileFingerprintTransform,
            transformOrigin: "bottom left",
            filter: fingerprintFilter,
          }}
          aria-hidden="true"
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 m-4 md:right-auto">
        <h1
          ref={mobileTitleWrapRef}
          className="display_font color-primary m-0 w-full leading-none md:hidden"
          style={{
            width: "100%",
            fontSize: `${mobileTitleFontSizePx}px`,
            transform: `translateY(${titleBottomTrim})`,
          }}
        >
          <span className="inline-block whitespace-nowrap">
            {NAME_CHARS.map((char, i) => (
              <AnimatedLetter
                key={`${char}-${i}-${resetSignal}`}
                char={char}
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
                resetSignal={resetSignal}
              />
            ))}
          </span>
        </h1>
      </div>
    </>
  );
}
