"use client";

import { NOTE_BY_SLUG_QUERYResult } from "@/sanity/types";
import { slugify } from "@/utils/helpers";
import { useEffect, useState } from "react";
import {
  BookOpenIcon,
  CaretDownIcon,
  CaretRightIcon,
  ListIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

type HeadingItem = NonNullable<
  NonNullable<NOTE_BY_SLUG_QUERYResult>["headings"]
>[0];

interface GroupedHeading {
  h2: HeadingItem;
  h3s: HeadingItem[];
}

export default function TableOfContent({
  headings,
}: {
  headings: NonNullable<NOTE_BY_SLUG_QUERYResult>["headings"];
}) {
  const [activeId, setActiveId] = useState<string>("");
  const [activeH2Id, setActiveH2Id] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile();

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getHeadingText = (heading: HeadingItem) => {
    if (!heading?.children) return "Untitled";

    return (
      heading.children
        .map((child: { text?: string }) => child.text || "")
        .join("")
        .trim() || "Untitled"
    );
  };

  // Group headings by H2 sections
  const groupHeadings = (headings: HeadingItem[]): GroupedHeading[] => {
    const grouped: GroupedHeading[] = [];
    let currentH2: GroupedHeading | null = null;

    headings.forEach((heading) => {
      const level = parseInt(heading.style?.slice(1) || "2");

      if (level === 2) {
        if (currentH2) {
          grouped.push(currentH2);
        }
        currentH2 = { h2: heading, h3s: [] };
      } else if (level === 3 && currentH2) {
        currentH2.h3s.push(heading);
      }
    });

    if (currentH2) {
      grouped.push(currentH2);
    }

    return grouped;
  };

  const groupedHeadings = groupHeadings(headings || []);

  useEffect(() => {
    if (!headings || headings.length === 0) return;

    const headingIds = headings.map((heading) =>
      slugify(getHeadingText(heading)),
    );

    const observerOptions = {
      rootMargin: "-20% 0% -80% 0%",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);

          // Find which H2 section this heading belongs to
          const headingLevel = parseInt(
            headings
              .find((h) => slugify(getHeadingText(h)) === entry.target.id)
              ?.style?.slice(1) || "2",
          );

          if (headingLevel === 2) {
            setActiveH2Id(entry.target.id);
          } else if (headingLevel === 3) {
            // Find the parent H2 for this H3
            const headingIndex = headings.findIndex(
              (h) => slugify(getHeadingText(h)) === entry.target.id,
            );
            for (let i = headingIndex - 1; i >= 0; i--) {
              const level = parseInt(headings[i].style?.slice(1) || "2");
              if (level === 2) {
                setActiveH2Id(slugify(getHeadingText(headings[i])));
                break;
              }
            }
          }
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions,
    );

    // Observe all headings
    headingIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [headings]);

  if (!headings || headings.length === 0) {
    return null;
  }

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted) {
    return null;
  }

  const handleClick = (text: string) => {
    const id = slugify(text);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);

      // Close sheet on mobile after clicking
      if (isMobile) {
        setIsOpen(false);
      }
    }
  };

  const toggleH2Section = (h2Id: string) => {
    setActiveH2Id(activeH2Id === h2Id ? "" : h2Id);
  };

  const TableOfContentInner = () => (
    <div className="flex h-full flex-col">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-black dark:text-white">
        <BookOpenIcon className="size-4" weight="duotone" />
        On this page
      </h3>
      <div className="mb-8 flex-1 overflow-y-auto pb-8 pl-1">
        <nav>
          <ul className="space-y-2">
            {groupedHeadings.map((group) => {
              const h2Text = getHeadingText(group.h2);
              const h2Id = slugify(h2Text);
              const isActiveH2 = activeH2Id === h2Id;
              const isCurrentH2 = activeId === h2Id;

              return (
                <li key={group.h2._key}>
                  {/* H2 Heading */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleH2Section(h2Id)}
                      className="mr-1 flex-shrink-0 rounded-md border-2 border-black bg-white p-1 font-bold shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
                      aria-label={
                        isActiveH2 ? "Collapse section" : "Expand section"
                      }
                    >
                      {isActiveH2 ? (
                        <CaretDownIcon className="size-3 text-black dark:text-white" />
                      ) : (
                        <CaretRightIcon className="size-3 text-black dark:text-white" />
                      )}
                    </button>
                    <button
                      onClick={() => handleClick(h2Text)}
                      className={`flex-1 rounded-md border-2 border-black px-3 py-2 text-left text-sm font-bold transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white dark:hover:shadow-[3px_3px_0px_0px_#757373] ${
                        isCurrentH2
                          ? "bg-black text-white shadow-[2px_2px_0px_0px_#000] dark:bg-white dark:text-black dark:shadow-[2px_2px_0px_0px_#757373]"
                          : "bg-white text-black shadow-[2px_2px_0px_0px_#000] dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
                      }`}
                    >
                      {h2Text}
                    </button>
                  </div>

                  {/* H3 Headings - Only show if this H2 section is active */}
                  {isActiveH2 && group.h3s.length > 0 && (
                    <ul className="mt-2 ml-6 space-y-2">
                      {group.h3s.map((h3) => {
                        const h3Text = getHeadingText(h3);
                        const h3Id = slugify(h3Text);
                        const isActiveH3 = activeId === h3Id;

                        return (
                          <li className="border-l-4 pl-2" key={h3._key}>
                            <button
                              onClick={() => handleClick(h3Text)}
                              className={`block w-full rounded-md border-2 border-black px-3 py-2 text-left text-xs font-bold transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white dark:hover:shadow-[3px_3px_0px_0px_#757373] ${
                                isActiveH3
                                  ? "bg-black text-white shadow-[2px_2px_0px_0px_#000] dark:bg-white dark:text-black dark:shadow-[2px_2px_0px_0px_#757373]"
                                  : "bg-white text-black shadow-[2px_2px_0px_0px_#000] dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373]"
                              }`}
                            >
                              {h3Text}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );

  return (
    <div
      className={`fixed z-40 ${
        isMobile ? "top-20 -right-1" : "top-40 right-6"
      }`}
    >
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size={isMobile ? "lg" : "sm"}
            className={`border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] backdrop-blur-sm transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373] ${
              isMobile ? "rounded-l-3xl" : ""
            }`}
            aria-label="Toggle table of contents"
          >
            <ListIcon
              className={`${isMobile ? "size-5" : "size-4"}`}
              weight="duotone"
            />
            <span className="hidden lg:block">
              {activeId
                ? headings?.find((h) => slugify(getHeadingText(h)) === activeId)
                  ? (() => {
                      const fullText = getHeadingText(
                        headings.find(
                          (h) => slugify(getHeadingText(h)) === activeId,
                        )!,
                      );
                      const words = fullText.split(" ");
                      const truncated = words.slice(0, 4).join(" ");
                      return words.length > 4 ? `${truncated}...` : fullText;
                    })()
                  : "Table of Contents"
                : "Table of Contents"}
            </span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className={`border-l-2 border-black bg-white dark:border-white dark:bg-zinc-900 ${isMobile ? "w-[280px] p-4" : "w-[320px] p-6 sm:w-[400px]"}`}
        >
          <SheetHeader>
            <SheetTitle className="sr-only">Table of Contents</SheetTitle>
          </SheetHeader>
          <TableOfContentInner />
        </SheetContent>
      </Sheet>
    </div>
  );
}
