"use client";
import { motion } from "motion/react";
import React from "react";

export default function GlobalLoader() {
  const text = "NotesBuddy";
  return (
    <div className="flex min-h-screen min-w-full items-center justify-center">
      <div className="font-sans font-bold [--shadow-color:var(--color-neutral-500)] dark:[--shadow-color:var(--color-neutral-100)]">
        {text.split("").map((char, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{
              scale: [1, 1.1, 1],
              textShadow: [
                "0 0 0 var(--shadow-color)",
                "0 0 1px var(--shadow-color)",
                "0 0 0 var(--shadow-color)",
              ],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              delay: i * 0.05,
              ease: "easeInOut",
              repeatDelay: 2,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
