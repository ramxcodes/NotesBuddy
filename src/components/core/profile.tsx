import { getSession } from "@/lib/db/user";
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

export default async function Profile() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="flex items-center justify-center gap-4">
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
      <DropdownMenuContent className="mt-2 mr-4 md:mr-10">
        <DropdownMenuLabel>
          <p className="font-excon text-sm">Hi, {userFirstName}!</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/profile">
          <DropdownMenuItem className="hover:cursor-pointer">
            <UserIcon />
            Profile
          </DropdownMenuItem>
        </Link>
        <Link href="/notes">
          <DropdownMenuItem className="hover:cursor-pointer">
            <NotesbookIcon />
            Notes
          </DropdownMenuItem>
        </Link>
         <Link href="/quiz">
          <DropdownMenuItem className="hover:cursor-pointer">
            <QuestionMarkIcon className="size-4" />
            Quiz
          </DropdownMenuItem>
        </Link>
         <Link href="/flashcards">
          <DropdownMenuItem className="hover:cursor-pointer">
            <CardsIcon className="size-4" />
            Flashcards
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center justify-center">
          <ThemeToggle />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <ReportButton />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <SignOutIcon className="text-red-500" />
          <LogOutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
