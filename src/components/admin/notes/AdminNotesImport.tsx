"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  FileJs as FileJson,
  ArrowLeft,
  Download,
  Spinner as Loader2,
  Warning as AlertCircle,
  X,
  NotebookIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { parseImportedNotes } from "@/lib/notes-parser";
import { importNotesAction } from "../actions/admin-notes";
import { type Note } from "@/sanity/types";

type PortableTextContent = NonNullable<Note["content"]>;

interface ParsedNote {
  topic: string;
  subject: string;
  content: PortableTextContent;
  originalId: string;
  timestamp: string;
}

interface ImportStats {
  totalItems: number;
  processedItems: number;
  skippedItems: number;
}

export default function AdminNotesImport() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<{
    parsedNotes: ParsedNote[];
    stats: ImportStats;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const [manualFields, setManualFields] = useState({
    title: "",
    syllabus: "",
    university: "",
    degree: "",
    year: "",
    semester: "",
    type: "NOTES",
    isPremium: false,
    tier: "TIER_2",
  });

  const parseFile = useCallback(async (uploadedFile: File) => {
    setIsProcessing(true);
    try {
      const text = await uploadedFile.text();
      const jsonData = JSON.parse(text);

      if (!jsonData.contentItems || !Array.isArray(jsonData.contentItems)) {
        throw new Error("Invalid JSON format. Expected 'contentItems' array.");
      }

      const result = parseImportedNotes(jsonData);
      setParsedData(result);

      toast.success(
        `Parsed ${result.stats.processedItems} topics successfully`,
      );
    } catch (error) {
      console.error("Error parsing file:", error);
      toast.error("Failed to parse JSON file. Please check the format.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = Array.from(e.dataTransfer.files);
      if (files && files[0]) {
        const selectedFile = files[0];
        if (selectedFile.type === "application/json") {
          setFile(selectedFile);
          parseFile(selectedFile);
        } else {
          toast.error("Please upload a JSON file");
        }
      }
    },
    [parseFile],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/json") {
        setFile(selectedFile);
        parseFile(selectedFile);
      } else {
        toast.error("Please upload a JSON file");
      }
    }
  };

  const importNote = async () => {
    if (!parsedData || parsedData.parsedNotes.length === 0) return;

    if (
      !manualFields.title ||
      !manualFields.syllabus ||
      !manualFields.university ||
      !manualFields.degree ||
      !manualFields.year ||
      !manualFields.semester ||
      !manualFields.type
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    try {
      const combinedContent: PortableTextContent = [];

      parsedData.parsedNotes.forEach((note, index) => {
        combinedContent.push(...note.content);

        if (index < parsedData.parsedNotes.length - 1) {
          combinedContent.push({
            _type: "block" as const,
            _key: `spacer-${index}`,
            style: "normal" as const,
            markDefs: [],
            children: [
              {
                _type: "span" as const,
                _key: `span-spacer-${index}`,
                text: "",
                marks: [],
              },
            ],
          });
        }
      });

      const firstNote = parsedData.parsedNotes[0];
      const noteTitle = manualFields.title;
      const noteSubject = firstNote.subject;

      const combinedNote = {
        topic: noteTitle,
        subject: noteSubject,
        content: combinedContent,
        originalId: `combined-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };

      await importNotesAction({
        parsedNote: combinedNote,
        manualFields: {
          ...manualFields,
          title: noteTitle,
          subject: noteSubject,
        },
      });

      setImportProgress(100);
      toast.success("Successfully imported note with all topics!");

      setFile(null);
      setParsedData(null);
      setImportProgress(0);
    } catch (error) {
      console.error("Import failed:", error);
      toast.error("Failed to import note");
    } finally {
      setIsImporting(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setParsedData(null);
    setImportProgress(0);
  };

  const renderFullContentPreview = (content: PortableTextContent) => {
    if (!content || !Array.isArray(content)) return "No content";

    return content.map((block, index: number) => {
      if (
        block._type === "block" &&
        "children" in block &&
        Array.isArray(block.children)
      ) {
        const renderChildren = () => {
          return (
            block.children as Array<{
              text?: string;
              marks?: string[];
              _key?: string;
            }>
          ).map((child, childIndex: number) => {
            const childText = child.text || "";
            const marks = child.marks || [];
            const key = child._key || `child-${childIndex}`;

            if (marks.includes("strong") && marks.includes("em")) {
              return (
                <strong key={key}>
                  <em>{childText}</em>
                </strong>
              );
            } else if (marks.includes("strong")) {
              return <strong key={key}>{childText}</strong>;
            } else if (marks.includes("em")) {
              return <em key={key}>{childText}</em>;
            } else if (marks.includes("code")) {
              return (
                <code
                  key={key}
                  className="rounded bg-gray-100 px-1 text-sm dark:bg-gray-800"
                >
                  {childText}
                </code>
              );
            }
            return <span key={key}>{childText}</span>;
          });
        };

        const style = "style" in block ? block.style : "normal";

        if (style === "h1") {
          return (
            <h1
              key={index}
              className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100"
            >
              {renderChildren()}
            </h1>
          );
        } else if (style === "h2") {
          return (
            <h2
              key={index}
              className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100"
            >
              {renderChildren()}
            </h2>
          );
        } else if (style === "h3") {
          return (
            <h3
              key={index}
              className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              {renderChildren()}
            </h3>
          );
        } else if (style === "blockquote") {
          return (
            <blockquote
              key={index}
              className="mb-3 border-l-4 border-gray-300 pl-4 text-gray-700 italic dark:text-gray-300"
            >
              {renderChildren()}
            </blockquote>
          );
        } else {
          const listItem = "listItem" in block ? block.listItem : null;
          if (listItem === "bullet") {
            return (
              <li
                key={index}
                className="mb-1 ml-4 list-disc text-gray-700 dark:text-gray-300"
              >
                {renderChildren()}
              </li>
            );
          } else if (listItem === "number") {
            return (
              <li
                key={index}
                className="mb-1 ml-4 list-decimal text-gray-700 dark:text-gray-300"
              >
                {renderChildren()}
              </li>
            );
          } else {
            return (
              <p
                key={index}
                className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300"
              >
                {renderChildren()}
              </p>
            );
          }
        }
      } else if (block._type === "latex") {
        const body =
          "body" in block && typeof block.body === "string" ? block.body : "";
        return (
          <div
            key={index}
            className="mb-4 rounded bg-blue-50 p-3 dark:bg-blue-900/20"
          >
            <div className="mb-1 text-xs text-blue-600 dark:text-blue-400">
              LaTeX Formula:
            </div>
            <code className="font-mono text-sm">{body}</code>
          </div>
        );
      } else if (block._type === "code") {
        const language =
          "language" in block && typeof block.language === "string"
            ? block.language
            : "text";
        const code =
          "code" in block && typeof block.code === "string" ? block.code : "";
        return (
          <div
            key={index}
            className="mb-4 rounded bg-gray-100 p-3 dark:bg-gray-800"
          >
            <div className="mb-1 text-xs text-gray-600 dark:text-gray-400">
              Code ({language}):
            </div>
            <pre className="font-mono text-sm whitespace-pre-wrap">
              <code>{code}</code>
            </pre>
          </div>
        );
      } else if (block._type === "table") {
        return (
          <div key={index} className="mb-4 overflow-x-auto">
            <div className="mb-1 text-xs text-gray-600 dark:text-gray-400">
              Table:
            </div>
            <table className="min-w-full border border-gray-300 dark:border-gray-600">
              <tbody>
                {"rows" in block &&
                  Array.isArray(block.rows) &&
                  block.rows.map(
                    (row: { cells?: string[] }, rowIndex: number) => (
                      <tr
                        key={rowIndex}
                        className="border-b border-gray-200 dark:border-gray-700"
                      >
                        {Array.isArray(row.cells) &&
                          row.cells.map((cell: string, cellIndex: number) => (
                            <td
                              key={cellIndex}
                              className="border-r border-gray-200 px-2 py-1 text-sm dark:border-gray-700"
                            >
                              {cell}
                            </td>
                          ))}
                      </tr>
                    ),
                  )}
              </tbody>
            </table>
          </div>
        );
      }
      return null;
    });
  };

  return (
    <div className="space-y-6" data-lenis-prevent>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => router.push("/admin/notes")}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-excon flex items-center gap-3 text-3xl font-black text-black dark:text-white">
              <NotebookIcon weight="duotone" className="h-8 w-8" />
              Import Notes
            </h1>
          </div>
          <p className="font-satoshi ml-14 text-lg font-bold text-black/70 dark:text-white/70">
            Import a single note unit from JSON file - all contentItems will be
            combined into one note
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card className="neuro">
            <CardHeader>
              <CardTitle className="font-excon text-xl font-black">
                Upload JSON File
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!file ? (
                <div
                  className={`neuro-sm rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                    dragActive
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <FileJson className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="mb-2 text-lg font-semibold">
                    Drag and drop your JSON file here
                  </p>
                  <p className="mb-4 text-gray-500">or</p>
                  <label className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <span>
                        <Upload weight="duotone" className="mr-2 h-4 w-4" />
                        Choose File
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileJson className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-semibold">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={resetState}
                      className="neuro-sm font-satoshi font-bold"
                    >
                      <X className="h-4 w-4" /> Remove File
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="neuro">
            <CardHeader>
              <CardTitle className="font-excon text-xl font-black">
                Note Details (Required)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                  Title *
                </Label>
                <Input
                  value={manualFields.title}
                  onChange={(e) =>
                    setManualFields((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Enter note title"
                  className="neuro-sm font-satoshi font-bold"
                  required
                />
              </div>

              <div>
                <Label className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                  Syllabus *
                </Label>
                <Input
                  value={manualFields.syllabus}
                  onChange={(e) =>
                    setManualFields((prev) => ({
                      ...prev,
                      syllabus: e.target.value,
                    }))
                  }
                  placeholder="Enter syllabus description"
                  className="neuro-sm font-satoshi font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                    University *
                  </Label>
                  <Select
                    value={manualFields.university}
                    onValueChange={(value) =>
                      setManualFields((prev) => ({
                        ...prev,
                        university: value,
                      }))
                    }
                    required
                  >
                    <SelectTrigger className="neuro-sm font-satoshi font-bold">
                      <SelectValue placeholder="Select University" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medicaps">
                        Medicaps University
                      </SelectItem>
                      <SelectItem value="ips">IPS University</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                    Degree *
                  </Label>
                  <Select
                    value={manualFields.degree}
                    onValueChange={(value) =>
                      setManualFields((prev) => ({ ...prev, degree: value }))
                    }
                    required
                  >
                    <SelectTrigger className="neuro-sm font-satoshi font-bold">
                      <SelectValue placeholder="Select Degree" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="btech-cse">B.Tech CSE</SelectItem>
                      <SelectItem value="btech-it">B.Tech IT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                    Year *
                  </Label>
                  <Select
                    value={manualFields.year}
                    onValueChange={(value) =>
                      setManualFields((prev) => ({ ...prev, year: value }))
                    }
                    required
                  >
                    <SelectTrigger className="neuro-sm font-satoshi font-bold">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st-year">1st Year</SelectItem>
                      <SelectItem value="2nd-year">2nd Year</SelectItem>
                      <SelectItem value="3rd-year">3rd Year</SelectItem>
                      <SelectItem value="4th-year">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                    Semester *
                  </Label>
                  <Select
                    value={manualFields.semester}
                    onValueChange={(value) =>
                      setManualFields((prev) => ({ ...prev, semester: value }))
                    }
                    required
                  >
                    <SelectTrigger className="neuro-sm font-satoshi font-bold">
                      <SelectValue placeholder="Select Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st-semester">1st Semester</SelectItem>
                      <SelectItem value="2nd-semester">2nd Semester</SelectItem>
                      <SelectItem value="3rd-semester">3rd Semester</SelectItem>
                      <SelectItem value="4th-semester">4th Semester</SelectItem>
                      <SelectItem value="5th-semester">5th Semester</SelectItem>
                      <SelectItem value="6th-semester">6th Semester</SelectItem>
                      <SelectItem value="7th-semester">7th Semester</SelectItem>
                      <SelectItem value="8th-semester">8th Semester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70">
                  Type *
                </Label>
                <Select
                  value={manualFields.type}
                  onValueChange={(value) =>
                    setManualFields((prev) => ({ ...prev, type: value }))
                  }
                  required
                >
                  <SelectTrigger className="neuro-sm font-satoshi font-bold">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOTES">Notes</SelectItem>
                    <SelectItem value="MST">MST</SelectItem>
                    <SelectItem value="PYQ">PYQ</SelectItem>
                    <SelectItem value="ONE-SHOT">One-Shot</SelectItem>
                    <SelectItem value="VIDEO-MATERIAL">
                      Video Material
                    </SelectItem>
                    <SelectItem value="HANDWRITTEN-NOTES">
                      Handwritten Notes
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPremium"
                    checked={manualFields.isPremium}
                    onCheckedChange={(checked) =>
                      setManualFields((prev) => ({
                        ...prev,
                        isPremium: checked as boolean,
                      }))
                    }
                  />
                  <Label
                    htmlFor="isPremium"
                    className="font-satoshi text-sm font-bold text-black/70 dark:text-white/70"
                  >
                    Premium Content
                  </Label>
                </div>

                {manualFields.isPremium && (
                  <div>
                    <Select
                      value={manualFields.tier}
                      onValueChange={(value) =>
                        setManualFields((prev) => ({ ...prev, tier: value }))
                      }
                    >
                      <SelectTrigger className="neuro-sm font-satoshi w-32 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TIER_1">Tier 1</SelectItem>
                        <SelectItem value="TIER_2">Tier 2</SelectItem>
                        <SelectItem value="TIER_3">Tier 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="mt-2 text-xs text-gray-500">
                * Required fields | Slug will be auto-generated from title
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview and Import */}
        <div className="space-y-6 lg:col-span-2">
          {parsedData && (
            <>
              {parsedData.stats.skippedItems > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {parsedData.stats.skippedItems} items were skipped due to
                    empty content after cleaning.
                  </AlertDescription>
                </Alert>
              )}

              {/* Single Note Preview */}
              <Card className="neuro">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-excon text-xl font-black">
                    Note Preview ({parsedData.parsedNotes.length} topics
                    combined)
                  </CardTitle>
                  {!isImporting && (
                    <Button
                      onClick={importNote}
                      disabled={parsedData.parsedNotes.length === 0}
                      className="neuro-button font-satoshi font-black"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Import Note
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {isImporting ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Importing Note...</h3>
                        <span className="text-sm text-gray-500">
                          {Math.round(importProgress)}%
                        </span>
                      </div>
                      <Progress value={importProgress} className="w-full" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Final Note Preview */}
                      <div className="rounded border-l-4 border-l-green-500 bg-green-50 p-4 dark:bg-green-900/20">
                        <h4 className="mb-2 text-lg font-semibold">
                          Final Note: &quot;
                          {manualFields.title || "Enter title above"}
                          &quot;
                        </h4>
                        <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                          Subject: {parsedData.parsedNotes[0]?.subject} |
                          University:{" "}
                          {manualFields.university || "Select university"} |
                          Year: {manualFields.year || "Select year"} | Semester:{" "}
                          {manualFields.semester || "Select semester"}
                        </p>
                        <p className="text-xs text-gray-500">
                          This note will contain all{" "}
                          {parsedData.parsedNotes.length} topics with their
                          content combined.
                        </p>
                      </div>

                      {/* Full Content Preview */}
                      <Card className="neuro-sm">
                        <CardHeader>
                          <CardTitle className="font-excon text-lg font-black">
                            Complete Note Content Preview
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-96">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              {parsedData.parsedNotes.map((note, index) => (
                                <div key={index} className="mb-8">
                                  {/* Topic heading */}
                                  <h2 className="mb-4 border-b border-gray-200 pb-2 text-xl font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100">
                                    {note.topic}
                                  </h2>
                                  {/* Full content */}
                                  <div className="space-y-2">
                                    {renderFullContentPreview(note.content)}
                                  </div>
                                  {/* Separator between topics */}
                                  {index <
                                    parsedData.parsedNotes.length - 1 && (
                                    <hr className="my-8 border-gray-300 dark:border-gray-600" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {!parsedData && file && isProcessing && (
            <Card className="neuro flex h-96 items-center justify-center">
              <CardContent className="text-center">
                <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-gray-400" />
                <h3 className="font-excon mb-2 text-lg font-black">
                  Parsing JSON File...
                </h3>
                <p className="font-satoshi mb-4 font-bold text-gray-500">
                  Analyzing and converting content to portable text format
                </p>
              </CardContent>
            </Card>
          )}

          {!file && (
            <Card className="neuro flex h-96 items-center justify-center">
              <CardContent className="text-center">
                <Upload className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="font-excon mb-2 text-lg font-black">
                  Upload JSON File
                </h3>
                <p className="font-satoshi font-bold text-gray-500">
                  Select a JSON file containing contentItems to get started
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
