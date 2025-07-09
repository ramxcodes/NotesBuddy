import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

interface ImageComponentProps {
  value: {
    _type: "customImage";
    asset: SanityImageSource;
    alt?: string;
    caption?: string;
    hotspot?: {
      x: number;
      y: number;
      height: number;
      width: number;
    };
    crop?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
  isInline?: boolean;
}

export const ImageComponent = ({ value, isInline }: ImageComponentProps) => {
  const { alt, caption } = value;

  if (!value?.asset) {
    return null;
  }

  // Generate optimized image URL
  const imageUrl = urlFor(value)
    .width(800)
    .height(600)
    .quality(85)
    .auto("format")
    .url();

  // For inline images, render smaller
  if (isInline) {
    return (
      <span className="inline-block">
        <Image
          src={imageUrl}
          alt={alt || ""}
          width={400}
          height={300}
          className="inline-block h-auto max-w-full rounded-md"
          style={{ maxWidth: "400px", height: "auto" }}
        />
      </span>
    );
  }

  // For block images, render full width with caption
  return (
    <figure className="not-prose my-8">
      <div className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        <Image
          src={imageUrl}
          alt={alt || ""}
          width={800}
          height={600}
          className="h-auto w-full object-cover transition-transform duration-300 hover:scale-105"
          style={{ maxWidth: "100%", height: "auto" }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
          priority={false}
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-gray-600 italic dark:text-gray-400">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
