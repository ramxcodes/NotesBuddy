import { Suspense } from "react";
import AdminReportsController from "@/components/admin/reports/AdminReportsController";

export default function AdminReportsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading reports data...</div>}>
        <AdminReportsController />
      </Suspense>
    </div>
  );
}

export const metadata = {
  title: "Reports Management - Admin",
  description: "Manage and monitor user reports",
};
