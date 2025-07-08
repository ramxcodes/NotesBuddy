"use client";

import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { XIcon } from "@phosphor-icons/react";

export default function Search({ query }: { query: string }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (debouncedSearch !== query) {
      router.push(`/notes?query=${debouncedSearch}`);
    }
  }, [debouncedSearch, query, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div className="relative w-full max-w-md">
      <Input
        type="text"
        placeholder="Search"
        className="pr-8 placeholder:text-muted-foreground shadow-none"
        value={search}
        onChange={handleInputChange}
      />
      {search && (
        <span
          className="text-muted-foreground absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer"
          onClick={() => setSearch("")}
        >
          <XIcon className="text-muted-foreground" size={20} />
        </span>
      )}
    </div>
  );
}
