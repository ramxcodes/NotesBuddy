"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateNoteAction } from "../actions/admin-notes";
import { type NoteDetails } from "@/dal/note/admin";
import { toast } from "sonner";
import { FloppyDisk, ArrowLeft, Crown, Eye } from "@phosphor-icons/react";
import { PortableTextRenderer } from "@/components/note/PortableTextRenderer";
import PortableTextEditor from "./PortableTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  note: NoteDetails;
}

export default function AdminNoteEditor({ note }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: note.title,
    syllabus: note.syllabus || "",
    university: note.university,
    degree: note.degree,
    year: note.year,
    semester: note.semester,
    subject: note.subject,
    isPremium: note.isPremium,
    tier: note.tier || "",
    content: note.content,
  });
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateNoteAction(note._id, {
        title: formData.title,
        syllabus: formData.syllabus,
        university: formData.university,
        degree: formData.degree,
        year: formData.year,
        semester: formData.semester,
        subject: formData.subject,
        isPremium: formData.isPremium,
        tier: formData.isPremium ? formData.tier : undefined,
        content: formData.content,
      });

      if (result.success) {
        toast.success("Note updated successfully!");
        setIsEditing(false);
        // Refresh the page to show updated content
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to update note");
      }
    } catch {
      console.error("Error saving note");
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: note.title,
      syllabus: note.syllabus || "",
      university: note.university,
      degree: note.degree,
      year: note.year,
      semester: note.semester,
      subject: note.subject,
      isPremium: note.isPremium,
      tier: note.tier || "",
      content: note.content,
    });
    setIsEditing(false);
  };

  const getUniversityDisplay = (value: string) => {
    switch (value) {
      case "medicaps":
        return "Medicaps University";
      case "ips":
        return "IPS University";
      default:
        return value;
    }
  };

  const getDegreeDisplay = (value: string) => {
    switch (value) {
      case "btech-cse":
        return "B.Tech CSE";
      case "btech-it":
        return "B.Tech IT";
      default:
        return value;
    }
  };

  const formatAcademicValue = (value: string) => {
    return value
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b-4 border-black pb-4 dark:border-white/20">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="sm"
            className="neuro-sm font-bold uppercase"
          >
            <ArrowLeft weight="duotone" className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-black uppercase">Edit Note</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Last updated:{" "}
              {note._updatedAt
                ? new Date(note._updatedAt).toLocaleDateString()
                : "Never"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="neuro-sm flex border-2 border-black dark:border-white">
            <Button
              onClick={() => setViewMode("edit")}
              variant={viewMode === "edit" ? "default" : "outline"}
              size="sm"
              className="neuro-sm neuro-sm rounded-none border-0 font-bold uppercase"
            >
              Edit
            </Button>
            <Button
              onClick={() => setViewMode("preview")}
              variant={viewMode === "preview" ? "default" : "outline"}
              size="sm"
              className="neuro-sm rounded-none border-0 font-bold uppercase"
            >
              <Eye weight="duotone" className="mr-1 h-3 w-3" />
              Preview
            </Button>
          </div>

          {isEditing && (
            <>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="neuro-sm font-bold uppercase"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className="neuro-sm font-bold uppercase"
              >
                <FloppyDisk weight="duotone" className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </>
          )}

          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              size="sm"
              className="font-bold uppercase"
            >
              Edit Note
            </Button>
          )}
        </div>
      </div>

      {viewMode === "preview" ? (
        /* Preview Mode */
        <div className="space-y-8">
          {/* Note Info */}
          <div className="dark:border-white-20dark:bg-black rounded-md border-4 border-black p-6">
            <h2 className="mb-4 text-xl font-black uppercase">
              {formData.title}
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-bold">University:</span>{" "}
                {getUniversityDisplay(formData.university)}
              </div>
              <div>
                <span className="font-bold">Degree:</span>{" "}
                {getDegreeDisplay(formData.degree)}
              </div>
              <div>
                <span className="font-bold">Year:</span>{" "}
                {formatAcademicValue(formData.year)}
              </div>
              <div>
                <span className="font-bold">Semester:</span>{" "}
                {formatAcademicValue(formData.semester)}
              </div>
              <div>
                <span className="font-bold">Subject:</span> {formData.subject}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Premium:</span>
                {formData.isPremium && (
                  <Crown weight="duotone" className="h-4 w-4 text-yellow-500" />
                )}
                <span
                  className={`rounded-md px-2 py-1 text-xs font-bold uppercase ${
                    formData.isPremium
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  }`}
                >
                  {formData.isPremium ? "Premium" : "Free"}
                </span>
                {formData.isPremium && formData.tier && (
                  <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-bold text-blue-800 uppercase dark:bg-blue-900 dark:text-blue-200">
                    {formData.tier.replace("TIER_", "Tier ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content Preview */}
          <div className="dark:border-white-20dark:bg-black rounded-md border-4 border-black p-6">
            <h3 className="mb-4 text-lg font-black uppercase">
              Content Preview
            </h3>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <PortableTextRenderer value={formData.content} />
            </div>
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <div className="space-y-8 rounded-md">
          {/* Note Metadata */}
          <div className="dark:border-white-20dark:bg-black rounded-md border-4 border-black p-6">
            <h2 className="mb-4 text-lg font-black uppercase">
              Note Information
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label className="mb-2 block text-sm font-bold text-gray-700 uppercase dark:text-gray-300">
                  Title
                </Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  disabled={!isEditing}
                  className="disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              <div>
                <Label className="mb-2 block text-sm font-bold text-gray-700 uppercase dark:text-gray-300">
                  Subject
                </Label>
                <Input
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                  className="disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              <div>
                <Label className="mb-2 block text-sm font-bold text-gray-700 uppercase dark:text-gray-300">
                  University
                </Label>
                <Select
                  value={formData.university}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      university: value,
                    }))
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger className="disabled:bg-gray-100 disabled:text-gray-500">
                    <SelectValue />
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
                <Label className="mb-2 block text-sm font-bold text-gray-700 uppercase dark:text-gray-300">
                  Degree
                </Label>
                <Select
                  value={formData.degree}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, degree: value }))
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger className="disabled:bg-gray-100 disabled:text-gray-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="btech-cse">B.Tech CSE</SelectItem>
                    <SelectItem value="btech-it">B.Tech IT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 block text-sm font-bold text-gray-700 uppercase dark:text-gray-300">
                  Year
                </Label>
                <Select
                  value={formData.year}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, year: value }))
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger className="disabled:bg-gray-100 disabled:text-gray-500">
                    <SelectValue />
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
                <Label className="mb-2 block text-sm font-bold text-gray-700 uppercase dark:text-gray-300">
                  Semester
                </Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      semester: value,
                    }))
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger className="disabled:bg-gray-100 disabled:text-gray-500">
                    <SelectValue />
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

              <div className="md:col-span-2">
                <Label className="mb-2 block text-sm font-bold text-gray-700 uppercase dark:text-gray-300">
                  Syllabus Description
                </Label>
                <Textarea
                  value={formData.syllabus}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      syllabus: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                  rows={3}
                  className="disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="Brief description of the syllabus content..."
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.isPremium}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      isPremium: checked as boolean,
                    }))
                  }
                  disabled={!isEditing}
                />
                <Label className="text-sm font-bold text-gray-700 uppercase dark:text-gray-300">
                  Premium Content
                </Label>
                <Crown weight="duotone" className="h-4 w-4 text-yellow-500" />
              </div>

              {formData.isPremium && (
                <div>
                  <Label className="mb-2 block text-sm font-bold text-gray-700 uppercase dark:text-gray-300">
                    Premium Tier
                  </Label>
                  <Select
                    value={formData.tier}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, tier: value }))
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="disabled:bg-gray-100 disabled:text-gray-500">
                      <SelectValue placeholder="Select Tier" />
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
          </div>

          {/* Content Editor */}
          <div className="dark:border-white-20dark:bg-black rounded-md border-4 border-black p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black uppercase">Content Editor</h2>
            </div>

            <PortableTextEditor
              content={formData.content}
              onChange={(newContent) =>
                setFormData((prev) => ({ ...prev, content: newContent }))
              }
              disabled={!isEditing}
            />
          </div>
        </div>
      )}
    </div>
  );
}
