"use client";

import { ChevronsUp, ChevronsDown } from "lucide-react";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import useScrollProgress from "@/hooks/use-scroll-progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const ScrollProgress = () => {
  const { scrollProgress } = useScrollProgress();
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(
    null,
  );
  const [lastScrollY, setLastScrollY] = useState(0);
  const showNavigateButton = scrollProgress > 2;

  // Track scroll direction and set the last scroll y position
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection("up");
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleScrollAction = () => {
    if (scrollDirection === "down") {
      scrollToBottom();
    } else {
      scrollToTop();
    }
  };

  return (
    <div>
      <Progress
        value={scrollProgress}
        className="fixed top-0 z-50 h-1 w-full"
      />
      {showNavigateButton && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="fixed right-10 bottom-6 flex flex-col items-center gap-1">
              <div className="relative">
                {/* Circular progress indicator */}
                <svg
                  className="h-12 w-12 -rotate-90 transform"
                  viewBox="0 0 48 48"
                >
                  {/* Background circle */}
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-muted-foreground/20"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - scrollProgress / 100)}`}
                    className="text-primary transition-all duration-300"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Button in the center */}
                <Button
                  variant="outline"
                  size="icon"
                  className="hover:bg-accent absolute inset-1 h-10 w-10 cursor-pointer rounded-full transition-all duration-300"
                  onClick={handleScrollAction}
                >
                  {scrollDirection === "down" ? (
                    <ChevronsDown className="h-4 w-4 transition-all" />
                  ) : (
                    <ChevronsUp className="h-4 w-4 transition-all" />
                  )}
                  <span className="sr-only">
                    {scrollDirection === "down"
                      ? "Scroll to Bottom"
                      : "Scroll to Top"}
                  </span>
                </Button>
              </div>

              {/* Percentage indicator */}
              <div className="text-muted-foreground bg-background/80 rounded-full border px-2 py-1 text-xs font-medium shadow-sm backdrop-blur-sm">
                {Math.round(scrollProgress)}%
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {scrollDirection === "down"
                ? "Scroll to Bottom"
                : "Scroll to Top"}
            </p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

export default ScrollProgress;
