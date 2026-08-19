import { ReactNode } from "react";

interface PageHeaderProps {
  badge?: string;
  title: string;
  description: string;
  rightContent?: ReactNode;
}

export default function PageHeader({
  badge,
  title,
  description,
  rightContent,
}: PageHeaderProps) {
  return (
    <section className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
      <div>
        {badge && (
          <p className="text-sm font-medium text-cyan-400">
            {badge}
          </p>
        )}

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
          {title}
        </h1>

        <p className="mt-2 max-w-3xl text-slate-400">
          {description}
        </p>
      </div>

      {rightContent}
    </section>
  );
}