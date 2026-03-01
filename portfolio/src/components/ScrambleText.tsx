"use client";

import { useEffect, useState } from "react";

const GLYPHS = String.raw`!@#$%^&*()_+-=[]{}<>?/\|`;

export default function ScrambleText({
  text,
  active,
  className,
}: Readonly<{
  text: string;
  active: boolean;
  className?: string;
}>) {
  const [output, setOutput] = useState(text);

  useEffect(() => {
    if (!active) {
      setOutput(text);
      return;
    }

    let frame = 0;
    const totalFrames = 15; // duration

    const interval = setInterval(() => {
      frame++;

      const progress = frame / totalFrames;

      const scrambled = text
        .split("")
        .map((char, i) => {
          if (i < text.length * progress) return text[i];
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join("");

      setOutput(scrambled);

      if (frame >= totalFrames) {
        clearInterval(interval);
        setOutput(text);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [active, text]);

  return <span className={className}>{output}</span>;
}
