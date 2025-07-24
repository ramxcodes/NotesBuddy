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
    <div className="relative w-full rounded-xl">
      <div className="relative border-4 border-black dark:border-white bg-white dark:bg-black shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#fff] transition-all duration-200 hover:shadow-[4px_4px_0px_0px_#000] dark:hover:shadow-[4px_4px_0px_0px_#fff] hover:translate-x-1 hover:translate-y-1 rounded-xl">
        <SearchIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-black dark:text-white" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search notes by title or subject..."
          className="border-0 bg-transparent pr-16 pl-12 text-black dark:text-white placeholder:text-black/70 dark:placeholder:text-white/70 shadow-none font-bold focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl"
          value={search}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {!isSearchOpen && !search && (
          <div className="absolute top-1/2 right-3 flex -translate-y-1/2 transform gap-1">
            <kbd className="bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white px-2 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
              {navigator.platform.toUpperCase().includes("MAC")
                ? "CMD"
                : "CTRL"}
            </kbd>
            <kbd className="bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white px-2 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
              K
            </kbd>
          </div>
        )}
        {search && (
          <button
            onClick={clearSearch}
            className="absolute top-1/2 right-3 -translate-y-1/2 transform text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200 hover:scale-110"
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      {search.length > 0 && search.length < 2 && (
        <p className="mt-2 text-sm font-bold text-black dark:text-white bg-gray-200 dark:bg-gray-800 border-2 border-black dark:border-white px-3 py-1 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] uppercase tracking-wide">
          Type at least 2 characters to search
        </p>
      )}
    </div>
  );
}
