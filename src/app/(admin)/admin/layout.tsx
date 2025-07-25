import React from "react";
import { adminStatus } from "@/lib/db/user";
import { redirect } from "next/navigation";
import AdminNavbar from "@/components/admin/core/AdminNavbar";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    redirect("/");
  }
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <AdminNavbar />
      <div className="mt-8">{children}</div>
    </div>
  );
}
