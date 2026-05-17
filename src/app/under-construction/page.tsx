'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

export default function UnderConstructionPage() {
  const router = useRouter();
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const goBack = () => {
    const fallbackFrom = new URLSearchParams(globalThis.location.search).get('from') ?? '/';
    const fallbackHref = fallbackFrom.startsWith('/') ? fallbackFrom : '/';

    if (globalThis.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return (
    <main ref={viewportRef} className="relative h-dvh w-full overflow-hidden bg-black">
      <button
        type="button"
        onClick={goBack}
        className="fixed left-4 top-4 z-40 rounded-full bg-black/55 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Back
      </button>

      <div
        className="fixed left-0 right-0 bottom-0 z-30 pointer-events-none"
        style={{ width: '100vw', height: 'clamp(550px,60vw,600px)' }}
      >
        <div className="relative w-full h-full">
          <Image
            src="/images/Underconstruction_tape.png"
            alt="Under construction tape"
            priority
            sizes="100vw"
            width={1920}
            height={600}
            style={{
              width: '100vw',
              height: 'clamp(550px,60vw,600px)',
              objectFit: 'cover',
              objectPosition: 'bottom',
              display: 'block',
            }}
          />
        </div>
      </div>

      <div className="absolute inset-0 z-40 flex items-center justify-center p-4 sm:p-6 md:p-8 pointer-events-none">
        <motion.div
          drag
          dragConstraints={viewportRef}
          dragMomentum={false}
          dragElastic={0.08}
          whileTap={{ scale: 1.02 }}
          whileDrag={{ scale: 1.08, rotate: 4 }}
          dragTransition={{ bounceStiffness: 600, bounceDamping: 18 }}
          className="relative z-40 cursor-grab active:cursor-grabbing touch-none pointer-events-auto md:-translate-y-[12vh]"
        >
          <div className="relative h-[clamp(210px,38vw,400px)] w-[clamp(250px,48vw,480px)]">
            <Image
              src="/images/Underconstruction_message.png"
              alt="This page is under construction"
              fill
              priority
              sizes="(max-width: 768px) 92vw, 74vw"
              className="object-contain select-none pointer-events-none"
            />
          </div>
        </motion.div>
      </div>
    </main>
  );
}
