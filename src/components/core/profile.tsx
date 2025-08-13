"use client";

import { useSession } from "@/lib/auth/auth-client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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
import ReportButton from "./ReportButton";
import QuestionMarkIcon from "../icons/QuestionMarkIcon";
import CardsIcon from "../icons/CardsIcon";
import AiIcon from "../icons/AiIcon";
import WhatsappDuoIcon from "../icons/WhatsappDuoIcon";
import { checkUserOnboardingStatus } from "@/app/(auth)/onboarding/user-actions";

export default function Profile() {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const [isOnboarded, setIsOnboarded] = useState<boolean>(true);
  const isOnOnboardingPage = pathname === "/onboarding";

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (session?.user?.id) {
        try {
          const result = await checkUserOnboardingStatus();
          if (result.success) {
            setIsOnboarded(result.isOnboarded ?? false);
          } else {
            setIsOnboarded(false);
          }
        } catch {
          setIsOnboarded(false);
        }
      }
    };

    checkOnboardingStatus();
  }, [session?.user?.id]);

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
  const shouldShowOnboardingEffects = !isOnboarded && !isOnOnboardingPage;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar
          className={`cursor-pointer transition-all duration-200 ${
            shouldShowOnboardingEffects
              ? "relative before:absolute before:-inset-1 before:animate-ping before:rounded-full before:bg-red-500/60 before:duration-[2s] after:absolute after:-inset-2 after:animate-ping after:rounded-full after:bg-red-500/30 after:delay-500 after:duration-[2s]"
              : ""
          }`}
        >
          <AvatarImage src={session.user.image || ""} />
          <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-4 mr-4 w-44 md:mr-10">
        <DropdownMenuLabel>
          <p className="font-excon text-sm">Hi, {userFirstName}!</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!isOnboarded && !isOnOnboardingPage ? (
          <>
            <Link href="/onboarding">
              <DropdownMenuItem
                data-umami-event="profile-dropdown-complete-profile-click"
                className="border-l-4 border-red-500 bg-red-50 hover:cursor-pointer hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40"
              >
                <UserIcon className="text-red-600" />
                <span className="font-bold text-red-600">Complete Profile</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
          </>
        ) : (
          <Link href="/profile">
            <DropdownMenuItem
              data-umami-event="profile-dropdown-profile-click"
              className="hover:cursor-pointer"
            >
              <UserIcon />
              Profile
            </DropdownMenuItem>
          </Link>
        )}
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
        <Link
          target="_blank"
          href="https://chat.whatsapp.com/EcretA1N7eCFQeHecm1uWO"
        >
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
