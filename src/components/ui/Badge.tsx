import type { HTMLAttributes, ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
}

export default function Badge({
  children,
  className = "",
  variant = "default",
  ...props
}: BadgeProps) {
 const variants: Record<BadgeVariant, string> = {
  default:
    "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
  secondary:
    "border-slate-700 bg-slate-800 text-slate-300",
  destructive:
    "border-rose-500/20 bg-rose-500/10 text-rose-300",
  outline:
    "border-slate-700 bg-transparent text-slate-300",
  success:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
};

  return (
    <span
      {...props}
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export { Badge };