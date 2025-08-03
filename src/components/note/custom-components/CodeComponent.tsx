"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CodeBlockProps {
  _type: "code";
  language?: string;
  code: string;
  filename?: string;
}

export const CodeComponent = ({ value }: { value: CodeBlockProps }) => {
  const { language = "text", code, filename } = value;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div className="code-block-container my-6">
      {filename && (
        <div className="code-filename rounded-t-lg border-b border-gray-700 bg-gray-800 px-4 py-2 font-mono text-sm text-gray-300">
          {filename}
        </div>
      )}
      <div className="relative">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 z-10 cursor-pointer rounded bg-gray-700 px-3 py-1 text-sm text-white transition-colors duration-200 hover:bg-gray-600"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{copied ? "Copied to clipboard!" : "Copy code"}</p>
          </TooltipContent>
        </Tooltip>
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          customStyle={{
            margin: 0,
            borderRadius: filename ? "0 0 0.5rem 0.5rem" : "0.5rem",
            fontSize: "0.875rem",
            lineHeight: "1.5",
          }}
          showLineNumbers={code.split("\n").length > 5}
          wrapLines={true}
          wrapLongLines={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
