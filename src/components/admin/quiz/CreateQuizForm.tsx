"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import { createQuizAction } from "../actions/admin-quizzes";
import { type CreateQuizInput } from "@/dal/quiz/types";
import {
  University,
  Degree,
  Year,
  Semester,
  PremiumTier,
} from "@prisma/client";
import {
  getUniversities,
  getDegreesByUniversity,
  getYearsByUniversityAndDegree,
  getSemestersByUniversityDegreeAndYear,
  normalizedTierValues,
} from "@/utils/academic-config";
import {
  CircleNotchIcon,
  PlusIcon,
  TrashIcon,
  QuestionIcon,
  ArrowLeftIcon,
} from "@phosphor-icons/react";

interface QuestionData {
  question: string;
  explanation?: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
}

export default function CreateQuizForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Partial<CreateQuizInput>>({
    title: "",
    description: "",
    subject: "",
    marksPerQuestion: 1,
    isPremium: false,
  });
  const [questions, setQuestions] = useState<QuestionData[]>([
    {
      question: "",
      explanation: "",
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    },
  ]);

  const universities = getUniversities();
  const degrees = formData.university
    ? getDegreesByUniversity(formData.university)
    : [];
  const years =
    formData.university && formData.degree
      ? getYearsByUniversityAndDegree(formData.university, formData.degree)
      : [];
  const semesters =
    formData.university && formData.degree && formData.year
      ? getSemestersByUniversityDegreeAndYear(
          formData.university,
          formData.degree,
          formData.year,
        )
      : [];
  const tierValues = normalizedTierValues();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate required fields
      if (!formData.title?.trim()) {
        setError("Title is required");
        return;
      }
      if (!formData.subject?.trim()) {
        setError("Subject is required");
        return;
      }
      if (
        !formData.university ||
        !formData.degree ||
        !formData.year ||
        !formData.semester
      ) {
        setError("All academic fields are required");
        return;
      }

      // Validate questions
      if (questions.length === 0) {
        setError("At least one question is required");
        return;
      }

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        if (!question.question.trim()) {
          setError(`Question ${i + 1} text is required`);
          return;
        }

        const validOptions = question.options.filter((opt) => opt.text.trim());
        if (validOptions.length < 2) {
          setError(`Question ${i + 1} must have at least 2 options`);
          return;
        }

        const correctOptions = validOptions.filter((opt) => opt.isCorrect);
        if (correctOptions.length !== 1) {
          setError(`Question ${i + 1} must have exactly one correct answer`);
          return;
        }
      }

      const createData: CreateQuizInput = {
        ...formData,
        questions: questions.map((q) => ({
          question: q.question,
          explanation: q.explanation,
          options: q.options.filter((opt) => opt.text.trim()),
        })),
      } as CreateQuizInput;

      const result = await createQuizAction(createData);

      if (result.success) {
        router.push("/admin/quiz");
      } else {
        setError(result.error || "Failed to create quiz");
      }
    } catch (err) {
      console.error("Error creating quiz:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        explanation: "",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (
    index: number,
    field: keyof QuestionData,
    value: string | QuestionData["options"],
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push({
      text: "",
      isCorrect: false,
    });
    setQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options.length > 2) {
      updatedQuestions[questionIndex].options.splice(optionIndex, 1);
      setQuestions(updatedQuestions);
    }
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    field: "text" | "isCorrect",
    value: string | boolean,
  ) => {
    const updatedQuestions = [...questions];

    if (field === "isCorrect" && value === true) {
      // Ensure only one correct answer per question
      updatedQuestions[questionIndex].options.forEach((opt, i) => {
        opt.isCorrect = i === optionIndex;
      });
    } else {
      if (field === "text") {
        updatedQuestions[questionIndex].options[optionIndex].text =
          value as string;
      } else {
        updatedQuestions[questionIndex].options[optionIndex].isCorrect =
          value as boolean;
      }
    }

    setQuestions(updatedQuestions);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="neuro rounded-md p-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push("/admin/quiz")}
            variant="outline"
            className="neuro-button font-satoshi font-bold text-black/70 dark:text-white/70"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Quizzes
          </Button>
          <div>
            <h1 className="font-excon flex items-center gap-3 text-3xl font-black text-black dark:text-white">
              <QuestionIcon className="h-8 w-8" />
              Create New Quiz
            </h1>
            <p className="font-satoshi mt-2 font-bold text-black/70 dark:text-white/70">
              Design an engaging quiz with multiple-choice questions for your
              students
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="neuro rounded-md p-6">
          <h2 className="font-excon mb-4 text-xl font-black text-black dark:text-white">
            Basic Information
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="font-satoshi font-bold text-black dark:text-white">
                Quiz Title *
              </Label>
              <Input
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter quiz title"
                className="neuro-sm font-satoshi font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-satoshi font-bold text-black dark:text-white">
                Subject *
              </Label>
              <Input
                value={formData.subject || ""}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                placeholder="e.g., Mathematics, Physics"
                className="neuro-sm font-satoshi font-bold"
              />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label className="font-satoshi font-bold text-black dark:text-white">
              Description
            </Label>
            <Textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of the quiz"
              rows={2}
              className="neuro-sm font-satoshi font-bold"
            />
          </div>
        </div>

        {/* Academic Information */}
        <div className="neuro rounded-md p-6">
          <h2 className="font-excon mb-4 text-xl font-black text-black dark:text-white">
            Academic Information
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label className="font-satoshi font-bold text-black dark:text-white">
                University *
              </Label>
              <Select
                value={formData.university || ""}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    university: value as University,
                    degree: undefined,
                    year: undefined,
                    semester: undefined,
                  })
                }
              >
                <SelectTrigger className="neuro-sm font-satoshi font-bold">
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((university) => (
                    <SelectItem
                      key={university.value}
                      value={university.prismaValue}
                    >
                      {university.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-satoshi font-bold text-black dark:text-white">
                Degree *
              </Label>
              <Select
                value={formData.degree || ""}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    degree: value as Degree,
                    year: undefined,
                    semester: undefined,
                  })
                }
                disabled={!formData.university}
              >
                <SelectTrigger className="neuro-sm font-satoshi font-bold">
                  <SelectValue placeholder="Select degree" />
                </SelectTrigger>
                <SelectContent>
                  {degrees.map((degree) => (
                    <SelectItem key={degree.value} value={degree.prismaValue}>
                      {degree.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-satoshi font-bold text-black dark:text-white">
                Year *
              </Label>
              <Select
                value={formData.year || ""}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    year: value as Year,
                    semester: undefined,
                  })
                }
                disabled={!formData.degree}
              >
                <SelectTrigger className="neuro-sm font-satoshi font-bold">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year.value} value={year.prismaValue}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-satoshi font-bold text-black dark:text-white">
                Semester *
              </Label>
              <Select
                value={formData.semester || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, semester: value as Semester })
                }
                disabled={!formData.year}
              >
                <SelectTrigger className="neuro-sm font-satoshi font-bold">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((semester) => (
                    <SelectItem
                      key={semester.value}
                      value={semester.prismaValue}
                    >
                      {semester.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Quiz Settings */}
        <div className="neuro rounded-md p-6">
          <h2 className="font-excon mb-4 text-xl font-black text-black dark:text-white">
            Quiz Settings
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="font-satoshi font-bold text-black dark:text-white">
                Marks per Question
              </Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={formData.marksPerQuestion || 1}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    marksPerQuestion: parseInt(e.target.value) || 1,
                  })
                }
                className="neuro-sm font-satoshi font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-satoshi font-bold text-black dark:text-white">
                Time Limit (minutes)
              </Label>
              <Input
                type="number"
                min="1"
                max="300"
                value={formData.timeLimit || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    timeLimit: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Optional"
                className="neuro-sm font-satoshi font-bold"
              />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPremium"
                checked={formData.isPremium || false}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    isPremium: checked as boolean,
                    requiredTier: checked
                      ? formData.requiredTier || PremiumTier.TIER_1
                      : undefined,
                  })
                }
              />
              <Label
                htmlFor="isPremium"
                className="font-satoshi font-bold text-black dark:text-white"
              >
                Premium Quiz
              </Label>
            </div>

            {formData.isPremium && (
              <div className="ml-6 space-y-2">
                <Label className="font-satoshi font-bold text-black dark:text-white">
                  Required Tier
                </Label>
                <Select
                  value={formData.requiredTier || ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      requiredTier: value as PremiumTier,
                    })
                  }
                >
                  <SelectTrigger className="neuro-sm font-satoshi w-40 font-bold">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(tierValues).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Questions */}
        <div className="neuro rounded-md p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-excon text-xl font-black text-black dark:text-white">
              Questions ({questions.length})
            </h2>
            <Button
              type="button"
              onClick={addQuestion}
              className="neuro-button font-satoshi font-bold"
            >
              <PlusIcon className="h-4 w-4" />
              Add Question
            </Button>
          </div>

          <div className="space-y-6">
            {questions.map((question, questionIndex) => (
              <div
                key={questionIndex}
                className="dark:border-white/20/10 rounded-lg border-2 border-black/10 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-satoshi font-bold text-black dark:text-white">
                    Question {questionIndex + 1}
                  </h3>
                  {questions.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeQuestion(questionIndex)}
                      className="h-6 w-6 border-2 border-red-500 bg-white p-0 shadow-[1px_1px_0px_0px_#ef4444] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none dark:border-red-400 dark:bg-zinc-800 dark:shadow-[1px_1px_0px_0px_#ef4444]"
                    >
                      <TrashIcon className="h-3 w-3 text-red-500 dark:text-red-400" />
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="font-satoshi text-sm font-bold text-black dark:text-white">
                      Question Text *
                    </Label>
                    <Textarea
                      value={question.question}
                      onChange={(e) =>
                        updateQuestion(
                          questionIndex,
                          "question",
                          e.target.value,
                        )
                      }
                      placeholder="Enter your question"
                      rows={2}
                      className="neuro-sm font-satoshi mt-1 font-bold"
                    />
                  </div>

                  <div>
                    <Label className="font-satoshi text-sm font-bold text-black dark:text-white">
                      Explanation (Optional)
                    </Label>
                    <Textarea
                      value={question.explanation || ""}
                      onChange={(e) =>
                        updateQuestion(
                          questionIndex,
                          "explanation",
                          e.target.value,
                        )
                      }
                      placeholder="Explain the correct answer"
                      rows={2}
                      className="neuro-sm font-satoshi mt-1 font-bold"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <Label className="font-satoshi text-sm font-bold text-black dark:text-white">
                        Options (Select one correct answer)
                      </Label>
                      <Button
                        type="button"
                        onClick={() => addOption(questionIndex)}
                        className="neuro-button-sm font-satoshi h-6 text-xs font-bold"
                        disabled={question.options.length >= 6}
                      >
                        <PlusIcon className="h-3 w-3" />
                        Add Option
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            checked={option.isCorrect}
                            onCheckedChange={(checked) =>
                              updateOption(
                                questionIndex,
                                optionIndex,
                                "isCorrect",
                                checked as boolean,
                              )
                            }
                          />
                          <Input
                            value={option.text}
                            onChange={(e) =>
                              updateOption(
                                questionIndex,
                                optionIndex,
                                "text",
                                e.target.value,
                              )
                            }
                            placeholder={`Option ${optionIndex + 1}`}
                            className="neuro-sm font-satoshi flex-1 font-bold"
                          />
                          {question.options.length > 2 && (
                            <Button
                              type="button"
                              onClick={() =>
                                removeOption(questionIndex, optionIndex)
                              }
                              className="h-8 w-8 border-2 border-red-500 bg-white p-0 shadow-[1px_1px_0px_0px_#ef4444] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none dark:border-red-400 dark:bg-zinc-800 dark:shadow-[1px_1px_0px_0px_#ef4444]"
                            >
                              <TrashIcon className="h-3 w-3 text-red-500 dark:text-red-400" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="neuro-danger rounded-lg p-4">
            <p className="font-satoshi font-bold text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pb-8">
          <Button
            type="button"
            onClick={() => router.push("/admin/quiz")}
            variant="outline"
            disabled={loading}
            className="neuro-button font-satoshi font-bold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="neuro-button font-satoshi font-bold text-white"
          >
            {loading ? (
              <>
                <CircleNotchIcon className="h-4 w-4 animate-spin" />
                Creating Quiz...
              </>
            ) : (
              "Create Quiz"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
