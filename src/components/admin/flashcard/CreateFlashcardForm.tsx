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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFlashcardSetAction } from "../actions/admin-flashcards";
import { type CreateFlashcardSetInput } from "@/dal/flashcard/types";
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
  CircleNotch,
  Plus,
  Trash,
  Stack,
  ArrowLeft,
  Cards,
} from "@phosphor-icons/react";

interface FlashcardData {
  front: string;
  back: string;
}

export default function CreateFlashcardForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [university, setUniversity] = useState<University | "">("");
  const [degree, setDegree] = useState<Degree | "">("");
  const [year, setYear] = useState<Year | "">("");
  const [semester, setSemester] = useState<Semester | "">("");
  const [isPremium, setIsPremium] = useState(false);
  const [requiredTier, setRequiredTier] = useState<PremiumTier | "">("");
  const [isPublished, setIsPublished] = useState(true);

  // Flashcards state
  const [cards, setCards] = useState<FlashcardData[]>([
    { front: "", back: "" },
    { front: "", back: "" },
  ]);

  // Academic options
  const universities = getUniversities();
  const degrees = university
    ? getDegreesByUniversity(university as University)
    : [];
  const years =
    university && degree
      ? getYearsByUniversityAndDegree(
          university as University,
          degree as Degree,
        )
      : [];
  const semesters =
    university && degree && year
      ? getSemestersByUniversityDegreeAndYear(
          university as University,
          degree as Degree,
          year as Year,
        )
      : [];
  const tierValues = normalizedTierValues();

  const addCard = () => {
    setCards([...cards, { front: "", back: "" }]);
  };

  const removeCard = (index: number) => {
    if (cards.length > 1) {
      setCards(cards.filter((_, i) => i !== index));
    }
  };

  const updateCard = (
    index: number,
    field: keyof FlashcardData,
    value: string,
  ) => {
    const updatedCards = [...cards];
    updatedCards[index][field] = value;
    setCards(updatedCards);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (!subject.trim()) {
      alert("Please enter a subject");
      return;
    }

    if (!university || !degree || !year || !semester) {
      alert("Please select all academic information");
      return;
    }

    // Validate cards
    const validCards = cards.filter(
      (card) => card.front.trim() && card.back.trim(),
    );
    if (validCards.length === 0) {
      alert("Please add at least one card with both front and back content");
      return;
    }

    if (isPremium && !requiredTier) {
      alert("Please select a premium tier");
      return;
    }

    setLoading(true);

    try {
      const formData: CreateFlashcardSetInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        subject: subject.trim(),
        university: university as University,
        degree: degree as Degree,
        year: year as Year,
        semester: semester as Semester,
        isPremium,
        requiredTier:
          isPremium && requiredTier ? (requiredTier as PremiumTier) : undefined,
        isPublished,
        cards: validCards,
      };

      const result = await createFlashcardSetAction(formData);

      if (result.success) {
        router.push("/admin/flashcards");
        router.refresh();
      } else {
        alert(result.error || "Failed to create flashcard set");
      }
    } catch (error) {
      console.error("Error creating flashcard set:", error);
      alert("An error occurred while creating the flashcard set");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create Flashcard Set
          </h1>
          <p className="text-muted-foreground">
            Create a new set of flashcards for students to study
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stack className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Unit 2: Data Structures"
                  className="border-2 border-gray-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Computer Science"
                  className="border-2 border-gray-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the flashcard set..."
                rows={3}
                className="border-2 border-gray-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>University *</Label>
                <Select
                  value={university || undefined}
                  onValueChange={(value) => {
                    setUniversity(value as University);
                    setDegree("");
                    setYear("");
                    setSemester("");
                  }}
                >
                  <SelectTrigger className="border-2 border-gray-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                    <SelectValue placeholder="Select University" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities
                      .filter(
                        (uni) =>
                          uni.prismaValue && uni.prismaValue.trim() !== "",
                      )
                      .map((uni) => (
                        <SelectItem key={uni.value} value={uni.prismaValue}>
                          {uni.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Degree *</Label>
                <Select
                  value={degree || undefined}
                  onValueChange={(value) => {
                    setDegree(value as Degree);
                    setYear("");
                    setSemester("");
                  }}
                  disabled={!university}
                >
                  <SelectTrigger className="border-2 border-gray-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                    <SelectValue placeholder="Select Degree" />
                  </SelectTrigger>
                  <SelectContent>
                    {degrees
                      .filter(
                        (deg) =>
                          deg.prismaValue && deg.prismaValue.trim() !== "",
                      )
                      .map((deg) => (
                        <SelectItem key={deg.value} value={deg.prismaValue}>
                          {deg.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Year *</Label>
                <Select
                  value={year || undefined}
                  onValueChange={(value) => {
                    setYear(value as Year);
                    setSemester("");
                  }}
                  disabled={!degree}
                >
                  <SelectTrigger className="border-2 border-gray-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years
                      .filter(
                        (yr) => yr.prismaValue && yr.prismaValue.trim() !== "",
                      )
                      .map((yr) => (
                        <SelectItem key={yr.value} value={yr.prismaValue}>
                          {yr.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Semester *</Label>
                <Select
                  value={semester || undefined}
                  onValueChange={(value) => setSemester(value as Semester)}
                  disabled={!year}
                >
                  <SelectTrigger className="border-2 border-gray-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters
                      .filter(
                        (sem) =>
                          sem.prismaValue && sem.prismaValue.trim() !== "",
                      )
                      .map((sem) => (
                        <SelectItem key={sem.value} value={sem.prismaValue}>
                          {sem.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium Settings */}
        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle>Premium Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="premium"
                checked={isPremium}
                onCheckedChange={(checked) => setIsPremium(checked === true)}
              />
              <Label htmlFor="premium">This is a premium flashcard set</Label>
            </div>

            {isPremium && (
              <div className="space-y-2">
                <Label>Required Premium Tier</Label>
                <Select
                  value={requiredTier || undefined}
                  onValueChange={(value) =>
                    setRequiredTier(value as PremiumTier)
                  }
                >
                  <SelectTrigger className="w-full border-2 border-gray-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] md:w-[200px]">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(tierValues)
                      .filter(
                        ([key, label]) =>
                          key &&
                          key.trim() !== "" &&
                          label &&
                          label.trim() !== "",
                      )
                      .map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Publication Settings */}
        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle>Publication Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="published"
                checked={isPublished}
                onCheckedChange={(checked) => setIsPublished(checked === true)}
              />
              <Label htmlFor="published">Publish this flashcard set</Label>
            </div>
          </CardContent>
        </Card>

        {/* Flashcards */}
        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cards className="h-5 w-5" />
              Flashcards ({cards.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {cards.map((card, index) => (
              <Card key={index} className="border border-gray-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Card {index + 1}</CardTitle>
                    {cards.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCard(index)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Front (Question/Term) *</Label>
                    <Textarea
                      value={card.front}
                      onChange={(e) =>
                        updateCard(index, "front", e.target.value)
                      }
                      placeholder="Enter the question or term..."
                      rows={3}
                      className="border-2 border-gray-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Back (Answer/Definition) *</Label>
                    <Textarea
                      value={card.back}
                      onChange={(e) =>
                        updateCard(index, "back", e.target.value)
                      }
                      placeholder="Enter the answer or definition..."
                      rows={3}
                      className="border-2 border-gray-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addCard}
              className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Another Card
            </Button>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
            className="border-2 border-gray-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="border-2 border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-gray-800 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            {loading ? (
              <>
                <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Stack className="mr-2 h-4 w-4" />
                Create Flashcard Set
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
