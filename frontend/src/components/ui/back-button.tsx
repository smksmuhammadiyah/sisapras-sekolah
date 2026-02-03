"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  label?: string;
  className?: string;
}

export function BackButton({ label = "Kembali", className }: BackButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`gap-2 text-muted-foreground hover:text-foreground ${className}`}
      onClick={() => router.back()}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Button>
  );
}
