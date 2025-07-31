"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import React from "react";

interface AdminNavbarProps {
  title: string;
  href: string;
}

const adminNavbarItems: AdminNavbarProps[] = [
  {
    title: "Dashboard",
    href: "/admin",
  },
  {
    title: "Notes",
    href: "/admin/notes",
  },
  {
    title: "Quiz",
    href: "/admin/quiz",
  },
  {
    title: "Flashcards",
    href: "/admin/flashcards",
  },
  {
    title: "AI Chats",
    href: "/admin/ai",
  },
  {
    title: "Coupons",
    href: "/admin/coupons",
  },
  {
    title: "Reports",
    href: "/admin/reports",
  },
];

export default function AdminNavbar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 border-b-4 border-black pb-2 dark:border-white/20">
      {adminNavbarItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            href={item.href}
            key={item.title}
            className={`px-4 py-2 text-sm font-black uppercase transition-all ${
              isActive
                ? "border-b-4 border-black bg-black text-white dark:border-white/20 dark:bg-white dark:text-black"
                : "border-b-4 border-transparent hover:border-black hover:bg-black hover:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-black"
            }`}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
