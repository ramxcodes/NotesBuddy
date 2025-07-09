import Image from "next/image";
import { Link } from "next-view-transitions";
import Profile from "./Profile";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    href: "#pricing",
  },
];

export default function NavBar() {
  return (
    <nav className="dark:from-background dark:via-background dark:to-background/20 sticky top-0 z-10 flex items-center justify-between bg-gradient-to-b from-white via-white to-white/20 px-10 py-8">
      <div className="flex items-center gap-30">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Notes Buddy" width={40} height={40} />
          <h3 className="font-excon text-2xl font-bold">NotesBuddy</h3>
        </Link>
        <div className="mt-2 hidden items-center gap-4 md:flex">
          {navItems.map((items) => {
            return (
              <Link
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
      <div className="flex items-center justify-center gap-4">
        <Link
          className="mt-1 hover:cursor-pointer"
          target="_blank"
          href="https://chat.whatsapp.com/EcretA1N7eCFQeHecm1uWO"
        >
          <Tooltip>
            <TooltipTrigger>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 22 22"
              >
                <g
                  fill="none"
                  stroke="#00a81c"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                >
                  <path d="m3 21l1.65-3.8a9 9 0 1 1 3.4 2.9z" />
                  <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0za5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                </g>
              </svg>
            </TooltipTrigger>
            <TooltipContent className="font-excon">
              <p>Join our community</p>
            </TooltipContent>
          </Tooltip>
        </Link>
        <Profile />
      </div>
    </nav>
  );
}
