"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  getUniversities,
  getDegreesByUniversity,
  getYearsByUniversityAndDegree,
  getSemestersByUniversityDegreeAndYear,
} from "@/utils/academic-config";
import {
  bulkImportQuizzesAction,
  type BulkQuizImportData,
  type BulkQuizImportResult,
} from "@/components/admin/actions/admin-quizzes";
import {
  University,
  Degree,
  Year,
  Semester,
  PremiumTier,
} from "@prisma/client";
import {
  CheckCircleIcon,
  XCircleIcon,
  WarningIcon,
  ClockIcon,
  UploadIcon,
  CodeIcon,
  FileTextIcon,
  PlusCircleIcon,
  CloudArrowUpIcon,
} from "@phosphor-icons/react";

export default function BulkQuizImport() {
  const router = useRouter();

  // Form state
  const [university, setUniversity] = useState<University | "">("");
  const [degree, setDegree] = useState<Degree | "">("");
  const [year, setYear] = useState<Year | "">("");
  const [semester, setSemester] = useState<Semester | "">("");
  const [unitNumber, setUnitNumber] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [parsedQuizData, setParsedQuizData] =
    useState<BulkQuizImportData | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [requiredTier, setRequiredTier] = useState<PremiumTier | "">("");
  const [isPublished, setIsPublished] = useState(true);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<BulkQuizImportResult | null>(
    null,
  );
  const [isDragOver, setIsDragOver] = useState(false);

  // Academic field options
  const universities = getUniversities();
  const degrees = university ? getDegreesByUniversity(university) : [];
  const years =
    university && degree
      ? getYearsByUniversityAndDegree(university, degree)
      : [];
  const semesters =
    university && degree && year
      ? getSemestersByUniversityDegreeAndYear(university, degree, year)
      : [];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    processFile(file);
  };

  const processFile = (file: File | null | undefined) => {
    if (!file) return;

    if (file.type !== "application/json") {
      setError("Please upload a valid JSON file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        setJsonInput(content);

        // Try to parse the JSON and set parsed data
        try {
          const parsed = JSON.parse(content);
          if (validateJsonData(parsed)) {
            setParsedQuizData(parsed);
          } else {
            setParsedQuizData(null);
          }
        } catch {
          setParsedQuizData(null);
        }

        setError("");
      } catch {
        setError("Failed to read file");
        setParsedQuizData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleJsonInputChange = (value: string) => {
    setJsonInput(value);

    // Try to parse the JSON and set parsed data
    if (value.trim()) {
      try {
        const parsed = JSON.parse(value);
        if (validateJsonData(parsed)) {
          setParsedQuizData(parsed);
          setError("");
        } else {
          setParsedQuizData(null);
        }
      } catch {
        setParsedQuizData(null);
      }
    } else {
      setParsedQuizData(null);
    }
  };

  const validateJsonData = (data: unknown): data is BulkQuizImportData => {
    if (!data || typeof data !== "object") {
      setError("Invalid JSON format");
      return false;
    }

    const typedData = data as Record<string, unknown>;

    if (!typedData.quizSets || !Array.isArray(typedData.quizSets)) {
      setError("JSON must contain a 'quizSets' array");
      return false;
    }

    for (const quizSet of typedData.quizSets) {
      if (!quizSet.subject || !quizSet.topic || !quizSet.questions) {
        setError("Each quiz set must have subject, topic, and questions");
        return false;
      }

      if (!Array.isArray(quizSet.questions)) {
        setError("Questions must be an array");
        return false;
      }

      for (const question of quizSet.questions) {
        if (
          !question.question ||
          !question.options ||
          !Array.isArray(question.options)
        ) {
          setError("Each question must have question text and options array");
          return false;
        }

        const hasCorrectAnswer = question.options.some(
          (option: { isCorrect: boolean }) => option.isCorrect === true,
        );
        if (!hasCorrectAnswer) {
          setError("Each question must have at least one correct answer");
          return false;
        }
      }
    }

    return true;
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      setError("");
      setProgress(0);
      setImportResult(null);

      // Validate required fields
      if (!university || !degree || !year || !semester) {
        setError("Please select all academic fields");
        return;
      }

      if (!jsonInput.trim()) {
        setError("Please provide JSON data");
        return;
      }

      // Parse and validate JSON
      let jsonData: BulkQuizImportData;
      try {
        jsonData = JSON.parse(jsonInput);
      } catch {
        setError("Invalid JSON format");
        return;
      }

      if (!validateJsonData(jsonData)) {
        return;
      }

      setProgress(20);

      // Call the import action
      const result = await bulkImportQuizzesAction({
        jsonData,
        university,
        degree,
        year,
        semester,
        unitNumber: unitNumber || undefined,
        isPremium,
        requiredTier: requiredTier || undefined,
        isPublished,
      });

      setProgress(100);
      setImportResult(result);

      if (result.success) {
        // Clear form if successful
        setJsonInput("");
        setParsedQuizData(null);
        setIsPremium(false);
        setRequiredTier("");
        setIsPublished(true);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Bulk Quiz Import
          </h1>
          <p className="text-muted-foreground">
            Import multiple quiz sets from JSON data
          </p>
        </div>

        {/* Import Results */}
        {importResult && !importResult.success && (
          <Alert className="mb-6 border-2 border-red-500 bg-red-50 shadow-[4px_4px_0px_0px_#ef4444] dark:border-red-400 dark:bg-red-950 dark:shadow-[4px_4px_0px_0px_#ef4444]">
            <XCircleIcon className="h-4 w-4" />
            <AlertTitle>Import Failed</AlertTitle>
            <AlertDescription>{importResult.error}</AlertDescription>
          </Alert>
        )}

        {importResult && importResult.success && importResult.results && (
          <Card className="mb-6 border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5" />
                Import Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {importResult.results.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between rounded-lg border-2 p-3 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#757373] ${
                      result.success
                        ? "border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-950"
                        : "border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-950"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {result.success ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                      <div>
                        <p className="font-medium">
                          {result.success
                            ? result.title
                            : `${result.subject} - ${result.topic}`}
                        </p>
                        {result.success ? (
                          <p className="text-muted-foreground text-sm">
                            {result.questionCount} questions imported
                          </p>
                        ) : (
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {result.error}
                          </p>
                        )}
                      </div>
                    </div>
                    {result.success && result.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:hover:shadow-[3px_3px_0px_0px_#757373]"
                        onClick={() => router.push(`/admin/quiz/${result.id}`)}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Import Form */}
        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:shadow-[4px_4px_0px_0px_#757373]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadIcon className="h-5 w-5" />
              Quiz Import
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Academic Fields */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* University */}
              <div className="flex flex-col space-y-2">
                <Label htmlFor="university">University</Label>
                <Select
                  value={university}
                  onValueChange={(value) => {
                    setUniversity(value as University);
                    setDegree("");
                    setYear("");
                    setSemester("");
                  }}
                >
                  <SelectTrigger className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[3px_3px_0px_0px_#000] disabled:opacity-50 dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:focus:shadow-[3px_3px_0px_0px_#757373]">
                    <SelectValue placeholder="Select University" />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
                    {universities.map((uni) => (
                      <SelectItem key={uni.value} value={uni.prismaValue}>
                        {uni.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Degree */}
              <div className="flex flex-col space-y-2">
                <Label htmlFor="degree">Degree</Label>
                <Select
                  value={degree}
                  onValueChange={(value) => {
                    setDegree(value as Degree);
                    setYear("");
                    setSemester("");
                  }}
                  disabled={!university}
                >
                  <SelectTrigger className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[3px_3px_0px_0px_#000] disabled:opacity-50 dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:focus:shadow-[3px_3px_0px_0px_#757373]">
                    <SelectValue placeholder="Select Degree" />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
                    {degrees.map((deg) => (
                      <SelectItem key={deg.value} value={deg.prismaValue}>
                        {deg.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year */}
              <div className="flex flex-col space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select
                  value={year}
                  onValueChange={(value) => {
                    setYear(value as Year);
                    setSemester("");
                  }}
                  disabled={!degree}
                >
                  <SelectTrigger className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[3px_3px_0px_0px_#000] disabled:opacity-50 dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:focus:shadow-[3px_3px_0px_0px_#757373]">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
                    {years.map((yr) => (
                      <SelectItem key={yr.value} value={yr.prismaValue}>
                        {yr.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Semester */}
              <div className="flex flex-col space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={semester}
                  onValueChange={(value) => setSemester(value as Semester)}
                  disabled={!year}
                >
                  <SelectTrigger className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[3px_3px_0px_0px_#000] disabled:opacity-50 dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:focus:shadow-[3px_3px_0px_0px_#757373]">
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
                    {semesters.map((sem) => (
                      <SelectItem key={sem.value} value={sem.prismaValue}>
                        {sem.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Unit Number (Optional) */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="unitNumber">Unit Number (Optional)</Label>
              <Input
                id="unitNumber"
                type="number"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                placeholder="e.g., 1 for Unit 1: Subject"
                className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:focus:shadow-[3px_3px_0px_0px_#757373]"
              />
            </div>

            {/* Premium Settings */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                Premium Settings
              </Label>

              {/* Is Premium Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPremium"
                  checked={isPremium}
                  onCheckedChange={(checked) => {
                    setIsPremium(checked === true);
                    if (!checked) {
                      setRequiredTier("");
                    }
                  }}
                  className="border-2 border-black data-[state=checked]:bg-black data-[state=checked]:text-white dark:border-white/20 dark:data-[state=checked]:bg-white dark:data-[state=checked]:text-black"
                />
                <Label
                  htmlFor="isPremium"
                  className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Premium Content
                </Label>
              </div>

              {/* Required Tier */}
              {isPremium && (
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="requiredTier">Required Tier</Label>
                  <Select
                    value={requiredTier}
                    onValueChange={(value) =>
                      setRequiredTier(value as PremiumTier)
                    }
                  >
                    <SelectTrigger className="border-2 border-black bg-white font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:focus:shadow-[3px_3px_0px_0px_#757373]">
                      <SelectValue placeholder="Select Required Tier" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373]">
                      <SelectItem value="TIER_1">Tier 1</SelectItem>
                      <SelectItem value="TIER_2">Tier 2</SelectItem>
                      <SelectItem value="TIER_3">Tier 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Publish Settings */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                Publication Settings
              </Label>

              {/* Is Published Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublished"
                  checked={isPublished}
                  onCheckedChange={(checked) =>
                    setIsPublished(checked === true)
                  }
                  className="border-2 border-black data-[state=checked]:bg-black data-[state=checked]:text-white dark:border-white/20 dark:data-[state=checked]:bg-white dark:data-[state=checked]:text-black"
                />
                <Label
                  htmlFor="isPublished"
                  className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Published
                </Label>
              </div>
            </div>

            {/* File Upload */}
            <div className="flex flex-col space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <UploadIcon className="h-5 w-5" />
                Upload JSON File
              </Label>
              <div
                className={`relative cursor-pointer rounded-lg border-2 border-dashed p-8 transition-all duration-200 hover:border-solid ${
                  isDragOver
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                    : "border-black dark:border-white/20"
                } bg-white shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] dark:bg-zinc-800 dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[6px_6px_0px_0px_#757373]`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file")?.click()}
              >
                <input
                  id="file"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div
                    className={`rounded-full p-4 transition-colors ${
                      isDragOver
                        ? "bg-blue-100 dark:bg-blue-900/50"
                        : "bg-gray-100 dark:bg-zinc-700"
                    }`}
                  >
                    <CloudArrowUpIcon
                      className={`h-12 w-12 transition-colors ${
                        isDragOver
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    />
                  </div>
                  <div className="space-y-2 text-center">
                    <p className="text-lg font-bold text-black dark:text-white">
                      {isDragOver
                        ? "Drop your JSON file here"
                        : "Choose a file or drag it here"}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Only JSON files are supported
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                    <UploadIcon className="h-4 w-4" />
                    Browse Files
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                Select a JSON file to automatically populate the JSON data field
                below.
              </p>
            </div>

            {/* JSON Input */}
            <div className="flex flex-col space-y-3">
              <Label
                htmlFor="jsonInput"
                className="flex items-center gap-2 text-base font-semibold"
              >
                <CodeIcon className="h-5 w-5" />
                JSON Data
              </Label>
              <div className="relative" data-lenis-prevent>
                <div className="absolute top-3 left-3 z-10">
                  <FileTextIcon className="text-muted-foreground h-5 w-5" />
                </div>
                <Textarea
                  id="jsonInput"
                  value={jsonInput}
                  onChange={(e) => handleJsonInputChange(e.target.value)}
                  placeholder="Paste your JSON data here or upload a file..."
                  className="max-h-[500px] min-h-[500px] resize-none overflow-y-auto border-2 border-black bg-white pl-12 font-mono text-sm font-bold text-black shadow-[2px_2px_0px_0px_#000] transition-all focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[3px_3px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:text-white dark:shadow-[2px_2px_0px_0px_#757373] dark:focus:shadow-[3px_3px_0px_0px_#757373]"
                />
                {jsonInput && (
                  <div className="text-muted-foreground absolute right-3 bottom-3 flex items-center gap-2 rounded-md bg-white/90 px-2 py-1 text-xs font-medium shadow-sm dark:bg-zinc-800/90">
                    <PlusCircleIcon className="h-3 w-3" />
                    {jsonInput.split("\n").length} lines
                  </div>
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                Upload a JSON file above or paste your JSON data directly. The
                input is limited to 500px height for better visibility.
              </p>
            </div>

            {/* Quiz Preview */}
            {parsedQuizData && (
              <div className="flex flex-col space-y-3" data-lenis-prevent>
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <FileTextIcon className="h-5 w-5" />
                  Quiz Preview ({parsedQuizData.quizSets.length} Quiz Set
                  {parsedQuizData.quizSets.length > 1 ? "s" : ""})
                </Label>
                <div className="max-h-[600px] space-y-4 overflow-y-auto rounded-lg border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-800 dark:shadow-[2px_2px_0px_0px_#757373]">
                  {parsedQuizData.quizSets.map((quizSet, setIndex) => (
                    <div
                      key={setIndex}
                      className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-zinc-900"
                    >
                      <div className="border-b border-gray-300 pb-2 dark:border-gray-600">
                        <h3 className="text-lg font-bold text-black dark:text-white">
                          {quizSet.subject} - {quizSet.topic}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {quizSet.questions.length} question
                          {quizSet.questions.length > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="space-y-3">
                        {quizSet.questions.map((question, questionIndex) => (
                          <div
                            key={questionIndex}
                            className="space-y-2 rounded border border-gray-200 bg-white p-3 dark:border-gray-600 dark:bg-zinc-800"
                          >
                            <p className="font-medium text-black dark:text-white">
                              Q{questionIndex + 1}: {question.question}
                            </p>
                            <div className="space-y-1">
                              {question.options.map((option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className={`rounded p-2 text-sm ${
                                    option.isCorrect
                                      ? "border border-green-300 bg-green-100 font-medium text-green-800 dark:border-green-700 dark:bg-green-900 dark:text-green-200"
                                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {String.fromCharCode(65 + optionIndex)}.{" "}
                                  {option.text}
                                  {option.isCorrect && " ✓"}
                                </div>
                              ))}
                            </div>
                            {question.explanation && (
                              <div className="text-muted-foreground text-sm italic">
                                Explanation: {question.explanation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground text-sm">
                  Preview shows all questions from each quiz set that will be
                  imported.
                </p>
              </div>
            )}

            {/* Progress */}
            {loading && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 animate-spin" />
                  <Label>Import Progress</Label>
                </div>
                <Progress
                  value={progress}
                  className="h-2 border-2 border-black shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:shadow-[2px_2px_0px_0px_#757373]"
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <Alert
                variant="destructive"
                className="border-2 border-red-500 bg-red-50 shadow-[4px_4px_0px_0px_#ef4444] dark:border-red-400 dark:bg-red-950 dark:shadow-[4px_4px_0px_0px_#ef4444]"
              >
                <WarningIcon className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex space-x-2">
              <Button
                onClick={handleImport}
                disabled={loading}
                className="flex-1 border-2 border-black bg-white font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:text-white hover:shadow-[6px_6px_0px_0px_#000] disabled:translate-x-0 disabled:translate-y-0 disabled:opacity-50 disabled:shadow-[4px_4px_0px_0px_#000] dark:border-white dark:text-black dark:shadow-[4px_4px_0px_0px_#fff] dark:hover:shadow-[6px_6px_0px_0px_#fff] dark:disabled:shadow-[4px_4px_0px_0px_#fff]"
              >
                {loading ? "Importing..." : "Import Quizzes"}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/admin/quiz")}
                disabled={loading}
                className="border-2 border-black bg-transparent font-bold text-black shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] disabled:translate-x-0 disabled:translate-y-0 disabled:opacity-50 disabled:shadow-[4px_4px_0px_0px_#000] dark:border-white dark:text-white dark:shadow-[4px_4px_0px_0px_#fff] dark:hover:shadow-[6px_6px_0px_0px_#fff] dark:disabled:shadow-[4px_4px_0px_0px_#fff]"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
