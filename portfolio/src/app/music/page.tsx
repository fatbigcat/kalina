"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HoverScrambleTextTag from "./HoverScrambleTextTag";
import MusicScene from "../scenes/NoteScene";

type Track = {
  title: string;
  url: string;
  embed: string;
};

const tracks: Track[] = [
  {
    title: "Hour Long House Parties #003",
    url: "https://soundcloud.com/kalina_wav/hour-long-house-parties-003",
    embed:
      "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%253Atracks%253A1118787505&color=%23f90000&inverse=true&auto_play=false&show_user=true",
  },
];

export default function MusicPage() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <main style={{ height: "100vh" }}>
      {/* 3D Notes Scene as background */}
      <div className="fixed inset-0 z-0 min-h-screen bg-black">
        <MusicScene noteColor="red" outlineColor="white" />
      </div>
      <div className="relative w-full h-screen z-10 pointer-events-none">
        <div className="absolute bottom-0 left-0 m-4 flex items-end justify-start z-10 pointer-events-none">
          <h1 className="display_font text-red-500 text-9xl font-bold text-center">
            Music
          </h1>
        </div>
        <div className="flex items-end justify-end">
          <div className="flex flex-col gap-10 max-w-3xl">
            {tracks.map((track) => {
              const isOpen = active === track.title;
              return (
                <motion.div key={track.title} layout>
                  {/* Clickable title */}
                  <motion.div
                    onClick={() => setActive(isOpen ? null : track.title)}
                    className="cursor-pointer group pointer-events-auto"
                    whileHover={{ x: 6 }}
                  >
                    <HoverScrambleTextTag
                      as="h2"
                      className="text-3xl font-semibold transition-all"
                      text={track.title}
                    />

                    <div className="text-white/40 text-sm mt-1 pointer-events-auto">
                      <a
                        href={track.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <HoverScrambleTextTag text="Open on SoundCloud →" />
                      </a>
                    </div>
                  </motion.div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.5 }}
                        className="overflow-hidden mt-6"
                      >
                        <div className="rounded-xl overflow-hidden border border-white/10">
                          <iframe
                            width="100%"
                            height="120"
                            allow="autoplay"
                            src={track.embed}
                            title={`SoundCloud player for ${track.title}`}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
