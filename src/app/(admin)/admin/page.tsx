import AdminStatics from "@/components/admin/core/AdminStatics";
import AdminUserTable from "@/components/admin/core/AdminUserTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  description: "Admin panel for managing users and settings",
};

export default async function Admin() {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <AdminStatics />
      <AdminUserTable />
    </div>
  );
}
