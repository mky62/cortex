"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function AuthAmbientPanel({
  eyebrow,
  title,
  description,
  wordmark,
}: {
  eyebrow: string;
  title: string;
  description: string;
  wordmark: ReactNode;
}) {
  const shouldReduceMotion = useReducedMotion();
  const floatTransition = shouldReduceMotion
    ? undefined
    : {
        duration: 8,
        ease: "easeInOut" as const,
        repeat: Infinity,
      };

  return (
    <>
      <div className="relative max-w-3xl">
        <motion.div
          aria-hidden
          className="absolute -left-8 top-12 h-32 w-32 rounded-full border border-white/20"
          animate={shouldReduceMotion ? undefined : { y: [0, -14, 0], opacity: [0.45, 0.8, 0.45] }}
          transition={floatTransition}
        />
        <motion.div
          aria-hidden
          className="absolute right-10 top-4 h-20 w-20 rounded-full bg-primary/30 blur-2xl"
          animate={shouldReduceMotion ? undefined : { scale: [1, 1.18, 1], x: [0, 12, 0] }}
          transition={floatTransition}
        />
        <motion.div
          aria-hidden
          className="absolute bottom-0 right-0 h-px w-72 bg-gradient-to-r from-transparent via-white/50 to-transparent"
          animate={shouldReduceMotion ? undefined : { x: [-24, 24, -24], opacity: [0.25, 0.7, 0.25] }}
          transition={floatTransition}
        />

        <div className="relative space-y-7 rounded-[2rem] border border-white/15 bg-slate-600/50 p-8 shadow-2xl ">
          <div className="flex items-center gap-3">
            <span className="size-2 rounded-full bg-primary shadow-[0_0_24px_rgba(59,130,246,0.9)]" />
            <p className="text-xs font-medium uppercase tracking-[0.38em] text-blue-600 ">
              {eyebrow}
            </p>
          </div>

          <h1 className="max-w-2xl text-5xl font-light italic leading-[1.02] tracking-[-0.05em] text-white drop-shadow-md xl:text-7xl">
            {title}
          </h1>

          <p className="max-w-xl text-base font-light leading-8 text-white/76 xl:text-lg">
            {description}
          </p>

          <div className="flex items-center gap-3 pt-2 text-white/65">
            <div className="h-px w-20 bg-white/40" />
            <p className="text-xs uppercase tracking-[0.3em]">Support, softened</p>
          </div>
        </div>
      </div>
    </>
  );
}
