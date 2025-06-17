import { slugify } from "@/utils/helpers";
import {
  PortableTextComponentProps,
  PortableTextBlock,
} from "@portabletext/react";

type HeadingProps = PortableTextComponentProps<PortableTextBlock>;

interface TextChild {
  text?: string;
  _type?: string;
}

const getHeadingText = (value: PortableTextBlock): string => {
  return (
    value.children
      ?.map((child: TextChild) => child.text || "")
      .join("")
      .trim() || "Untitled"
  );
};

export const myPortableTextComponents = {
  block: {
    h2: ({ value }: HeadingProps) => {
      const text = getHeadingText(value);
      return (
        <h2 id={slugify(text)} className="text-3xl font-bold mb-3">
          {text}
        </h2>
      );
    },
    h3: ({ value }: HeadingProps) => {
      const text = getHeadingText(value);
      return (
        <h3 id={slugify(text)} className="text-2xl font-bold mb-3">
          {text}
        </h3>
      );
    },
    h4: ({ value }: HeadingProps) => {
      const text = getHeadingText(value);
      return (
        <h4 id={slugify(text)} className="text-xl font-bold mb-3">
          {text}
        </h4>
      );
    },
    h5: ({ value }: HeadingProps) => {
      const text = getHeadingText(value);
      return (
        <h5 id={slugify(text)} className="text-lg font-bold mb-3">
          {text}
        </h5>
      );
    },
    h6: ({ value }: HeadingProps) => {
      const text = getHeadingText(value);
      return (
        <h6 id={slugify(text)} className="text-base font-bold mb-3">
          {text}
        </h6>
      );
    },
  },
};
