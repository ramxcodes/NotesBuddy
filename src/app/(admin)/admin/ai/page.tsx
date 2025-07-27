import { Suspense } from "react";
import AdminAIController from "@/components/admin/ai/AdminAIController";

export default function AdminAIPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading AI chat data...</div>}>
        <AdminAIController />
      </Suspense>
    </div>
  );
}

export const metadata = {
  title: "AI Chat Management - Admin",
  description: "Manage and monitor AI chat conversations",
};
