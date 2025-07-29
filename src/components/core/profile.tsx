"use client";

import { useSession } from "@/lib/auth/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "next-view-transitions";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ThemeToggle } from "../ui/theme-toggle";
import LogOutButton from "../auth/LogOutButton";
import { SignInButton } from "../auth/SignInButton";
import { UserIcon } from "../icons/UserIcon";
import { NotesbookIcon } from "../icons/NotebookIcon";
import { SignOutIcon } from "../icons/SignOutIcon";
import ReportButton from "../navbar/ReportButton";
import QuestionMarkIcon from "../icons/QuestionMarkIcon";
import CardsIcon from "../icons/CardsIcon";
import AiIcon from "../icons/AiIcon";
import WhatsappDuoIcon from "../icons/WhatsappDuoIcon";

export default function Profile() {
  const { data: session, isPending } = useSession();

  // Show loading state while session is being fetched
  if (isPending) {
    return (
      <div className="ml-4 flex items-center justify-center gap-2 md:ml-0 md:gap-4">
        <ThemeToggle />
        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="ml-4 flex items-center justify-center gap-2 md:ml-0 md:gap-4">
        <ThemeToggle />
        <SignInButton />
      </div>
    );
  }

  const userFirstName = session.user.name?.split(" ")[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage src={session.user.image || ""} />
          <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-4 mr-4 w-44 md:mr-10">
        <DropdownMenuLabel>
          <p className="font-excon text-sm">Hi, {userFirstName}!</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/profile">
          <DropdownMenuItem
            data-umami-event="profile-dropdown-profile-click"
            className="hover:cursor-pointer"
          >
            <UserIcon />
            Profile
          </DropdownMenuItem>
        </Link>
        <Link href="/notes">
          <DropdownMenuItem
            data-umami-event="profile-dropdown-notes-click"
            className="hover:cursor-pointer"
          >
            <NotesbookIcon />
            Notes
          </DropdownMenuItem>
        </Link>
        <Link href="/quiz">
          <DropdownMenuItem
            data-umami-event="profile-dropdown-quiz-click"
            className="hover:cursor-pointer"
          >
            <QuestionMarkIcon className="size-4" />
            Quiz
          </DropdownMenuItem>
        </Link>
        <Link href="/flashcards">
          <DropdownMenuItem
            data-umami-event="profile-dropdown-flashcards-click"
            className="hover:cursor-pointer"
          >
            <CardsIcon className="size-4" />
            Flashcards
          </DropdownMenuItem>
        </Link>
        <Link href="/ai">
          <DropdownMenuItem
            data-umami-event="profile-dropdown-ai-assistant-click"
            className="hover:cursor-pointer"
          >
            <AiIcon className="size-4" />
            AI Assistant
          </DropdownMenuItem>
        </Link>
        <Link href="/ai">
          <DropdownMenuItem
            data-umami-event="profile-dropdown-Whatsapp-click"
            className="hover:cursor-pointer"
          >
            <WhatsappDuoIcon className="size-4" />
            Join Whatsapp!
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center justify-center">
          <div data-umami-event="profile-dropdown-theme-toggle-click">
            <ThemeToggle />
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <div data-umami-event="profile-dropdown-report-click">
            <ReportButton />
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <SignOutIcon className="text-red-500" />
          <div data-umami-event="profile-dropdown-logout-click">
            <LogOutButton />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
