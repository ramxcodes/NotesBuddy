import { NOTE_BY_SLUG_QUERYResult } from "@/sanity/types";
import { slugify } from "@/utils/helpers";
import Link from "next/link";

export default function TableOfContent({
  headings,
}: {
  headings: NonNullable<NOTE_BY_SLUG_QUERYResult>["headings"];
}) {
  if (!headings || headings.length === 0) {
    return null;
  }

  const getHeadingText = (heading: (typeof headings)[0]) => {
    if (!heading.children) return "Untitled";

    return (
      heading.children
        .map((child) => child.text || "")
        .join("")
        .trim() || "Untitled"
    );
  };

  return (
    <div className="mt-8 mb-4">
      <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
      <nav>
        <ul className="space-y-1">
          {headings.map((heading) => {
            const text = getHeadingText(heading);
            const level = parseInt(heading.style?.slice(1) || "2");
            const paddingLeft = `${(level - 2) * 1.5}rem`;
            
            return (
              <li 
                key={heading._key}
                style={{ paddingLeft }}
                className={`text-sm ${
                  level === 2 
                    ? 'font-medium text-gray-900' 
                    : 'text-gray-500'
                }`}
              >
                <Link
                  className="hover:text-gray-700 hover:underline"
                  href={`#${slugify(text)}`}
                >
                  {text}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
