import { type Note } from "@/sanity/types";

type PortableTextContent = NonNullable<Note["content"]>;

interface ContentItem {
  id: string;
  topic: string;
  subject: string;
  content: string;
  timestamp: string;
}

interface ImportedNotesData {
  contentItems: ContentItem[];
}

let globalKeyCounter = 0;

function generateUniqueKey(prefix = "item") {
  return `${prefix}-${++globalKeyCounter}`;
}

function removeThinkingBlocks(content: string): string {
  let cleanContent = content.replace(/<think>[\s\S]*?<\/think>/gi, "");
  cleanContent = cleanContent.replace(/\/n/g, "").replace(/\\n/g, "");
  cleanContent = cleanContent.replace(/\n\s*\n\s*\n/g, "\n\n");
  return cleanContent.trim();
}

function extractLatexFormulas(text: string): string {
  let result = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
    const cleanFormula = formula.trim();
    return `\n\n$$\n${cleanFormula}\n$$\n\n`;
  });

  result = result.replace(/\$([^$\n]+?)\$/g, (match, formula) => {
    const cleanFormula = formula.trim();
    return `\n\n$$\n${cleanFormula}\n$$\n\n`;
  });

  return result;
}

function parseInlineFormatting(text: string) {
  const spans = [];

  const parts = [];

  const regex = /(\*\*.*?\*\*|\*[^*]+?\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    parts.push(match[0]);
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  for (const part of parts) {
    if (!part) continue;

    if (part.startsWith("**") && part.endsWith("**")) {
      const boldText = part.slice(2, -2);
      if (boldText) {
        spans.push({
          _type: "span" as const,
          _key: generateUniqueKey("span"),
          text: boldText,
          marks: ["strong"],
        });
      }
    } else if (
      part.startsWith("*") &&
      part.endsWith("*") &&
      !part.startsWith("**")
    ) {
      const italicText = part.slice(1, -1);
      if (italicText) {
        spans.push({
          _type: "span" as const,
          _key: generateUniqueKey("span"),
          text: italicText,
          marks: ["em"],
        });
      }
    } else if (part) {
      spans.push({
        _type: "span" as const,
        _key: generateUniqueKey("span"),
        text: part,
        marks: [],
      });
    }
  }

  return spans;
}
function stripMarkdownFormatting(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/~~(.*?)~~/g, "$1")
    .trim();
}

function convertTableToPortableText(tableLines: string[]) {
  const rows = [];

  for (let i = 0; i < tableLines.length; i++) {
    const line = tableLines[i].trim();

    if (line.match(/^\|?\s*[-\s|]+\s*\|?$/)) {
      continue;
    }

    const cells = line
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((cell) => stripMarkdownFormatting(cell.trim()))
      .filter((cell) => cell !== "");

    if (cells.length > 0) {
      const tableRow = {
        _type: "tableRow" as const,
        _key: generateUniqueKey("tableRow"),
        cells: cells,
      };

      rows.push(tableRow);
    }
  }

  if (rows.length > 0) {
    return {
      _type: "table" as const,
      _key: generateUniqueKey("table"),
      rows: rows,
    };
  }

  return null;
}

