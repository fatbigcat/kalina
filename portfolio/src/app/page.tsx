"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
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
      {/* Glow blob */}
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
          hover: { y: -3, rotate: -1.5, scale: 1.03 },
        }}
        transition={{ type: "spring", stiffness: 420, damping: 14 }}
      >
        <Link
          href={href}
          className="relative inline-flex items-center px-2 py-2 text-white text-sm font-semibold"
        >
          <ScrambleText text={label} active={hover} />
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function HomePage() {
  return (
    <div className="relative w-full h-screen">
      {/* Top bar */}
      <header className="fixed top-0 z-50 w-full">
        <div className="flex items-center justify-end px-8 py-6">
          <nav className="flex gap-3">
            {items.map((it) => (
              <MenuItem key={it.href} href={it.href} label={it.label} />
            ))}
          </nav>
        </div>
      </header>

      {/* Your title */}
      <div className="absolute bottom-0 left-0 m-4 flex items-end justify-start z-10 pointer-events-none">
        <h1 className="display_font text-red-500 text-9xl font-bold text-center">
          Lorem Ipsum
        </h1>
      </div>
    </div>
  );
}
