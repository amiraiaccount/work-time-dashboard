"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SummaryCards from "@/components/SummaryCards";
import {
  currentYearMonth,
  formatMonthTitle,
  shiftMonth,
} from "@/lib/date-utils";
import { decimalToTime } from "@/lib/time-utils";
import type { MonthSummary } from "@/types";

export default function DashboardPage() {
  const [current, setCurrent] = useState(currentYearMonth());
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState<
    { yearMonth: string; summary: MonthSummary }[]
  >([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/summary?yearMonth=${current}`);
        if (res.ok) setSummary(await res.json());
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [current]);

  useEffect(() => {
    async function loadRecent() {
      const months: string[] = [];
      let ym = currentYearMonth();
      for (let i = 0; i < 4; i++) {
        months.push(ym);
        ym = shiftMonth(ym, -1);
      }
      const results = await Promise.all(
        months.map(async (m) => {
          try {
            const res = await fetch(`/api/summary?yearMonth=${m}`);
            if (res.ok) return { yearMonth: m, summary: await res.json() };
          } catch {
            /* */
          }
          return null;
        })
      );
      setRecent(
        results.filter(Boolean) as { yearMonth: string; summary: MonthSummary }[]
      );
    }
    loadRecent();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">داشبورد</h1>
        <Link
          href={`/month/${current.replace("/", "-")}`}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          مشاهده ماه جاری ←
        </Link>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-gray-500">
          خلاصه {formatMonthTitle(current)}
        </h2>
        <SummaryCards summary={summary} loading={loading} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-gray-500">ماه‌های اخیر</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {recent.map(({ yearMonth, summary: s }) => (
            <Link
              key={yearMonth}
              href={`/month/${yearMonth.replace("/", "-")}`}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{formatMonthTitle(yearMonth)}</span>
                <span
                  className={`text-sm font-bold ${
                    s.difference > 0
                      ? "text-green-600"
                      : s.difference < 0
                        ? "text-red-600"
                        : "text-gray-600"
                  }`}
                >
                  {decimalToTime(s.difference)}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                واقعی {decimalToTime(s.actualHours)} از{" "}
                {decimalToTime(s.expectedHours)} • اضافه‌کار {s.overtimeDays} •
                کم‌کاری {s.underworkDays}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
