import { motion } from "motion/react";

interface QuizCountdownProps {
  countdown: number;
}

export default function QuizCountdown({ countdown }: QuizCountdownProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <motion.div
          key={countdown}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="font-excon text-8xl font-black text-white"
        >
          {countdown === 0 ? "GO!" : countdown}
        </motion.div>
        {countdown > 0 && (
          <p className="font-satoshi mt-4 text-xl text-white">
            Get ready to start the quiz...
          </p>
        )}
      </motion.div>
    </div>
  );
}
