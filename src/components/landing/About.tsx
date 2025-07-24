"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircleIcon,
  BrainIcon,
  LightningIcon,
} from "@phosphor-icons/react";

interface AnimatedTextCycleProps {
  words: string[];
  interval?: number;
  className?: string;
}

function AnimatedTextCycle({
  words,
  interval = 3000,
  className = "",
}: AnimatedTextCycleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, words.length]);

  const containerVariants = {
    hidden: {
      y: -20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
      },
    },
    exit: {
      y: 20,
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <span className="relative inline-block">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={currentIndex}
          className={`inline-block font-light ${className}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {words[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
}: FeatureCardProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        delay: delay,
      },
    },
  };

  return (
    <motion.div
      className="group relative"
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="bg-card dark:bg-card hover:shadow-primary/5 hover:border-primary/20 border-primary dark:border-secondary relative rounded-2xl border border-r-8 border-b-8 p-8 shadow-none backdrop-blur-sm transition-all duration-300 hover:border-r-1 hover:border-b-1 hover:shadow-lg">
        <div className="from-primary/5 dark:from-primary/10 absolute inset-0 rounded-2xl bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative z-10">
          <div className="bg-primary/10 dark:bg-primary/20 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 mb-6 flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300">
            {icon}
          </div>

          <h3 className="text-foreground dark:text-foreground font-excon mb-3 text-xl font-semibold">
            {title}
          </h3>

          <p className="text-muted-foreground dark:text-muted-foreground font-satoshi mt-4 text-lg leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function About() {
  const features = [
    {
      icon: <CheckCircleIcon type="duotone" className="text-primary h-6 w-6" />,
      title: "Clarity Over Complexity",
      description:
        "Simplifies concepts for deeper and better understanding. We break down complex topics into digestible chunks.",
    },
    {
      icon: <BrainIcon type="duotone" className="text-primary h-6 w-6" />,
      title: "Answers at Your Fingertips",
      description:
        "Our AI answers your questions instantly, helping you learn faster. Get immediate support whenever you need clarification.",
    },
    {
      icon: <LightningIcon type="duotone" className="text-primary h-6 w-6" />,
      title: "Fast and Efficient Learning",
      description:
        "Accelerates learning with quick, focused resources. Study smarter with optimized content and streamlined processes.",
    },
  ];

  const animatedWords = ["smarter", "faster", "better", "easier"];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
      },
    },
  };

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <div className="absolute inset-0" />

      <div className="relative z-10 container mx-auto">
        <motion.div
          className="mb-16 text-center md:mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2
            className="font-regular mx-auto mb-6 max-w-4xl text-center text-4xl leading-tight tracking-tighter md:text-5xl lg:text-6xl"
            variants={titleVariants}
          >
            <span className="font-excon font-black">Learn </span>
            <span className="font-ranade relative">
              <AnimatedTextCycle
                words={animatedWords}
                interval={3000}
                className="text-primary"
              />
            </span>
            <span className="font-excon font-black"> with Notes Buddy</span>
          </motion.h2>

          <motion.p
            className="text-secondary font-satoshi mx-auto max-w-3xl text-center text-lg leading-relaxed tracking-tight md:text-xl"
            variants={titleVariants}
          >
            Transform your learning experience with our innovative platform
            designed for modern students. Preparing for exams is challenging
            enough - let us simplify the process.
          </motion.p>
        </motion.div>

        <motion.div
          className="line-clamp-3 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.1}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