function convertToPortableText(markdown: string): PortableTextContent {
  const blocks: PortableTextContent = [];

  const lines = markdown.trim().split("\n");

  let currentList: {
    _type: "block";
    _key: string;
    style: "normal" | "blockquote" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    listItem?: "bullet" | "number";
    level?: number;
    markDefs: never[];
    children: { _type: "span"; _key: string; text: string; marks: string[] }[];
  } | null = null;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (line === "") {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      i++;
      continue;
    }

    if (line === "---") {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      i++;
      continue;
    }

    if (line.startsWith("|")) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }

      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }

      const tableBlock = convertTableToPortableText(tableLines);
      if (tableBlock) {
        blocks.push(tableBlock);
      }
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }

      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const style = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

      blocks.push({
        _type: "block" as const,
        _key: generateUniqueKey("block"),
        style: style,
        markDefs: [],
        children: parseInlineFormatting(text),
      });
      i++;
      continue;
    }

    if (line.startsWith("> ")) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }

      const text = line.substring(2);
      blocks.push({
        _type: "block" as const,
        _key: generateUniqueKey("block"),
        style: "blockquote",
        markDefs: [],
        children: parseInlineFormatting(text),
      });
      i++;
      continue;
    }

    if (line.trim() === "$$") {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }

      let formulaContent = "";
      i++;

      while (i < lines.length && lines[i].trim() !== "$$") {
        if (formulaContent) {
          formulaContent += "\n" + lines[i];
        } else {
          formulaContent = lines[i];
        }
        i++;
      }

      if (i < lines.length && lines[i].trim() === "$$") {
        i++;
      }

      if (formulaContent.trim()) {
        blocks.push({
          _type: "latex" as const,
          _key: generateUniqueKey("latex"),
          body: formulaContent.trim(),
        });
      }
      continue;
    }

    if (line.includes("$$")) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }

      const latexMatches = line.match(/\$\$([^$]+)\$\$/g);
      if (latexMatches) {
        const parts = line.split(/\$\$[^$]+\$\$/);
        let latexIndex = 0;

        for (let partIndex = 0; partIndex < parts.length; partIndex++) {
          const textPart = parts[partIndex].trim();

          if (textPart) {
            blocks.push({
              _type: "block" as const,
              _key: generateUniqueKey("block"),
              style: "normal" as const,
              markDefs: [],
              children: parseInlineFormatting(textPart),
            });
          }

          if (latexIndex < latexMatches.length) {
            const latexContent = latexMatches[latexIndex]
              .replace(/\$\$/g, "")
              .trim();
            if (latexContent) {
              blocks.push({
                _type: "latex" as const,
                _key: generateUniqueKey("latex"),
                body: latexContent,
              });
            }
            latexIndex++;
          }
        }
      } else {
        blocks.push({
          _type: "block" as const,
          _key: generateUniqueKey("block"),
          style: "normal" as const,
          markDefs: [],
          children: parseInlineFormatting(line),
        });
      }
      i++;
      continue;
    }

    const codeBlockMatch = line.match(/^```(\w+)?$/);
    if (codeBlockMatch) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }

      const language = codeBlockMatch[1] || "text";
      let codeContent = "";
      i++;

      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        if (codeContent) {
          codeContent += "\n" + lines[i];
        } else {
          codeContent = lines[i];
        }
        i++;
      }

      if (i < lines.length && lines[i].trim().startsWith("```")) {
        i++;
      }

      if (codeContent.trim()) {
        blocks.push({
          _type: "code" as const,
          _key: generateUniqueKey("code"),
          language: language as
            | "text"
            | "javascript"
            | "typescript"
            | "python"
            | "html"
            | "css"
            | "json"
            | "markdown",
          code: codeContent.trim(),
        });
      }
      continue;
    }

    const orderedListMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (orderedListMatch) {
      const text = orderedListMatch[2];

      if (!currentList || currentList.listItem !== "number") {
        if (currentList) {
          blocks.push(currentList);
        }

        currentList = {
          _type: "block" as const,
          _key: generateUniqueKey("block"),
          style: "normal" as const,
          listItem: "number" as const,
          level: 1,
          markDefs: [],
          children: parseInlineFormatting(text),
        };
      } else {
        blocks.push(currentList);
        currentList = {
          _type: "block" as const,
          _key: generateUniqueKey("block"),
          style: "normal" as const,
          listItem: "number" as const,
          level: 1,
          markDefs: [],
          children: parseInlineFormatting(text),
        };
      }
      i++;
      continue;
    }

    const unorderedListMatch = line.match(/^(\s*)[-*+]\s+(.+)$/);
    if (unorderedListMatch) {
      const indentation = unorderedListMatch[1];
      const text = unorderedListMatch[2];
      const level = Math.floor(indentation.length / 2) + 1;

      if (!currentList || currentList.listItem !== "bullet") {
        if (currentList) {
          blocks.push(currentList);
        }

        currentList = {
          _type: "block" as const,
          _key: generateUniqueKey("block"),
          style: "normal" as const,
          listItem: "bullet" as const,
          level: level,
          markDefs: [],
          children: parseInlineFormatting(text),
        };
      } else {
        blocks.push(currentList);
        currentList = {
          _type: "block" as const,
          _key: generateUniqueKey("block"),
          style: "normal" as const,
          listItem: "bullet" as const,
          level: level,
          markDefs: [],
          children: parseInlineFormatting(text),
        };
      }
      i++;
      continue;
    }

    if (line && !line.match(/^(#{1,6}|>|\d+\.|[-*+]|\|)/)) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }

      blocks.push({
        _type: "block" as const,
        _key: generateUniqueKey("block"),
        style: "normal" as const,
        markDefs: [],
        children: parseInlineFormatting(line),
      });
    }

    i++;
  }

  if (currentList) {
    blocks.push(currentList);
  }

  return blocks;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function parseImportedNotes(jsonData: ImportedNotesData): {
  parsedNotes: Array<{
    topic: string;
    subject: string;
    content: PortableTextContent;
    originalId: string;
    timestamp: string;
  }>;
  stats: {
    totalItems: number;
    processedItems: number;
    skippedItems: number;
  };
} {
  globalKeyCounter = 0;

  const parsedNotes = [];
  let processedItems = 0;
  let skippedItems = 0;

  for (const item of jsonData.contentItems) {
    try {
      let cleanedContent = removeThinkingBlocks(item.content);

      cleanedContent = extractLatexFormulas(cleanedContent);

      if (!cleanedContent.trim()) {
        console.warn(`Skipping item ${item.id}: Empty content after cleaning`);
        skippedItems++;
        continue;
      }

      const portableTextContent = convertToPortableText(cleanedContent);

      parsedNotes.push({
        topic: item.topic,
        subject: item.subject,
        content: portableTextContent,
        originalId: item.id,
        timestamp: item.timestamp,
      });

      processedItems++;
    } catch (error) {
      console.error(`Error processing item ${item.id}:`, error);
      skippedItems++;
    }
  }

  return {
    parsedNotes,
    stats: {
      totalItems: jsonData.contentItems.length,
      processedItems,
      skippedItems,
    },
  };
}

export function createNoteDocument({
  parsedNote,
  manualFields,
}: {
  parsedNote: {
    topic: string;
    subject: string;
    content: PortableTextContent;
    originalId: string;
    timestamp: string;
  };
  manualFields: {
    title?: string;
    subject?: string;
    university: string;
    degree: string;
    year: string;
    semester: string;
    type: string;
    isPremium: boolean;
    tier?: string;
    syllabus?: string;
  };
}) {
  const title =
    manualFields.title ||
    `${parsedNote.topic} : ${manualFields.subject || parsedNote.subject}`;
  const subject = manualFields.subject || parsedNote.subject;

  return {
    _type: "note" as const,
    title: title,
    slug: {
      _type: "slug" as const,
      current: generateSlug(title),
    },
    syllabus: manualFields.syllabus || `${subject} - Notes`,
    university: manualFields.university,
    degree: manualFields.degree,
    year: manualFields.year,
    semester: manualFields.semester,
    subject: subject,
    type: manualFields.type,
    isPremium: manualFields.isPremium,
    tier: manualFields.isPremium ? manualFields.tier : undefined,
    content: parsedNote.content,
  };
}
