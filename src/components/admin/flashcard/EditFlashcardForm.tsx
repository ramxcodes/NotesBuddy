"use client";

import React, { useState, useEffect } from "react";
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
import {
  ArrowLeftIcon,
  StackIcon,
  PlusIcon,
  TrashIcon,
  CircleNotchIcon,
} from "@phosphor-icons/react";
import {
  getUniversities,
  getDegreesByUniversity,
  getYearsByUniversityAndDegree,
  getSemestersByUniversityDegreeAndYear,
  normalizedTierValues,
} from "@/utils/academic-config";
import { updateFlashcardSetAction } from "@/components/admin/actions/admin-flashcards";
import type {
  FlashcardSetDetail,
  UpdateFlashcardSetInput,
} from "@/dal/flashcard/types";
import {
  University,
  Degree,
  Year,
  Semester,
  PremiumTier,
} from "@prisma/client";

interface EditFlashcardFormProps {
  flashcardSet: FlashcardSetDetail;
}

interface CardData {
  front: string;
  back: string;
}

export default function EditFlashcardForm({
  flashcardSet,
}: EditFlashcardFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Partial<UpdateFlashcardSetInput>>(
    {},
  );
  const [cards, setCards] = useState<CardData[]>([]);

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

  // Initialize form data
  useEffect(() => {
    if (flashcardSet) {
      setFormData({
        id: flashcardSet.id,
        title: flashcardSet.title,
        description: flashcardSet.description || "",
        subject: flashcardSet.subject,
        university: flashcardSet.university,
        degree: flashcardSet.degree,
        year: flashcardSet.year,
        semester: flashcardSet.semester,
        isPremium: flashcardSet.isPremium,
        requiredTier: flashcardSet.requiredTier || undefined,
        isActive: flashcardSet.isActive,
        isPublished: flashcardSet.isPublished,
      });

      setCards(
        flashcardSet.cards.map((card) => ({
          front: card.front,
          back: card.back,
        })),
      );
    }
  }, [flashcardSet]);

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

      // Validate cards
      if (cards.length === 0) {
        setError("At least one flashcard is required");
        return;
      }

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        if (!card.front.trim()) {
          setError(`Card ${i + 1} front text is required`);
          return;
        }
        if (!card.back.trim()) {
          setError(`Card ${i + 1} back text is required`);
          return;
        }
      }

      const updateData: UpdateFlashcardSetInput = {
        ...formData,
        cards: cards.filter((card) => card.front.trim() && card.back.trim()),
      } as UpdateFlashcardSetInput;

      const result = await updateFlashcardSetAction(updateData);

      if (result.success) {
        router.push("/admin/flashcards");
      } else {
        setError(result.error || "Failed to update flashcard set");
      }
    } catch (err) {
      console.error("Error updating flashcard set:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const addCard = () => {
    setCards([...cards, { front: "", back: "" }]);
  };

  const removeCard = (index: number) => {
    if (cards.length > 1) {
      setCards(cards.filter((_, i) => i !== index));
    }
  };

  const updateCard = (index: number, field: keyof CardData, value: string) => {
    const updatedCards = [...cards];
    updatedCards[index] = { ...updatedCards[index], [field]: value };
    setCards(updatedCards);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="neuro rounded-md p-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push("/admin/flashcards")}
            variant="outline"
            className="neuro-button font-satoshi font-bold dark:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Flashcards
          </Button>
          <div>
            <h1 className="font-excon flex items-center gap-3 text-3xl font-black text-black dark:text-white">
              <StackIcon className="h-8 w-8 text-purple-600" />
              Edit Flashcard Set
            </h1>
            <p className="font-satoshi mt-2 font-bold text-black/70 dark:text-white/70">
              Modify this flashcard set to enhance your students&apos; learning
              experience
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
                Flashcard Set Title *
              </Label>
              <Input
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter flashcard set title"
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
              placeholder="Brief description of the flashcard set"
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

        {/* Flashcard Set Settings */}
        <div className="neuro rounded-md p-6">
          <h2 className="font-excon mb-4 text-xl font-black text-black dark:text-white">
            Flashcard Set Settings
          </h2>

          <div className="space-y-3">
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
                Premium Flashcard Set
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

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive || false}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked as boolean })
                  }
                />
                <Label
                  htmlFor="isActive"
                  className="font-satoshi font-bold text-black dark:text-white"
                >
                  Active
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublished"
                  checked={formData.isPublished || false}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      isPublished: checked as boolean,
                    })
                  }
                />
                <Label
                  htmlFor="isPublished"
                  className="font-satoshi font-bold text-black dark:text-white"
                >
                  Published
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Flashcards */}
        <div className="neuro rounded-md p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-excon text-xl font-black text-black dark:text-white">
              Flashcards ({cards.length})
            </h2>
            <Button
              type="button"
              onClick={addCard}
              className="neuro-button font-satoshi font-bold"
            >
              <PlusIcon className="h-4 w-4" />
              Add Card
            </Button>
          </div>

          <div className="space-y-6">
            {cards.map((card, cardIndex) => (
              <div
                key={cardIndex}
                className="dark:border-white/20/10 rounded-lg border-2 border-black/10 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-satoshi font-bold text-black dark:text-white">
                    Card {cardIndex + 1}
                  </h3>
                  {cards.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeCard(cardIndex)}
                      className="h-6 w-6 border-2 border-red-500 bg-white p-0 shadow-[1px_1px_0px_0px_#ef4444] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none dark:border-red-400 dark:bg-zinc-800 dark:shadow-[1px_1px_0px_0px_#ef4444]"
                    >
                      <TrashIcon className="h-3 w-3 text-red-500 dark:text-red-400" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="font-satoshi text-sm font-bold text-black dark:text-white">
                      Front *
                    </Label>
                    <Textarea
                      value={card.front}
                      onChange={(e) =>
                        updateCard(cardIndex, "front", e.target.value)
                      }
                      placeholder="Enter the front content (question, term, etc.)"
                      rows={3}
                      className="neuro-sm font-satoshi font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-satoshi text-sm font-bold text-black dark:text-white">
                      Back *
                    </Label>
                    <Textarea
                      value={card.back}
                      onChange={(e) =>
                        updateCard(cardIndex, "back", e.target.value)
                      }
                      placeholder="Enter the back content (answer, definition, etc.)"
                      rows={3}
                      className="neuro-sm font-satoshi font-bold"
                    />
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
            onClick={() => router.push("/admin/flashcards")}
            variant="outline"
            disabled={loading}
            className="neuro-button font-satoshi font-bold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="neuro-button font-satoshifont-bold text-white"
          >
            {loading ? (
              <>
                <CircleNotchIcon className="h-4 w-4 animate-spin" />
                Updating Flashcard Set...
              </>
            ) : (
              "Update Flashcard Set"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
