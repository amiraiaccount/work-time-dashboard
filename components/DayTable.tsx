"use client";

import type { TimeEntry } from "@/types";
import { decimalToTime } from "@/lib/time-utils";
import StatusBadge from "./StatusBadge";

interface DayRow {
  shamsiDate: string;
  dayName: string;
  entry?: TimeEntry | null;
}

interface Props {
  rows: DayRow[];
  onDayClick: (row: DayRow) => void;
}

export default function DayTable({ rows, onDayClick }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b bg-slate-50 text-right text-xs text-gray-600">
            <th className="px-3 py-3 font-medium">روز</th>
            <th className="px-3 py-3 font-medium">تاریخ</th>
            <th className="px-3 py-3 font-medium">ورود / خروج</th>
            <th className="px-3 py-3 font-medium">کارکرد</th>
            <th className="px-3 py-3 font-medium">استاندارد</th>
            <th className="px-3 py-3 font-medium">وضعیت</th>
            <th className="px-3 py-3 font-medium">حضور</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const e = row.entry;
            const isFriday = row.dayName === "جمعه";
            const bg = isFriday
              ? "bg-gray-50"
              : e?.attendanceType === "مرخصی"
                ? "bg-orange-50"
                : e?.attendanceType === "تعطیل"
                  ? "bg-gray-100"
                  : e?.attendanceType === "غایب"
                    ? "bg-amber-50"
                    : "";

            const pairsText =
              e?.entries
                ?.filter((p) => p.in || p.out)
                .map((p) => `${p.in || "—"} → ${p.out || "—"}`)
                .join(" | ") || "—";

            return (
              <tr
                key={row.shamsiDate}
                onClick={() => onDayClick(row)}
                className={`cursor-pointer border-b border-gray-100 transition hover:bg-blue-50 ${bg}`}
              >
                <td className="px-3 py-2.5 font-medium">{row.dayName}</td>
                <td className="px-3 py-2.5 text-gray-600" dir="ltr">
                  {row.shamsiDate}
                </td>
                <td className="px-3 py-2.5 text-xs text-gray-700" dir="ltr">
                  {pairsText}
                </td>
                <td className="px-3 py-2.5 font-medium" dir="ltr">
                  {e ? decimalToTime(e.totalHours) : "—"}
                </td>
                <td className="px-3 py-2.5 text-gray-500" dir="ltr">
                  {e
                    ? decimalToTime(e.expectedHours)
                    : isFriday
                      ? "0:00"
                      : "—"}
                </td>
                <td className="px-3 py-2.5">
                  {e ? (
                    <StatusBadge status={e.status} />
                  ) : isFriday ? (
                    <StatusBadge status="تعطیل" />
                  ) : (
                    <StatusBadge status="اطلاعات هنوز وارد نشده" />
                  )}
                </td>
                <td className="px-3 py-2.5 text-gray-600">
                  {e?.attendanceType || (isFriday ? "تعطیل" : "—")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
