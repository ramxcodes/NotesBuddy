"use client";

import { NOTE_BY_SLUG_QUERYResult } from "@/sanity/types";
import { slugify } from "@/utils/helpers";
import { useEffect, useState } from "react";
import { BookOpenIcon } from "@/components/icons/BookOpenIcon";
import { CaretDownIcon } from "@/components/icons/CaretDownIcon";
import { CaretRightIcon } from "@/components/icons/CaretRightIcon";

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

  const handleClick = (text: string) => {
    const id = slugify(text);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
  };

  const toggleH2Section = (h2Id: string) => {
    setActiveH2Id(activeH2Id === h2Id ? "" : h2Id);
  };

  return (
    <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
        <BookOpenIcon className="size-4" />
        On this page
      </h3>
      <div className="border-l border-gray-200 pl-4 dark:border-gray-700">
        <nav>
          <ul className="space-y-1">
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
                      className="mr-1 flex-shrink-0 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      aria-label={
                        isActiveH2 ? "Collapse section" : "Expand section"
                      }
                    >
                      {isActiveH2 ? (
                        <CaretDownIcon className="size-4" />
                      ) : (
                        <CaretRightIcon className="size-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleClick(h2Text)}
                      className={`flex-1 text-left text-lg font-medium transition-colors duration-200 hover:text-orange-500 ${
                        isCurrentH2
                          ? "text-orange-500"
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {h2Text}
                    </button>
                  </div>

                  {/* H3 Headings - Only show if this H2 section is active */}
                  {isActiveH2 && group.h3s.length > 0 && (
                    <ul className="mt-1 ml-10 space-y-2 text-sm">
                      {group.h3s.map((h3) => {
                        const h3Text = getHeadingText(h3);
                        const h3Id = slugify(h3Text);
                        const isActiveH3 = activeId === h3Id;

                        return (
                          <li key={h3._key}>
                            <button
                              onClick={() => handleClick(h3Text)}
                              className={`block w-full text-left transition-colors duration-200 hover:text-[#F29707] ${
                                isActiveH3
                                  ? "font-medium text-[#F29707]"
                                  : "text-gray-600 dark:text-gray-400"
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
}
