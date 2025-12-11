"use client";

import { cn } from "./cn";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: Props) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none transition",
        "focus:border-black/50 focus:ring-2 focus:ring-black/10",
        className
      )}
      {...props}
    />
  );
}
