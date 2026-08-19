import { ReactNode } from "react";

interface SectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function Section({
  title,
  subtitle,
  children,
}: SectionProps) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-2 text-sm text-slate-400">
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}