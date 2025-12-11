"use client";

import { cn } from "./cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50";
  const sizes =
    size === "sm"
      ? "px-3 py-2 text-xs"
      : size === "lg"
      ? "px-5 py-3 text-sm"
      : "px-4 py-2 text-sm";

  const variants = {
    primary: "bg-black text-white hover:bg-black/90",
    outline: "border bg-white hover:bg-gray-50",
    ghost: "hover:bg-gray-100",
    danger: "border text-red-600 hover:bg-red-50",
  };

  return (
    <button
      className={cn(base, sizes, variants[variant], className)}
      {...props}
    />
  );
}
