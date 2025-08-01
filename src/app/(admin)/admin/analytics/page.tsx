import { Metadata } from "next";
import AnalyticsDashboard from "@/components/admin/analytics/AnalyticsDashboard";

export const metadata: Metadata = {
  title: "Analytics - Admin",
  description: "Comprehensive analytics dashboard with Umami data",
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-black dark:text-white">
          Analytics Dashboard
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Comprehensive insights into your website traffic and user behavior
        </p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
