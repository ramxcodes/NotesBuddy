"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRightIcon, BookOpenIcon, StarIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Link } from "next-view-transitions";
import Image from "next/image";

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
              Now it is time to study{" "}
              <ArrowRightIcon type="duotone" className="size-4" />
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
              <Button size="lg" className="gap-4" variant="outline">
                Visit Notes <BookOpenIcon type="duotone" className="size-4" />
              </Button>
            </Link>
            <Link href="/premium">
              <Button size="lg" className="gap-4">
                Purchase Premium <StarIcon type="duotone" className="size-4" />
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
