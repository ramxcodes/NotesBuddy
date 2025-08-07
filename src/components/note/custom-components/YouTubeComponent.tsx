"use client";

import { Button } from "@/components/ui/button";
import { ArrowSquareInIcon } from "@phosphor-icons/react";
import { PortableTextComponentProps } from "@portabletext/react";
import { Link } from "next-view-transitions";

interface YouTubeBlockProps {
  _type: "youtube";
  url: string;
}

function getYouTubeEmbedUrl(url: string): string {
  // Extract video ID from various YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }

  // If it's already an embed URL, return as is
  if (url.includes("youtube.com/embed/")) {
    return url;
  }

  // Fallback - return original URL
  return url;
}

export function YouTubeComponent({
  value,
}: PortableTextComponentProps<YouTubeBlockProps>) {
  const { url } = value;

  if (!url) {
    return (
      <div className="my-4 rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          YouTube URL is required
        </p>
      </div>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(url);

  return (
    <div className="my-6">
      <div className="aspect-video w-full overflow-hidden rounded-lg shadow-lg">
        <iframe
          src={embedUrl}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
      <div className="mt-4 flex justify-end">
        <Link href={url} target="_blank">
          <Button className="neuro flex items-center justify-center gap-2 rounded-md p-4 no-underline">
            Open in new tab
            <ArrowSquareInIcon weight="duotone" className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
