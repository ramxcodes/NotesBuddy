"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import { common, createLowlight } from "lowlight";
import { type Note } from "@/sanity/types";
import {
  TextB,
  TextItalic,
  TextStrikethrough,
  Code,
  TextHOne,
  TextHTwo,
  TextHThree,
  List,
  ListNumbers,
  Quotes,
  Table as TableIcon,
  Image as ImageIcon,
  ArrowCounterClockwise,
  ArrowClockwise,
  Calculator,
  Plus,
  Minus,
  Rows,
  Columns,
  X,
} from "@phosphor-icons/react";

const lowlight = createLowlight(common);

// Use the proper Sanity content type
type PortableTextContent = NonNullable<Note["content"]>;

interface SlashCommand {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: (editor: Editor) => void;
  keywords: string[];
}

interface Props {
  content: PortableTextContent;
  onChange: (content: PortableTextContent) => void;
  disabled?: boolean;
}

export default function PortableTextEditor({
  content,
  onChange,
  disabled = false,
}: Props) {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
  const [slashSearch, setSlashSearch] = useState("");
  const [showLatexModal, setShowLatexModal] = useState(false);
  const [latexFormula, setLatexFormula] = useState("");

  // Define slash commands inside component to access state
  const slashCommands: SlashCommand[] = useMemo(
    () => [
      {
        title: "Heading 1",
        description: "Large heading",
        icon: <TextHOne weight="duotone" className="h-4 w-4" />,
        command: (editor) =>
          editor.chain().focus().toggleHeading({ level: 1 }).run(),
        keywords: ["h1", "heading1", "title"],
      },
      {
        title: "Heading 2",
        description: "Medium heading",
        icon: <TextHTwo weight="duotone" className="h-4 w-4" />,
        command: (editor) =>
          editor.chain().focus().toggleHeading({ level: 2 }).run(),
        keywords: ["h2", "heading2", "subtitle"],
      },
      {
        title: "Heading 3",
        description: "Small heading",
        icon: <TextHThree weight="duotone" className="h-4 w-4" />,
        command: (editor) =>
          editor.chain().focus().toggleHeading({ level: 3 }).run(),
        keywords: ["h3", "heading3"],
      },
      {
        title: "Bullet List",
        description: "Unordered list",
        icon: <List weight="duotone" className="h-4 w-4" />,
        command: (editor) => editor.chain().focus().toggleBulletList().run(),
        keywords: ["ul", "list", "bullet"],
      },
      {
        title: "Numbered List",
        description: "Ordered list",
        icon: <ListNumbers weight="duotone" className="h-4 w-4" />,
        command: (editor) => editor.chain().focus().toggleOrderedList().run(),
        keywords: ["ol", "ordered", "numbered"],
      },
      {
        title: "Quote",
        description: "Blockquote",
        icon: <Quotes weight="duotone" className="h-4 w-4" />,
        command: (editor) => editor.chain().focus().toggleBlockquote().run(),
        keywords: ["quote", "blockquote"],
      },
      {
        title: "Code Block",
        description: "Code with syntax highlighting",
        icon: <Code weight="duotone" className="h-4 w-4" />,
        command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
        keywords: ["code", "codeblock", "pre"],
      },
      {
        title: "Table",
        description: "Insert a table",
        icon: <TableIcon weight="duotone" className="h-4 w-4" />,
        command: (editor) =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run(),
        keywords: ["table", "grid"],
      },
      {
        title: "Image",
        description: "Insert an image",
        icon: <ImageIcon weight="duotone" className="h-4 w-4" />,
        command: (editor) => {
          const url = window.prompt("Enter image URL:");
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        },
        keywords: ["image", "img", "picture"],
      },
      {
        title: "LaTeX",
        description: "Mathematical formula",
        icon: <Calculator weight="duotone" className="h-4 w-4" />,
        command: () => {
          setShowLatexModal(true);
        },
        keywords: ["latex", "math", "formula"],
      },
    ],
    [setShowLatexModal],
  );

  const [filteredCommands, setFilteredCommands] = useState(slashCommands);

  // Convert Portable Text to HTML for TipTap
  const convertPortableTextToHTML = useCallback(
    (blocks: PortableTextContent) => {
      if (!blocks || blocks.length === 0) return "";

      return blocks
        .map((block) => {
          switch (block._type) {
            case "block":
              if (block.style === "h1") {
                return `<h1>${block.children?.map((child) => child.text).join("") || ""}</h1>`;
              } else if (block.style === "h2") {
                return `<h2>${block.children?.map((child) => child.text).join("") || ""}</h2>`;
              } else if (block.style === "h3") {
                return `<h3>${block.children?.map((child) => child.text).join("") || ""}</h3>`;
              } else if (block.style === "blockquote") {
                return `<blockquote>${block.children?.map((child) => child.text).join("") || ""}</blockquote>`;
              } else {
                return `<p>${block.children?.map((child) => child.text).join("") || ""}</p>`;
              }
            case "code":
              return `<pre><code class="language-${block.language || "text"}">${block.code || ""}</code></pre>`;
            case "customImage":
              // For now, just return a placeholder since asset references are complex
              return `<img src="#" alt="${block.alt || ""}" />`;
            case "latex":
              return `<p>$$${block.body || ""}$$</p>`;
            default:
              return "<p></p>";
          }
        })
        .join("");
    },
    [],
  );

  // Convert HTML back to Portable Text
  const convertHTMLToPortableText = useCallback(
    (html: string): PortableTextContent => {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      const blocks: PortableTextContent = [];
      const children = Array.from(tempDiv.children);

      children.forEach((element, index) => {
        const tagName = element.tagName.toLowerCase();
        const text = element.textContent || "";

        if (tagName === "h1" || tagName === "h2" || tagName === "h3") {
          blocks.push({
            _key: `heading-${index}`,
            _type: "block",
            style: tagName as "h1" | "h2" | "h3",
            children: [{ _key: `span-${index}`, _type: "span", text }],
          });
        } else if (tagName === "blockquote") {
          blocks.push({
            _key: `quote-${index}`,
            _type: "block",
            style: "blockquote",
            children: [{ _key: `span-${index}`, _type: "span", text }],
          });
        } else if (tagName === "pre") {
          const code = element.querySelector("code");
          const language = code?.className.replace("language-", "") || "text";
          blocks.push({
            _key: `code-${index}`,
            _type: "code",
            language: (language || "text") as
              | "text"
              | "javascript"
              | "typescript"
              | "python",
            code: code?.textContent || "",
          });
        } else if (tagName === "img") {
          const img = element as HTMLImageElement;
          blocks.push({
            _key: `image-${index}`,
            _type: "customImage",
            asset: { _ref: "", _type: "reference" as const },
            alt: img.alt || "",
          });
        } else if (text.includes("$$")) {
          // LaTeX block
          const formula = text.replace(/\$\$/g, "");
          blocks.push({
            _key: `latex-${index}`,
            _type: "latex",
            body: formula,
          });
        } else {
          blocks.push({
            _key: `block-${index}`,
            _type: "block",
            style: "normal",
            children: [{ _key: `span-${index}`, _type: "span", text }],
          });
        }
      });

      return blocks;
    },
    [],
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "text",
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: convertPortableTextToHTML(content),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const portableText = convertHTMLToPortableText(html);
      onChange(portableText);
    },
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-lg max-w-none focus:outline-none min-h-[400px] p-4 [&_table]:border-collapse [&_table]:border-2 [&_table]:border-gray-300 [&_table]:dark:border-gray-600 [&_td]:border [&_td]:border-gray-300 [&_td]:dark:border-gray-600 [&_td]:p-2 [&_td]:min-w-[100px] [&_th]:border [&_th]:border-gray-300 [&_th]:dark:border-gray-600 [&_th]:p-2 [&_th]:bg-gray-100 [&_th]:dark:bg-black/20  [&_th]:font-bold",
        placeholder: "Type '/' for commands...",
      },
      handleKeyDown: (view, event) => {
        if (event.key === "/") {
          setTimeout(() => {
            setShowSlashMenu(true);
            setSlashSearch("");
            setFilteredCommands(slashCommands);

            // Get cursor position for menu placement relative to editor
            const { state } = view;
            const { from } = state.selection;
            const coords = view.coordsAtPos(from);
            const editorRect = view.dom.getBoundingClientRect();

            // Position relative to the editor container
            setSlashMenuPosition({
              x: coords.left - editorRect.left,
              y: coords.bottom - editorRect.top + 5, // Add small offset below cursor
            });
          }, 10);
        } else if (event.key === "Escape") {
          setShowSlashMenu(false);
        } else if (showSlashMenu && event.key !== "Backspace") {
          // Update search term for slash menu
          setTimeout(() => {
            const { state } = view;
            const { from, to } = state.selection;
            const text = state.doc.textBetween(from - 10, to, " ");
            const slashIndex = text.lastIndexOf("/");
            if (slashIndex !== -1) {
              const searchTerm = text.substring(slashIndex + 1);
              setSlashSearch(searchTerm);
            }
          }, 10);
        }
        return false;
      },
    },
  });

  // Filter slash commands based on search
  useEffect(() => {
    if (slashSearch) {
      const filtered = slashCommands.filter(
        (command) =>
          command.title.toLowerCase().includes(slashSearch.toLowerCase()) ||
          command.description
            .toLowerCase()
            .includes(slashSearch.toLowerCase()) ||
          command.keywords.some((keyword) =>
            keyword.toLowerCase().includes(slashSearch.toLowerCase()),
          ),
      );
      setFilteredCommands(filtered);
    } else {
      setFilteredCommands(slashCommands);
    }
  }, [slashSearch, slashCommands]);

  const handleSlashCommand = useCallback(
    (command: SlashCommand) => {
      if (editor) {
        // Remove the "/" character and any typed text
        const { from } = editor.state.selection;
        const { state } = editor;
        const text = state.doc.textBetween(from - 10, from, " ");
        const slashIndex = text.lastIndexOf("/");
        if (slashIndex !== -1) {
          const deleteFrom = from - (text.length - slashIndex);
          editor
            .chain()
            .focus()
            .deleteRange({ from: deleteFrom, to: from })
            .run();
        }

        // Execute the command
        command.command(editor);
        setShowSlashMenu(false);
      }
    },
    [editor],
  );

  // Close slash menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSlashMenu(false);
    };

    if (showSlashMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showSlashMenu]);

  // LaTeX modal handlers
  const handleLatexInsert = useCallback(() => {
    if (editor && latexFormula.trim()) {
      editor
        .chain()
        .focus()
        .insertContent(`<p>$$${latexFormula.trim()}$$</p>`)
        .run();
      setLatexFormula("");
      setShowLatexModal(false);
    }
  }, [editor, latexFormula]);

  const handleLatexCancel = useCallback(() => {
    setLatexFormula("");
    setShowLatexModal(false);
  }, []);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div
      className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700"
      data-lenis-prevent
    >
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 p-2 dark:border-gray-700">
        {/* Text formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled}
          className={`rounded-md p-2 disabled:opacity-50 dark:hover:bg-gray-700 ${
            editor.isActive("bold") ? "" : ""
          }`}
          title="Bold"
        >
          <TextB weight="duotone" className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled}
          className={`rounded-md p-2 disabled:opacity-50 dark:hover:bg-gray-700 ${
            editor.isActive("italic") ? "" : ""
          }`}
          title="Italic"
        >
          <TextItalic weight="duotone" className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={disabled}
          className={`rounded-md p-2 disabled:opacity-50 dark:hover:bg-gray-700 ${
            editor.isActive("strike") ? "" : ""
          }`}
          title="Strikethrough"
        >
          <TextStrikethrough weight="duotone" className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={disabled}
          className={`rounded-md p-2 disabled:opacity-50 dark:hover:bg-gray-700 ${
            editor.isActive("code") ? "" : ""
          }`}
          title="Inline Code"
        >
          <Code weight="duotone" className="h-4 w-4" />
        </button>

        <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />

        {/* Headings */}
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          disabled={disabled}
          className={`rounded-md p-2 disabled:opacity-50 dark:hover:bg-gray-700 ${
            editor.isActive("heading", { level: 1 }) ? "" : ""
          }`}
          title="Heading 1"
        >
          <TextHOne weight="duotone" className="h-4 w-4" />
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          disabled={disabled}
          className={`rounded-md p-2 disabled:opacity-50 dark:hover:bg-gray-700 ${
            editor.isActive("heading", { level: 2 }) ? "" : ""
          }`}
          title="Heading 2"
        >
          <TextHTwo weight="duotone" className="h-4 w-4" />
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          disabled={disabled}
          className={`rounded-md p-2 disabled:opacity-50 dark:hover:bg-gray-700 ${
            editor.isActive("heading", { level: 3 }) ? "" : ""
          }`}
          title="Heading 3"
        >
          <TextHThree weight="duotone" className="h-4 w-4" />
        </button>

        <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          className={`rounded-md p-2 disabled:opacity-50 dark:hover:bg-gray-700 ${
            editor.isActive("bulletList") ? "" : ""
          }`}
          title="Bullet List"
        >
          <List weight="duotone" className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
          className={`rounded-md p-2 disabled:opacity-50 dark:hover:bg-gray-700 ${
            editor.isActive("orderedList") ? "" : ""
          }`}
          title="Numbered List"
        >
          <ListNumbers weight="duotone" className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={disabled}
          className={`rounded-md p-2 disabled:opacity-50 dark:hover:bg-gray-700 ${
            editor.isActive("blockquote") ? "" : ""
          }`}
          title="Quote"
        >
          <Quotes weight="duotone" className="h-4 w-4" />
        </button>

        <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />

        {/* Code block */}
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          disabled={disabled}
          className={`rounded-md p-2 disabled:opacity-50 dark:hover:bg-gray-700 ${
            editor.isActive("codeBlock") ? "" : ""
          }`}
          title="Code Block"
        >
          <Code weight="duotone" className="h-4 w-4" />
        </button>

        {/* Table */}
        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          disabled={disabled}
          className="rounded-md p-2 disabled:opacity-50 dark:hover:bg-gray-700"
          title="Insert Table"
        >
          <TableIcon weight="duotone" className="h-4 w-4" />
        </button>

        {editor?.isActive("table") && (
          <>
            <button
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              disabled={disabled}
              className="flex items-center gap-1 rounded-md p-2 disabled:opacity-50 dark:hover:bg-gray-700"
              title="Add Column"
            >
              <Plus weight="duotone" className="h-3 w-3" />
              <Columns weight="duotone" className="h-3 w-3" />
            </button>
            <button
              onClick={() => editor.chain().focus().deleteColumn().run()}
              disabled={disabled}
              className="flex items-center gap-1 rounded-md p-2 disabled:opacity-50 dark:hover:bg-gray-700"
              title="Delete Column"
            >
              <Minus weight="duotone" className="h-3 w-3" />
              <Columns weight="duotone" className="h-3 w-3" />
            </button>
            <button
              onClick={() => editor.chain().focus().addRowAfter().run()}
              disabled={disabled}
              className="flex items-center gap-1 rounded-md p-2 disabled:opacity-50 dark:hover:bg-gray-700"
              title="Add Row"
            >
              <Plus weight="duotone" className="h-3 w-3" />
              <Rows weight="duotone" className="h-3 w-3" />
            </button>
            <button
              onClick={() => editor.chain().focus().deleteRow().run()}
              disabled={disabled}
              className="flex items-center gap-1 rounded-md p-2 disabled:opacity-50 dark:hover:bg-gray-700"
              title="Delete Row"
            >
              <Minus weight="duotone" className="h-3 w-3" />
              <Rows weight="duotone" className="h-3 w-3" />
            </button>
            <button
              onClick={() => editor.chain().focus().deleteTable().run()}
              disabled={disabled}
              className="rounded-md p-2 text-red-600 hover:bg-red-200 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900"
              title="Delete Table"
            >
              <X weight="duotone" className="h-4 w-4" />
            </button>
          </>
        )}

        <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />

        {/* Image */}
        <button
          onClick={() => {
            const url = window.prompt("Enter image URL:");
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          disabled={disabled}
          className="rounded-md p-2 disabled:opacity-50 dark:hover:bg-gray-700"
          title="Insert Image"
        >
          <ImageIcon weight="duotone" className="h-4 w-4" />
        </button>

        {/* LaTeX */}
        <button
          onClick={() => setShowLatexModal(true)}
          disabled={disabled}
          className="rounded-md p-2 disabled:opacity-50"
          title="Insert LaTeX"
        >
          <Calculator weight="duotone" className="h-4 w-4" />
        </button>

        <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" />

        {/* Undo/Redo */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo() || disabled}
          className="rounded-md p-2 disabled:opacity-50 dark:hover:bg-gray-700"
          title="Undo"
        >
          <ArrowCounterClockwise weight="duotone" className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo() || disabled}
          className="rounded-md p-2 disabled:opacity-50 dark:hover:bg-gray-700"
          title="Redo"
        >
          <ArrowClockwise weight="duotone" className="h-4 w-4" />
        </button>
      </div>

      {/* Editor */}
      <div className="relative">
        <EditorContent editor={editor} />

        {/* Slash Command Menu */}
        {showSlashMenu && !disabled && (
          <div
            className="absolute z-50 max-h-64 w-64 overflow-y-auto rounded-md border border-gray-200 shadow-lg dark:border-gray-700"
            style={{
              left: slashMenuPosition.x,
              top: slashMenuPosition.y,
            }}
          >
            <div className="border-b border-gray-200 p-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
              Slash Commands
            </div>
            {filteredCommands.map((command) => (
              <button
                key={command.title}
                onClick={() => handleSlashCommand(command)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {command.icon}
                <div>
                  <div className="text-sm font-medium">{command.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {command.description}
                  </div>
                </div>
              </button>
            ))}
            {filteredCommands.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No commands found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Help text */}
      <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
        Type{" "}
        <kbd className="rounded-md bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-700">
          /
        </kbd>{" "}
        for commands • Rich copy-paste supported • Keyboard shortcuts:{" "}
        <kbd className="rounded-md bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-700">
          Ctrl+B
        </kbd>{" "}
        bold,{" "}
        <kbd className="rounded-md bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-700">
          Ctrl+I
        </kbd>{" "}
        italic
      </div>

      {/* LaTeX Modal */}
      {showLatexModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="dark:border-white-20 dark:bg-background mx-4 w-full max-w-md rounded-md border-4 border-black bg-white p-6">
            <h3 className="mb-4 text-lg font-black uppercase">
              Insert LaTeX Formula
            </h3>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-bold uppercase">
                Formula
              </label>
              <textarea
                value={latexFormula}
                onChange={(e) => setLatexFormula(e.target.value)}
                placeholder="Enter LaTeX formula (e.g., E = mc^2, \sum_{i=1}^{n} x_i)"
                className="dark:border-white-20 dark:bg-background w-full rounded-md border-2 border-black bg-white px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-black focus:outline-none dark:text-white dark:focus:ring-white"
                rows={4}
                autoFocus
              />
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                Examples: x^2, \frac{"{a}"}
                {"{b}"}, \sqrt{"{x}"}, \sum_{"{i=1}"}^{"{n}"} x_i
              </p>
            </div>
            {latexFormula.trim() && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-bold uppercase">
                  Preview
                </label>
                <div className="rounded-md border-2 border-gray-300 bg-gray-50 p-3 text-center dark:border-gray-600">
                  <code className="text-sm">$${latexFormula}$$</code>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleLatexCancel}
                className="dark:border-white-20 dark:bg-background flex-1 rounded-md border-2 border-black bg-white px-4 py-2 text-sm font-bold uppercase hover:bg-gray-100 dark:text-white dark:hover:bg-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleLatexInsert}
                disabled={!latexFormula.trim()}
                className="dark: dark: flex-1 rounded-md bg-black px-4 py-2 text-sm font-bold text-white uppercase disabled:opacity-50 dark:text-white"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
