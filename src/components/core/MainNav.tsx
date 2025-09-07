import { Link } from "next-view-transitions";
import Profile from "./profile";
import { adminStatus } from "@/lib/db/user";
import AdminIcon from "../icons/AdminIcon";
import { Button } from "../ui/button";
import Logo from "./Logo";
import WhatsappIcon from "../icons/WhatsappIcon";
import PromoBanner from "./PromoBanner";

const navItems = [
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Notes",
    href: "/notes",
  },

  {
    label: "Pricing",
    href: "/#pricing",
  },
];

export default async function MainNav() {
  let isAdmin = false;

  try {
    isAdmin = await adminStatus();
  } catch {
    isAdmin = false;
  }

  return (
    <>
      <PromoBanner />
      <nav className="dark:from-background dark:via-background dark:to-background/20 sticky top-0 z-50 flex items-center justify-between bg-gradient-to-b from-white via-white to-white/20 px-10 py-8 hover:cursor-pointer">
        <div className="flex items-center gap-30">
          <Link href="/" className="flex items-center">
            <Logo className="size-10 md:size-12 lg:size-16" />
            <h3
              data-umami-event="nav-brand-text-click"
              className="font-excon text-xl font-bold md:text-2xl"
            >
              NotesBuddy
            </h3>
          </Link>
          <div className="mt-2 hidden items-center gap-4 md:flex">
            {navItems.map((items) => {
              return (
                <Link
                  data-umami-event={`nav-link-${items.label.toLowerCase()}`}
                  className="font-excon underline-offset-4 hover:cursor-pointer hover:underline"
                  href={items.href}
                  key={items.label}
                >
                  {items.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 md:gap-4">
          {isAdmin && (
            <Link href="/admin">
              <Button
                data-umami-event="nav-admin-panel-click"
                size="lg"
                className="gap-2 border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:text-white hover:shadow-[2px_2px_0px_0px_#000] dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:shadow-[4px_4px_0px_0px_#757373] dark:hover:shadow-[2px_2px_0px_0px_#757373]"
              >
                <AdminIcon className="size-4" />{" "}
                <span className="hidden md:block">Admin Panel</span>
              </Button>
            </Link>
          )}
          <WhatsappIcon />
          <Profile />
        </div>
      </nav>
    </>
  );
}
