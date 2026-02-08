"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce"; // We might need to create this hook if it doesn't exist

interface SearchInputProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ onSearch, placeholder = "Cari data...", className }: SearchInputProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, 300);

    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <div className={`relative flex items-center w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 ${className}`}>
      <Search className="absolute left-3 h-4 w-4 text-slate-400" />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-9 border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-10 w-full"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
