"use client";

import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { XCircleIcon } from "@/components/icons/XCIrcleIcon";
import { SearchIcon } from "lucide-react";

export default function Search({ query }: { query: string }) {
  const router = useRouter();
  const [search, setSearch] = useState(query || "");
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    // Only trigger search if search term is different and either empty or at least 2 characters
    if (
      debouncedSearch !== query &&
      (debouncedSearch.length === 0 || debouncedSearch.length >= 2)
    ) {
      const searchParams = new URLSearchParams();
      if (debouncedSearch.trim()) {
        searchParams.set("query", debouncedSearch.trim());
      }
      router.push(
        `/notes${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
      );
    }
  }, [debouncedSearch, query, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const clearSearch = () => {
    setSearch("");
    router.push("/notes");
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
        <Input
          type="text"
          placeholder="Search notes by title or subject..."
          className="placeholder:text-muted-foreground pr-8 pl-10 shadow-none"
          value={search}
          onChange={handleInputChange}
        />
        {search && (
          <button
            onClick={clearSearch}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transform transition-colors"
          >
            <XCircleIcon className="h-4 w-4" />
          </button>
        )}
      </div>
      {search.length > 0 && search.length < 2 && (
        <p className="text-muted-foreground mt-1 text-xs">
          Type at least 2 characters to search
        </p>
      )}
    </div>
  );
}
