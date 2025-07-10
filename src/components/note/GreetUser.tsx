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
    <div className="mb-8 flex flex-col gap-3 rounded-2xl border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage src={image || ""} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">Hey, {firstName}! </p>
            <p className="text-muted-foreground text-sm">{email}</p>
          </div>
        </div>

        <div className="text-muted-foreground flex items-center gap-2">
          <ClockIcon className="size-4" weight="duotone" />
          <span className="text-sm font-medium">{readingTime} min read</span>
        </div>
      </div>
    </div>
  );
}
