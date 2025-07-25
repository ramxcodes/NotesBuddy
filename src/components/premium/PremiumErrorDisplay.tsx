"use client";

import { motion, AnimatePresence } from "motion/react";

interface PremiumErrorDisplayProps {
  error: string;
}

export function PremiumErrorDisplay({ error }: PremiumErrorDisplayProps) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="mx-auto rounded-xl border-2 border-black bg-white p-4 text-black shadow-[2px_2px_0px_0px_#000] dark:border-white dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
        >
          <p className="font-satoshi">{error}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
