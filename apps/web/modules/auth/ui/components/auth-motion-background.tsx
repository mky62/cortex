"use client";

import authBackground from "@/assests/authbg.jpg";
import { motion, useReducedMotion } from "framer-motion";

export function AuthMotionBackground() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute -inset-8 bg-cover bg-center bg-no-repeat will-change-transform"
        initial={shouldReduceMotion ? false : { scale: 1.08, x: "-2%", y: "-1%" }}
        animate={
          shouldReduceMotion
            ? { scale: 1, x: 0, y: 0 }
            : {
                scale: [1.08, 1.14, 1.08],
                x: ["-2%", "2%", "-2%"],
                y: ["-1%", "1%", "-1%"],
              }
        }
        transition={
          shouldReduceMotion
            ? undefined
            : {
                duration: 22,
                ease: "easeInOut",
                repeat: Infinity,
              }
        }
        style={{ backgroundImage: `url(${authBackground.src})` }}
      />
    </div>
  );
}
