import AdminPremiumController from "@/components/admin/premium/AdminPremiumController";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium Management",
  description:
    "Admin panel for managing user premium subscriptions and upgrades",
};

export default function AdminPremiumPage() {
  return (
    <div className="space-y-6">
      <AdminPremiumController />
    </div>
  );
}
