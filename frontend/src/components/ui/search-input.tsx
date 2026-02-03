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
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-8 bg-white dark:bg-slate-950"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
