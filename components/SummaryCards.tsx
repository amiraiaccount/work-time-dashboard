"use client";

import type { MonthSummary } from "@/types";
import { decimalToTime } from "@/lib/time-utils";

interface Props {
  summary: MonthSummary | null;
  loading?: boolean;
}

export default function SummaryCards({ summary, loading }: Props) {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-gray-200"
          />
        ))}
      </div>
    );
  }

  const diffColor =
    summary.difference > 0
      ? "text-green-600"
      : summary.difference < 0
        ? "text-red-600"
        : "text-gray-700";

  const cards = [
    {
      label: "روز کاری مورد انتظار",
      value: summary.expectedDays,
      sub: "روز",
    },
    {
      label: "ساعت استاندارد",
      value: decimalToTime(summary.expectedHours),
      sub: "ساعت",
    },
    {
      label: "ساعت کارکرد واقعی",
      value: decimalToTime(summary.actualHours),
      sub: "ساعت",
    },
    {
      label: "اختلاف",
      value: decimalToTime(summary.difference),
      sub: summary.difference >= 0 ? "اضافه" : "کمبود",
      color: diffColor,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <p className="text-xs text-gray-500">{c.label}</p>
          <p className={`mt-1 text-2xl font-bold ${c.color || "text-gray-900"}`}>
            {c.value}
          </p>
          <p className="text-xs text-gray-400">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}
