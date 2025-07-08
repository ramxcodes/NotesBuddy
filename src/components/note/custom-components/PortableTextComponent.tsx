import { slugify } from "@/utils/helpers";
import {
  PortableTextComponentProps,
  PortableTextBlock,
} from "@portabletext/react";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";

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
  },
  types: {
    latex: LaTeXComponent,
  },
};
