import AdminStatics from "@/components/admin/core/AdminStatics";
import AdminUserTable from "@/components/admin/core/AdminUserTable";
import UmamiStatics from "@/components/admin/core/UmamiStatics";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  description: "Admin panel for managing users and settings",
};

export default async function Admin() {
  return (
    <div className="space-y-8">
      <AdminStatics />
      <UmamiStatics />
      <AdminUserTable />
    </div>
  );
}
