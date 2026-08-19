import type { ReactNode } from "react";

import Card from "@/components/ui/Card";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}

export default function ChartCard({
  title,
  subtitle,
  children,
  action,
}: ChartCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-sm text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        {action}
      </div>

      <div className="mt-6">
        {children}
      </div>
    </Card>
  );
}