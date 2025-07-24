"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { submitReport } from "./actions";

export default function ReportModal() {
  const [reportText, setReportText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("report", reportText);
      formData.append("url", window.location.href);
      const result = await submitReport(formData);
      if (result.success) {
        setReportText("");
        router.back();
      } else {
        setError(result.error || "Failed to submit report.");
      }
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] dark:border-white dark:bg-zinc-900 dark:shadow-[4px_4px_0px_0px_#757373]">
        <DialogHeader>
          <DialogTitle className="font-excon text-xl font-black text-black dark:text-white">
            Report Issue
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-satoshi mb-2 block text-sm font-bold text-black dark:text-white">
              Current URL:
            </label>
            <div className="rounded-md border-2 border-black bg-gray-100 p-3 font-mono text-sm text-black dark:border-white dark:bg-zinc-800 dark:text-white">
              {typeof window !== "undefined" ? window.location.href : ""}
            </div>
          </div>
          <div>
            <label className="font-satoshi mb-2 block text-sm font-bold text-black dark:text-white">
              Report Details:
            </label>
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              className="font-satoshi min-h-[100px] w-full rounded-md border-2 border-black bg-white p-3 text-black placeholder-gray-500 focus:ring-0 focus:outline-none dark:border-white dark:bg-zinc-800 dark:text-white dark:placeholder-gray-400"
              placeholder="Describe the issue you're experiencing..."
              required
            />
          </div>
          {error && (
            <div className="text-sm font-bold text-red-500">{error}</div>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="font-excon w-full border-2 border-black bg-black text-white shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none dark:border-white dark:bg-white dark:text-black dark:shadow-[2px_2px_0px_0px_#757373]"
          >
            {loading ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
