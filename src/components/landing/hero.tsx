"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRightIcon, BookOpenIcon, StarIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Link } from "next-view-transitions";
import Image from "next/image";
import HandDrawnArrow from "../svgs/HandDrawnArrow";
import Science from "../svgs/Science";
import Cap from "../svgs/Cap";

interface Testimonial {
  name: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    name: "John Doe",
    image: "/avatar/1.jpg",
  },
  {
    name: "John Doe",
    image: "/avatar/2.jpg",
  },
  {
    name: "John Doe",
    image: "/avatar/3.jpg",
  },
  {
    name: "John Doe",
    image: "/avatar/4.jpg",
  },
  {
    name: "John Doe",
    image: "/avatar/5.jpg",
  },
  {
    name: "John Doe",
    image: "/avatar/6.jpg",
  },
  {
    name: "John Doe",
    image: "/avatar/7.jpg",
  },
];

export default function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["smart", "fast", "efficient", "quick", "effective"],
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
        <div className="flex flex-col items-center justify-center gap-8 py-20 lg:py-40 relative">
          <Science className="size-24 md:size-64 absolute left-4 top-4" />
          <Cap className="size-24 md:size-64 absolute bottom-0 md:bottom-10 right-10" />
          <div>
            <Button variant="secondary" size="sm" className="gap-4">
              Now it is time to study{" "}
              <ArrowRightIcon weight="duotone" className="size-4" />
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="font-regular max-w-2xl text-center text-5xl tracking-tighter md:text-7xl">
              <span className="font-excon relative font-black">
                Your all-in-one learning platform
                <HandDrawnArrow className="absolute right-2 mx-auto mt-4 size-8 md:-right-8 md:size-12" />
              </span>

              <span className="font-ranade relative flex w-full justify-center overflow-hidden text-center md:pt-1 md:pb-4">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.div
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
                  </motion.div>
                ))}
              </span>
            </h1>

            <p className="text-secondary font-satoshi max-w-2xl text-center text-lg leading-relaxed tracking-tight md:text-xl">
              Preparing for exams is already challenging enough. <br />
              Avoid further complications by ditching outdated study methods.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Link href="/notes">
              <Button
                size="lg"
                className="gap-4 border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:text-white hover:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]"
              >
                Visit Notes <BookOpenIcon weight="duotone" className="size-4" />
              </Button>
            </Link>
            <Link href="/premium">
              <Button
                size="lg"
                className="gap-4 border-2 border-black bg-black text-white shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:bg-white hover:text-black hover:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-white dark:text-black dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]"
              >
                Purchase Premium{" "}
                <StarIcon weight="duotone" className="size-4" />
              </Button>
            </Link>
          </div>
          <div className="flex flex-row gap-3">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {testimonials.map((testimonial) => (
                  <Image
                    key={testimonial.image}
                    src={testimonial.image}
                    alt="User testimonial"
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full border-2 border-white transition-all duration-300 hover:scale-150 hover:cursor-pointer"
                  />
                ))}
              </div>
              <p className="text-muted-foreground text-sm">
                Trusted by 1000+ students
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
