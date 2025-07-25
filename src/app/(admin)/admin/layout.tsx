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
    <div className="container mx-auto flex flex-col items-center justify-center gap-4 px-10 py-8">
      <AdminNavbar />
      {children}
    </div>
  );
}
