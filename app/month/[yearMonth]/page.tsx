"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import SummaryCards from "@/components/SummaryCards";
import DayTable from "@/components/DayTable";
import EntryModal from "@/components/EntryModal";
import {
  formatMonthTitle,
  getDaysInMonth,
  getDayNameFromShamsi,
  shiftMonth,
} from "@/lib/date-utils";
import type { MonthSummary, TimeEntry } from "@/types";

export default function MonthPage() {
  const params = useParams();
  const router = useRouter();
  // URL uses 1405-05 → convert to 1405/05
  const yearMonth = String(params.yearMonth || "").replace("-", "/");

  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{
    open: boolean;
    shamsiDate: string;
    dayName: string;
    existing?: TimeEntry | null;
  }>({ open: false, shamsiDate: "", dayName: "" });

  const load = useCallback(async () => {
    if (!/^\d{4}\/\d{2}$/.test(yearMonth)) return;
    setLoading(true);
    try {
      const [sumRes, entRes] = await Promise.all([
        fetch(`/api/summary?yearMonth=${yearMonth}`),
        fetch(`/api/entries?yearMonth=${yearMonth}`),
      ]);
      if (sumRes.ok) setSummary(await sumRes.json());
      if (entRes.ok) setEntries(await entRes.json());
    } catch {
      /* */
    } finally {
      setLoading(false);
    }
  }, [yearMonth]);

  useEffect(() => {
    load();
  }, [load]);

  const entryMap = new Map(entries.map((e) => [e.shamsiDate, e]));
  const days = getDaysInMonth(yearMonth);
  const rows = days.map((shamsiDate) => ({
    shamsiDate,
    dayName: getDayNameFromShamsi(shamsiDate),
    entry: entryMap.get(shamsiDate) || null,
  }));

  const goMonth = (delta: number) => {
    const next = shiftMonth(yearMonth, delta).replace("/", "-");
    router.push(`/month/${next}`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => goMonth(-1)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            → ماه قبل
          </button>
          <h1 className="text-xl font-bold">{formatMonthTitle(yearMonth)}</h1>
          <button
            onClick={() => goMonth(1)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            ماه بعد ←
          </button>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-blue-600 hover:underline"
        >
          بازگشت به داشبورد
        </Link>
      </div>

      <SummaryCards summary={summary} loading={loading} />

      {loading ? (
        <div className="h-64 animate-pulse rounded-xl bg-gray-200" />
      ) : (
        <DayTable
          rows={rows}
          onDayClick={(row) =>
            setModal({
              open: true,
              shamsiDate: row.shamsiDate,
              dayName: row.dayName,
              existing: row.entry,
            })
          }
        />
      )}

      <EntryModal
        open={modal.open}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        day={{
          shamsiDate: modal.shamsiDate,
          dayName: modal.dayName,
          existing: modal.existing,
        }}
        onSaved={load}
      />
    </div>
  );
}
