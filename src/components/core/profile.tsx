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
import LogOutButton from "../auth/log-out-button";
import { SignInButton } from "../auth/sign-in-button";

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
        <DropdownMenuItem>
          <svg
            width="50"
            height="50"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.53206 15.9281C4.70522 13.0963 7.4686 11.25 10.5338 11.25H13.4565C16.5216 11.25 19.285 13.0963 20.4582 15.9281V15.9281C21.6067 18.7004 19.5692 21.75 16.5683 21.75H7.42189C4.42108 21.75 2.38353 18.7004 3.53206 15.9281V15.9281Z"
              fill="currentColor"
            ></path>
            <path
              d="M8.25 6C8.25 3.92893 9.92893 2.25 12 2.25C14.0711 2.25 15.75 3.92893 15.75 6C15.75 8.07107 14.0711 9.75 12 9.75C9.92893 9.75 8.25 8.07107 8.25 6Z"
              fill="currentColor"
            ></path>
          </svg>
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <svg
            width="50"
            height="50"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M13.55 3H15.85C17.1624 3 17.8186 3 18.2786 3.33422C18.4272 3.44216 18.5578 3.57281 18.6658 3.72138C19 4.18139 19 4.83759 19 6.15V14.85C19 16.1624 19 16.8186 18.6658 17.2786C18.5578 17.4272 18.4272 17.5578 18.2786 17.6658C17.8186 18 17.1624 18 15.85 18H5V11.55C5 7.98775 5 6.20663 5.90717 4.95802C6.20015 4.55477 6.55477 4.20015 6.95802 3.90717C8.20663 3 9.98775 3 13.55 3ZM9 6.25C8.58579 6.25 8.25 6.58579 8.25 7C8.25 7.41421 8.58579 7.75 9 7.75H15C15.4142 7.75 15.75 7.41421 15.75 7C15.75 6.58579 15.4142 6.25 15 6.25H9ZM9 9.25C8.58579 9.25 8.25 9.58579 8.25 10C8.25 10.4142 8.58579 10.75 9 10.75H13C13.4142 10.75 13.75 10.4142 13.75 10C13.75 9.58579 13.4142 9.25 13 9.25H9Z"
              fill="currentColor"
            ></path>
            <path
              d="M5 19V10.2C5 7.20021 5 5.70032 5.76393 4.64886C6.01065 4.30928 6.30928 4.01065 6.64886 3.76393C7.70032 3 9.20021 3 12.2 3H17.2C17.9499 3 18.3249 3 18.5878 3.19098C18.6727 3.25266 18.7473 3.32732 18.809 3.41221C19 3.67508 19 4.05005 19 4.8V19M6.5 21H17.5C17.9659 21 18.1989 21 18.3827 20.9239C18.6277 20.8224 18.8224 20.6277 18.9239 20.3827C19 20.1989 19 19.9659 19 19.5V19.5C19 19.0341 19 18.8011 18.9239 18.6173C18.8224 18.3723 18.6277 18.1776 18.3827 18.0761C18.1989 18 17.9659 18 17.5 18H6.5C5.67157 18 5 18.6716 5 19.5V19.5C5 20.3284 5.67157 21 6.5 21Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
          <Link href="/notes">Notes</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center justify-center">
          <ThemeToggle />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <svg
            width="50"
            height="50"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9 2.25H9.79167C11.8526 2.25 12.883 2.25 13.6732 2.644C14.402 3.00734 14.9927 3.59801 15.356 4.32676C15.75 5.11699 15.75 6.14744 15.75 8.20833V11.25H12C11.5858 11.25 11.25 11.5858 11.25 12C11.25 12.4142 11.5858 12.75 12 12.75H15.75V15C15.75 17.8123 15.75 19.2185 15.0338 20.2042C14.8025 20.5226 14.5225 20.8025 14.2042 21.0338C13.2184 21.75 11.8123 21.75 9 21.75C6.1877 21.75 4.78155 21.75 3.79581 21.0338C3.47745 20.8025 3.19748 20.5226 2.96619 20.2042C2.25 19.2185 2.25 17.8123 2.25 15V9C2.25 6.1877 2.25 4.78155 2.96619 3.79581C3.19748 3.47745 3.47745 3.19748 3.79581 2.96619C4.78155 2.25 6.1877 2.25 9 2.25ZM15.75 12.75H19.1893L17.9697 13.9697C17.6768 14.2626 17.6768 14.7374 17.9697 15.0303C18.2626 15.3232 18.7374 15.3232 19.0303 15.0303L21.5303 12.5303C21.8232 12.2374 21.8232 11.7626 21.5303 11.4697L19.0303 8.96967C18.7374 8.67678 18.2626 8.67678 17.9697 8.96967C17.6768 9.26256 17.6768 9.73744 17.9697 10.0303L19.1893 11.25H15.75V12.75Z"
              fill="#bc3434"
            ></path>
          </svg>
          <LogOutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
