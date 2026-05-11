"use client";

import Link from "next/link";
import Character from "../scenes/Character";

export default function FrontflipPage() {
  return (
    <>
      <Link
        href="/"
        className="fixed left-6 top-6 z-50 inline-flex items-center rounded-full border border-white/35 bg-black/40 px-3 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
      >
        Back
      </Link>
      <Character />
    </>
  );
}
