"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRightIcon, BookOpenIcon, StarIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["smart", "fast", "efficient", "comprehensive", "effective"],
    [],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center gap-8 py-20 lg:py-40">
          <div>
            <Button variant="secondary" size="sm" className="gap-4">
              Now it is time to study <ArrowRightIcon type="duotone" className="size-4" />
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="font-regular max-w-2xl text-center text-5xl tracking-tighter md:text-7xl">
              <span className="font-excon font-black">
                Your all-in-one learning platform
              </span>
              <span className="font-ranade relative flex w-full justify-center overflow-hidden text-center md:pt-1 md:pb-4">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-light"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-secondary font-satoshi max-w-2xl text-center text-lg leading-relaxed tracking-tight md:text-xl">
              Preparing for exams is already challenging enough. <br />
              Avoid further complications by ditching outdated study methods.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Button size="lg" className="gap-4" variant="outline">
              Visit Notes <BookOpenIcon type="duotone" className="size-4" />
            </Button>
            <Link href="/premium">
              <Button size="lg" className="gap-4">
                Purchase Premium <StarIcon type="duotone" className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
