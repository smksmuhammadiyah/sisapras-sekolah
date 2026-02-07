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
  // Simple internal debounce if hook not available, but let's assume we implement it or use simple timeout

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, 300);

    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-9 bg-white dark:bg-slate-950"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
