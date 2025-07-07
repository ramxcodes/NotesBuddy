"use client";

import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

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
    <Input
      type="text"
      placeholder="Search"
      className="max-w-md"
      value={search}
      onChange={handleInputChange}
    />
  );
}
