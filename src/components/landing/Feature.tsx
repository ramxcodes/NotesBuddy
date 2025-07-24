"use client";

import {
  BookOpenIcon,
  LightningIcon,
  BrainIcon,
  ClockIcon,
  MedalIcon,
  ChatCenteredDotsIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import React from "react";

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
      <div className="bg-card hover:shadow-primary/5 hover:border-primary/20 border-primary dark:border-secondary relative rounded-2xl border border-r-8 border-b-8 p-8 shadow-none backdrop-blur-sm transition-all duration-300 hover:border-r-1 hover:border-b-1 hover:shadow-lg">
        <div className="from-primary/5 absolute inset-0 rounded-2xl bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative z-10">
          <div className="bg-primary/10 group-hover:bg-primary/20 mb-6 flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300">
            {icon}
          </div>
          <h3 className="text-foreground font-excon mb-3 text-xl font-semibold">
            {title}
          </h3>
          <p className="text-muted-foreground font-satoshi leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

const features = [
  {
    icon: <BookOpenIcon type="duotone" className="text-primary h-6 w-6" />,
    title: "Comprehensive Notes",
    description:
      "Concise, well-structured notes that simplify complex concepts for better understanding.",
  },
  {
    icon: <LightningIcon type="duotone" className="h-6 w-6 text-yellow-500" />,
    title: "Quick One-Shots",
    description:
      "Rapid review materials for last-minute preparation and key concept reinforcement.",
  },
  {
    icon: <BrainIcon type="duotone" className="h-6 w-6 text-purple-500" />,
    title: "Interactive Flashcards",
    description:
      "Effective memory tools to master terminology and key concepts through active recall.",
  },
  {
    icon: <ClockIcon type="duotone" className="h-6 w-6 text-green-500" />,
    title: "Practice Quizzes",
    description:
      "Self-assessment tools to test your knowledge and identify areas for improvement.",
  },
  {
    icon: <MedalIcon type="duotone" className="h-6 w-6 text-red-500" />,
    title: "Topper Notes",
    description:
      "Access handwritten notes from top-performing students to understand winning strategies.",
  },
  {
    icon: (
      <ChatCenteredDotsIcon type="duotone" className="h-6 w-6 text-cyan-500" />
    ),
    title: "AI Study Assistant",
    description:
      "Get instant answers to your questions with our intelligent AI chatbot (coming soon).",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export default function Features() {
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
          <h2 className="font-regular font-excon mx-auto mb-6 max-w-4xl text-center text-4xl leading-tight font-black tracking-tighter md:text-5xl lg:text-6xl">
            Features of Notes Buddy
          </h2>
          <p className="text-secondary font-satoshi mx-auto max-w-3xl text-center text-lg leading-relaxed tracking-tight md:text-xl">
            Everything you need to excel in your studies, all in one place
          </p>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12"
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
