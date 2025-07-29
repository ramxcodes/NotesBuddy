"use client";

import { useRouter } from "next/navigation";
import { WarningIcon } from "@phosphor-icons/react";

export default function ReportButton() {
  const router = useRouter();

  const handleReportClick = () => {
    const currentUrl = window.location.href;
    const reportUrl = `/report?url=${encodeURIComponent(currentUrl)}`;
    router.push(reportUrl);
  };

  return (
    <div
      data-umami-event="report-button-click"
      className="flex cursor-pointer items-center gap-2 text-orange-600 hover:cursor-pointer"
      onClick={handleReportClick}
    >
      <WarningIcon weight="duotone" className="h-4 w-4 text-orange-600" />
      Report
    </div>
  );
}
