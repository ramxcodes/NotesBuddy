import { adminStatus } from "@/lib/db/user";
import { redirect } from "next/navigation";
import React from "react";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await adminStatus();

  if (!isAdmin) {
    redirect("/");
  }
  return <>{children}</>;
}
