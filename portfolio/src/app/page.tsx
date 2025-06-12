"use client";

import BlinkParticles from "./scenes/BlinkParticles";

export default function HomePage() {
  return (
    <div className="relative w-full h-screen">
      <BlinkParticles />
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <h1 className="text-red text-6xl font-bold text-center">
          Hi, I'm Kalina
        </h1>
      </div>
    </div>
  );
}
