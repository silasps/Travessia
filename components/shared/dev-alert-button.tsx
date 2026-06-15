"use client";

import { cn } from "@/lib/utils";

interface DevAlertButtonProps {
  message: string;
  className?: string;
  children: React.ReactNode;
  title?: string;
}

export function DevAlertButton({ message, className, children, title }: DevAlertButtonProps) {
  return (
    <button
      type="button"
      title={title}
      className={className}
      onClick={() => alert(message)}
    >
      {children}
    </button>
  );
}
