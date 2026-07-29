"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  currentYearMonth,
  formatMonthTitle,
  getDaysInMonth,
  getDayNameFromShamsi,
  shiftMonth,
} from "@/lib/date-utils";
import type { TimeEntry, DayStatus } from "@/types";
import StatusBadge from "@/components/StatusBadge";

const statusColor: Record<string, string> = {
  "اضافه کار": "bg-green-200 border-green-400",
  "کم کاری": "bg-red-200 border-red-400",
  کامل: "bg-yellow-200 border-yellow-400",
  مرخصی: "bg-orange-200 border-orange-400",
  تعطیل: "bg-gray-200 border-gray-400",
  غایب: "bg-amber-200 border-amber-400",
  "اطلاعات هنوز وارد نشده": "bg-white border-gray-200",
};

export default function CalendarPage() {
  const [yearMonth, setYearMonth] = useState(currentYearMonth());
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/entries?yearMonth=${yearMonth}`);
        if (res.ok) setEntries(await res.json());
      } catch {
        /* */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [yearMonth]);

  const entryMap = new Map(entries.map((e) => [e.shamsiDate, e]));
  const days = getDaysInMonth(yearMonth);

  // Align first day to week start (شنبه)
  const firstDayName = getDayNameFromShamsi(days[0]);
  const dayOrder = [
    "شنبه",
    "یک شنبه",
    "دو شنبه",
    "سه شنبه",
    "چهار شنبه",
    "پنج شنبه",
    "جمعه",
  ];
  const offset = dayOrder.indexOf(firstDayName);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setYearMonth(shiftMonth(yearMonth, -1))}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            →
          </button>
          <h1 className="text-xl font-bold">{formatMonthTitle(yearMonth)}</h1>
          <button
            onClick={() => setYearMonth(shiftMonth(yearMonth, 1))}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            ←
          </button>
        </div>
        <Link
          href={`/month/${yearMonth.replace("/", "-")}`}
          className="text-sm text-blue-600 hover:underline"
        >
          مشاهده جدول ماهانه
        </Link>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500">
        {dayOrder.map((d) => (
          <div key={d} className="py-1">
            {d.replace(" شنبه", "").replace("شنبه", "ش")}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-xl bg-gray-200" />
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((shamsi) => {
            const entry = entryMap.get(shamsi);
            const dayName = getDayNameFromShamsi(shamsi);
            const status: DayStatus =
              entry?.status ||
              (dayName === "جمعه" ? "تعطیل" : "اطلاعات هنوز وارد نشده");
            const dayNum = shamsi.split("/")[2];
            const color = statusColor[status] || "bg-white border-gray-200";

            return (
              <Link
                key={shamsi}
                href={`/month/${yearMonth.replace("/", "-")}`}
                className={`flex min-h-[64px] flex-col items-center justify-center rounded-lg border p-1 text-center transition hover:ring-2 hover:ring-blue-300 ${color}`}
              >
                <span className="text-sm font-bold">{Number(dayNum)}</span>
                <span className="mt-0.5 scale-90">
                  <StatusBadge status={status} />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
