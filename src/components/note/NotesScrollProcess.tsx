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
    null
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
        className="w-full h-1 z-50 fixed top-0"
      />
      {showNavigateButton && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="cursor-pointer hover:bg-accent transition-all duration-300 fixed bottom-6 right-10"
              onClick={handleScrollAction}
            >
              {scrollDirection === "down" ? (
                <ChevronsDown className="transition-all" />
              ) : (
                <ChevronsUp className="transition-all" />
              )}
              <span className="sr-only">
                {scrollDirection === "down"
                  ? "Scroll to Bottom"
                  : "Scroll to Top"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {scrollDirection === "down" ? "Scroll to Bottom" : "Scroll to Top"}
            </p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

export default ScrollProgress;