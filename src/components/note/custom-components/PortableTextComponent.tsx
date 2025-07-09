import { LinkIcon } from "@/components/icons/LinkIcon";
import { slugify } from "@/utils/helpers";
import {
  PortableTextComponentProps,
  PortableTextBlock,
  PortableTextMarkComponentProps,
} from "@portabletext/react";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";
import { ImageComponent } from "./ImageComponent";

type HeadingProps = PortableTextComponentProps<PortableTextBlock>;

interface TextChild {
  text?: string;
  _type?: string;
}

interface LatexBlockProps {
  _type: "latex";
  body: string;
}

const getHeadingText = (value: PortableTextBlock): string => {
  return (
    value.children
      ?.map((child: TextChild) => child.text || "")
      .join("")
      .trim() || "Untitled"
  );
};

const LaTeXComponent = ({ value }: { value: LatexBlockProps }) => {
  const { body } = value;

  return (
    <div className="latex-container">
      <BlockMath math={body} />
    </div>
  );
};

export const myPortableTextComponents = {
  block: {
    h1: ({ value }: HeadingProps) => {
      const text = getHeadingText(value);
      return (
        <h1 id={slugify(text)} className="note-h1">
          {text}
        </h1>
      );
    },
    h2: ({ value }: HeadingProps) => {
      const text = getHeadingText(value);
      return (
        <h2 id={slugify(text)} className="note-h2">
          {text}
        </h2>
      );
    },
    h3: ({ value }: HeadingProps) => {
      const text = getHeadingText(value);
      return (
        <h3 id={slugify(text)} className="note-h3">
          {text}
        </h3>
      );
    },
    h4: ({ value }: HeadingProps) => {
      const text = getHeadingText(value);
      return (
        <h4 id={slugify(text)} className="note-h4">
          {text}
        </h4>
      );
    },
    h5: ({ value }: HeadingProps) => {
      const text = getHeadingText(value);
      return (
        <h5 id={slugify(text)} className="note-h5">
          {text}
        </h5>
      );
    },
    h6: ({ value }: HeadingProps) => {
      const text = getHeadingText(value);
      return (
        <h6 id={slugify(text)} className="note-h6">
          {text}
        </h6>
      );
    },
    normal: ({ children }: PortableTextComponentProps<PortableTextBlock>) => {
      return <p className="note-p">{children}</p>;
    },
  },
  list: {
    bullet: ({ children }: PortableTextComponentProps<PortableTextBlock>) => {
      return <ul className="note-ul">{children}</ul>;
    },
    number: ({ children }: PortableTextComponentProps<PortableTextBlock>) => {
      return <ol className="note-ol">{children}</ol>;
    },
  },
  listItem: {
    bullet: ({ children }: PortableTextComponentProps<PortableTextBlock>) => {
      return <li className="note-li">{children}</li>;
    },
    number: ({ children }: PortableTextComponentProps<PortableTextBlock>) => {
      return <li className="note-li">{children}</li>;
    },
  },
  marks: {
    strong: ({ children }: PortableTextMarkComponentProps) => {
      return <strong className="note-strong">{children}</strong>;
    },
    em: ({ children }: PortableTextMarkComponentProps) => {
      return <em className="note-em">{children}</em>;
    },
    link: ({ children, value }: PortableTextMarkComponentProps) => {
      return (
        <a
          href={value?.href}
          target="_blank"
          rel="noopener noreferrer"
          className="note-a"
        >
          {children} <LinkIcon className="inline-block h-4 w-4" />
        </a>
      );
    },
  },
  types: {
    latex: LaTeXComponent,
    customImage: ImageComponent,
  },
};
