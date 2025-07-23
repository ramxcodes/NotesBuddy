"use client";

import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { useEffect, useState, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { XCircleIcon } from "@/components/icons/XCIrcleIcon";
import { SearchIcon } from "lucide-react";

export default function Search({ query }: { query: string }) {
  const router = useRouter();
  const [search, setSearch] = useState(query || "");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 500);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (
      debouncedSearch !== query &&
      (debouncedSearch.length === 0 || debouncedSearch.length >= 3)
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const clearSearch = () => {
    setSearch("");
    router.push("/notes");
  };

  const handleFocus = () => {
    setIsSearchOpen(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsSearchOpen(false);
    }, 100);
  };

  return (
    <div className="relative w-full">
      <div className="border-primary dark:border-secondary relative rounded-xl border-r-8 border-b-8 transition-all duration-300 hover:border-r-0 hover:border-b-0">
        <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search notes by title or subject..."
          className="placeholder:text-muted-foreground pr-16 pl-10 shadow-none"
          value={search}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {!isSearchOpen && !search && (
          <div className="absolute top-1/2 right-3 flex -translate-y-1/2 transform gap-1">
            <kbd className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs font-semibold">
              {navigator.platform.toUpperCase().includes("MAC")
                ? "CMD"
                : "CTRL"}
            </kbd>
            <kbd className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs font-semibold">
              K
            </kbd>
          </div>
        )}
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
