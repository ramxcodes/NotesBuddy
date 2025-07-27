"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ClockIcon } from "@phosphor-icons/react";

interface ContentBlock {
  _type: string;
  children?: Array<{ text?: string }>;
}

interface GreetUserProps {
  name: string | null;
  image: string | null;
  email: string | null;
  content?: ContentBlock[];
}

const calculateReadingTime = (content: ContentBlock[]): number => {
  if (!content || content.length === 0) return 1;

  // Estimate word count from content blocks
  const wordCount = content.reduce((count, block) => {
    if (block._type === "block" && block.children) {
      const text = block.children
        .map((child: { text?: string }) => child.text || "")
        .join(" ");
      return (
        count +
        text.split(/\s+/).filter((word: string) => word.length > 0).length
      );
    }
    return count;
  }, 0);

  // Average reading speed: 200 words per minute
  const readingTime = Math.ceil(wordCount / 200);
  return Math.max(1, readingTime);
};

export default function GreetUser({
  name,
  image,
  email,
  content,
}: GreetUserProps) {
  const firstName = name?.split(" ")[0] || "there";
  const readingTime = calculateReadingTime(content || []);

  return (
    <div className="mb-8 flex flex-col gap-3 rounded-xl border-2 border-black bg-zinc-100 p-6 shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[6px_6px_0px_0px_#757373]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 border-2 border-black dark:border-white/20">
            <AvatarImage src={image || ""} />
            <AvatarFallback className="bg-zinc-800 font-bold text-white dark:bg-zinc-200 dark:text-black">
              {name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-black dark:text-white">
              Hey, {firstName}!{" "}
            </p>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              {email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <ClockIcon className="size-4" weight="duotone" />
          <span className="text-sm font-bold">{readingTime} min read</span>
        </div>
      </div>
    </div>
  );
}
