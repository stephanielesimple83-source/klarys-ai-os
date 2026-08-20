import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

export default function Badge({
  children,
  variant = "default",
}: BadgeProps) {
  const styles = {
    default: "bg-slate-800 text-slate-300",
    success: "bg-emerald-500/10 text-emerald-400",
    warning: "bg-amber-500/10 text-amber-400",
    danger: "bg-rose-500/10 text-rose-400",
    info: "bg-cyan-500/10 text-cyan-400",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  );
}