import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface GreetUserProps {
  name: string | null;
  image: string | null;
  email: string | null;
}

const Quotes = [
  "All the best for your exams!",
  "Good luck with your exams!",
  "Study well <3",
];

export default function GreetUser({ name, image, email }: GreetUserProps) {
  return (
    <div className="mb-8 flex flex-col items-start justify-center gap-2 rounded-2xl border p-2 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage src={image || ""} />
          <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-muted-foreground text-sm">{email}</p>
        </div>
      </div>
      <p className="text-sm">
        {Quotes[Math.floor(Math.random() * Quotes.length)]}
      </p>
    </div>
  );
}
