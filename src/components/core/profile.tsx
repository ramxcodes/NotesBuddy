import { getSession } from "@/lib/db/user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ThemeToggle } from "../ui/theme-toggle";
import LogOutButton from "../auth/LogOutButton";
import { SignInButton } from "../auth/SignInButton";
import { UserIcon } from "../icons/UserIcon";
import { NotesbookIcon } from "../icons/NotebookIcon";
import { SignOutIcon } from "../icons/SignOutIcon";

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
          <p className="font-excon text-sm">Hi, {session.user.name}!</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link className="hover:cursor-pointer" href="/profile">
          <DropdownMenuItem>
            <UserIcon />
            Profile
          </DropdownMenuItem>
        </Link>
        <Link className="hover:cursor-pointer" href="/notes">
          <DropdownMenuItem>
            <NotesbookIcon />
            Notes
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center justify-center">
          <ThemeToggle />
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
