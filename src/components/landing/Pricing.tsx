"use client";

import React from "react";
import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { TIER_CONFIG, getAllTierConfigs } from "@/dal/premium/types";
import { PremiumTier } from "@prisma/client";
import { Button } from "../ui/button";
import { Link } from "next-view-transitions";
import Image from "next/image";

const originalPrice = [
  {
    tier: "TIER_1",
    price: 199,
  },
  {
    tier: "TIER_2",
    price: 299,
  },
  {
    tier: "TIER_3",
    price: 399,
  },
];

function PricingCard({
  tier,
  highlight,
}: {
  tier: PremiumTier;
  highlight?: boolean;
}) {
  const config = TIER_CONFIG[tier];
  const discounted = config.price;
  const label = config.title;
  const tag = config.title;
  const features = config.features;

  return (
    <motion.div
      className={`bg-card border-primary dark:border-secondary relative flex flex-col rounded-2xl border border-r-8 border-b-8 p-8 shadow-none transition-all duration-300 hover:shadow-lg ${
        highlight
          ? "border-primary/60 ring-primary/40 z-10 scale-105 ring-2"
          : "border-border"
      }`}
    >
      {/* Tag */}
      <div
        className={`absolute top-6 right-6 rounded-full px-3 py-1 text-xs font-bold ${highlight ? "bg-primary/25 text-white" : "bg-secondary text-foreground"}`}
      >
        {tag}
      </div>
      {/* Price */}
      <div className="mb-2 flex items-end gap-2">
        <span className="font-excon text-4xl font-black">₹{discounted}/-</span>
      </div>
      <div className="text-muted-foreground mb-2 text-sm">
        Original Price:{" "}
        <span className="line-through">
          ₹{originalPrice.find((p) => p.tier === tier)?.price}/-
        </span>
      </div>
      {/* Title & Desc */}
      <div className="mb-2 text-lg font-bold">{label}</div>
      <div className="text-muted-foreground mb-2 text-sm">
        {config.description}
      </div>
      <div className="text-muted-foreground mb-4 text-xs">
        Valid for <span className="font-bold">{config.duration} Days</span> for{" "}
        <span className="font-bold">1 Semester</span> from the day you purchase.
      </div>
      {/* Features */}
      <ul className="mb-6 flex flex-col gap-2">
        {config.features.map((feature, idx) => (
          <li key={feature} className="flex items-center gap-2 text-sm">
            {features[idx] ? (
              <CheckCircleIcon
                className="h-5 w-5 text-green-500"
                weight="duotone"
              />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-500" weight="duotone" />
            )}
            <span className={features[idx] ? "" : "line-through opacity-60"}>
              {feature}
            </span>
          </li>
        ))}
      </ul>
      <Link className="mt-auto w-full" href={`/premium?tier=${tier}`}>
        <Button
          className={`w-full rounded-lg border px-6 py-2 font-bold transition-all duration-200 ${
            highlight
              ? "bg-primary/70 border-primary hover:bg-primary dark:bg-primary/30 dark:hover:bg-primary text-white dark:hover:text-black"
              : "bg-background text-foreground border-border hover:bg-muted"
          }`}
          data-umami-event={`landing-pricing-card-buy-${tier.toLowerCase()}`}
        >
          Buy Now
        </Button>
      </Link>
    </motion.div>
  );
}

export default function Pricing() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <div className="relative z-10 container mx-auto">
        <Image
          src="/doodles/idea.svg"
          alt="Hero"
          width={50}
          height={50}
          className="absolute -top-16 left-0 size-16 md:-top-20 md:size-28"
        />
        <Image
          src="/doodles/exmark.svg"
          alt="Hero"
          width={50}
          height={50}
          className="absolute -top-14 right-0 size-16 md:-top-16 md:size-28"
        />
        <div className="mb-16 text-center md:mb-20">
          <h2 className="font-regular font-excon mx-auto mb-6 max-w-4xl text-center text-4xl leading-tight font-black tracking-tighter md:text-5xl lg:text-6xl">
            Why Study the Hard Way?
          </h2>
          <p className="text-secondary font-satoshi mx-auto max-w-3xl text-center text-lg leading-relaxed tracking-tight md:text-xl">
            Unlock the perfect guide to your preparation journey.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
          {getAllTierConfigs().map((tier) => (
            <PricingCard
              key={tier.tier}
              tier={tier.tier}
              highlight={tier.tier === "TIER_2"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
