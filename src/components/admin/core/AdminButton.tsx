"use client";

import { useEffect, useState } from "react";
import { Link } from "next-view-transitions";
import { Button } from "@/components/ui/button";
import AdminIcon from "@/components/icons/AdminIcon";

export default function AdminButton() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_WEBSITE_URL}/api/user/checkAdminStatus`,
        );

        if (response.ok) {
          const result = await response.json();
          setIsAdmin(result);
        }
      } catch (error) {
        console.error("Failed to check admin status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (isLoading || !isAdmin) {
    return null;
  }

  return (
    <Link href="/admin">
      <Button
        data-umami-event="nav-admin-panel-click"
        size="lg"
        className="gap-2 border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:text-white hover:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]"
      >
        <AdminIcon className="size-4" />
        <span className="hidden md:block">Admin Panel</span>
      </Button>
    </Link>
  );
}
