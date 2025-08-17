import { Link } from "next-view-transitions";
import Profile from "./profile";
import Logo from "./Logo";
import WhatsappIcon from "../icons/WhatsappIcon";
import PromoBanner from "./PromoBanner";
import AdminButton from "../admin/core/AdminButton";

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
    href: "/premium",
  },
];

export default async function MainNav() {
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
          <AdminButton />
          <WhatsappIcon />
          <Profile />
        </div>
      </nav>
    </>
  );
}
