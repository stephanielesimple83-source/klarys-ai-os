"use client";

import type { ReactNode } from "react";

import Card from "@/components/ui/Card";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export default function ChartCard({
  title,
  subtitle,
  children,
  action,
  footer,
  className = "",
}: ChartCardProps) {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
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

        {action && (
          <div className="shrink-0">
            {action}
          </div>
        )}
      </div>

      <div className="mt-6">
        {children}
      </div>

      {footer && (
        <div className="mt-6 border-t border-slate-800 pt-4">
          {footer}
        </div>
      )}
    </Card>
  );
}