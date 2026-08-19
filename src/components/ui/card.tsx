import type {
  ComponentPropsWithoutRef,
  ReactNode,
} from "react";

interface CardProps
  extends ComponentPropsWithoutRef<"article"> {
  children: ReactNode;
}

export default function Card({
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <article
      {...props}
      className={`rounded-3xl border border-slate-800 bg-slate-900 shadow-sm ${className}`}
    >
      {children}
    </article>
  );
}