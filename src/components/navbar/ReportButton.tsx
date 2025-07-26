"use client";

import { useRouter } from "next/navigation";
import { WarningIcon } from "@phosphor-icons/react";

export default function ReportButton() {
  const router = useRouter();

  return (
    <div
      className="flex cursor-pointer items-center gap-2 text-orange-600 hover:cursor-pointer"
      onClick={() => router.push("/report")}
    >
      <WarningIcon weight="duotone" className="h-4 w-4 text-orange-600" />
      Report
    </div>
  );
}
