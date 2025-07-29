"use client";
import { motion } from "motion/react";
import React, { useEffect, useState } from "react";

interface AIResponseLoaderProps {
  text?: string;
  className?: string;
}

// Different loader messages for variety
const LOADER_MESSAGES = [
  "AI is thinking...",
  "Searching knowledge base...",
  "Generating response...",
  "Processing your query...",
  "Analyzing information...",
  "Crafting your answer...",
  "Retrieving relevant data...",
  "Connecting the dots...",
  "Formulating thoughts...",
  "Gathering insights...",
  "Computing response...",
  "Exploring possibilities...",
  "Reviewing course materials...",
  "Cross-referencing notes...",
  "Analyzing study content...",
  "Compiling information...",
  "Structuring response...",
  "Consulting academic sources...",
];

export default function AIResponseLoader({
  text,
  className = "",
}: AIResponseLoaderProps) {
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    if (text) {
      setCurrentMessage(text);
    } else {
      const randomIndex = Math.floor(Math.random() * LOADER_MESSAGES.length);
      setCurrentMessage(LOADER_MESSAGES[randomIndex]);
    }
  }, [text]);
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="text-muted-foreground text-sm font-medium [--shadow-color:var(--color-primary-500)] dark:[--shadow-color:var(--color-primary-400)]">
        {currentMessage.split("").map((char, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ scale: 1, opacity: 0.4 }}
            animate={{
              scale: [1, 1.05, 1],
              textShadow: [
                "0 0 0 var(--shadow-color)",
                "0 0 2px var(--shadow-color)",
                "0 0 0 var(--shadow-color)",
              ],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.6,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              delay: i * 0.03,
              ease: "easeInOut",
              repeatDelay: 1.5,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </div>

      {/* Animated cursor */}
      <motion.div
        className="bg-primary h-4 w-2 rounded-sm"
        animate={{
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 0.8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

export function AITypingLoader({
  text,
  className = "",
}: AIResponseLoaderProps) {
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    if (text) {
      setCurrentMessage(text);
    } else {
      const randomIndex = Math.floor(Math.random() * LOADER_MESSAGES.length);
      setCurrentMessage(LOADER_MESSAGES[randomIndex]);
    }
  }, [text]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="text-muted-foreground text-sm font-medium">
        {currentMessage.split("").map((char, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: [0, 1, 0.7],
              y: [10, 0, 0],
            }}
            transition={{
              duration: 0.4,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              delay: i * 0.05,
              ease: "easeOut",
              repeatDelay: 2,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </div>

      {/* Animated dots */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="bg-primary h-1.5 w-1.5 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.6,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Brain thinking animation version
export function AIBrainLoader({ text, className = "" }: AIResponseLoaderProps) {
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    // If text is provided, use it; otherwise pick a random message
    if (text) {
      setCurrentMessage(text);
    } else {
      const randomIndex = Math.floor(Math.random() * LOADER_MESSAGES.length);
      setCurrentMessage(LOADER_MESSAGES[randomIndex]);
    }
  }, [text]);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Brain/thinking icon */}
      <motion.div
        className="relative"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <motion.svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          className="text-primary"
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <path
            d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 3.5L14 4V6H13V4L12 3L10 4V6H9V4L8 3L2 6V8L8 11L10 10V12H9V11L8 12L2 15V17L8 20L10 19V21H14V19L16 20L22 17V15L16 12L14 13V11H15V13L16 12L22 9H21Z"
            fill="currentColor"
          />
        </motion.svg>

        {/* Thinking particles */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="bg-primary absolute h-1 w-1 rounded-full"
            style={{
              top: `${Math.random() * 20}px`,
              left: `${Math.random() * 20}px`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              y: [-10, -20, -30],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.7,
              ease: "easeOut",
            }}
          />
        ))}
      </motion.div>

      <div className="text-muted-foreground text-sm font-medium">
        {currentMessage.split("").map((char, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ opacity: 0.3 }}
            animate={{
              opacity: [0.3, 1, 0.3],
              color: [
                "rgb(107 114 128)", // text-muted-foreground
                "rgb(59 130 246)", // text-primary
                "rgb(107 114 128)",
              ],
            }}
            transition={{
              duration: 1.2,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.04,
              ease: "easeInOut",
              repeatDelay: 1,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
