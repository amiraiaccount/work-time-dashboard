"use client";

import { useState, useEffect } from "react";
import type { AttendanceType, TimeEntry, TimePair } from "@/types";
import { ATTENDANCE_TYPES } from "@/types";
import { decimalToTime } from "@/lib/time-utils";

interface Props {
  open: boolean;
  onClose: () => void;
  day: {
    shamsiDate: string;
    dayName: string;
    existing?: TimeEntry | null;
  };
  onSaved: () => void;
}

export default function EntryModal({ open, onClose, day, onSaved }: Props) {
  const [attendanceType, setAttendanceType] = useState<AttendanceType>("حاضر");
  const [pairs, setPairs] = useState<TimePair[]>([{ in: "", out: "" }]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (day.existing) {
      setAttendanceType(day.existing.attendanceType || "حاضر");
      setPairs(
        day.existing.entries?.length
          ? day.existing.entries
          : [{ in: "", out: "" }]
      );
      setNotes(day.existing.notes || "");
    } else {
      setAttendanceType("حاضر");
      setPairs([{ in: "", out: "" }]);
      setNotes("");
    }
    setError("");
  }, [day, open]);

  if (!open) return null;

  const addPair = () => {
    if (pairs.length < 5) setPairs([...pairs, { in: "", out: "" }]);
  };

  const updatePair = (idx: number, field: "in" | "out", value: string) => {
    const next = [...pairs];
    next[idx] = { ...next[idx], [field]: value };
    setPairs(next);
  };

  const removePair = (idx: number) => {
    if (pairs.length === 1) return;
    setPairs(pairs.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const cleaned = pairs.filter((p) => p.in || p.out);
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shamsiDate: day.shamsiDate,
          entries: cleaned,
          attendanceType,
          notes,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "خطا در ذخیره");
      }
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {day.dayName} — {day.shamsiDate}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Attendance type */}
        <label className="mb-1 block text-sm text-gray-600">نوع حضور</label>
        <select
          value={attendanceType}
          onChange={(e) =>
            setAttendanceType(e.target.value as AttendanceType)
          }
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          {ATTENDANCE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Time pairs */}
        <label className="mb-1 block text-sm text-gray-600">
          ورود / خروج
        </label>
        <div className="space-y-2">
          {pairs.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="time"
                value={p.in}
                onChange={(e) => updatePair(i, "in", e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5"
                disabled={
                  attendanceType === "مرخصی" || attendanceType === "تعطیل"
                }
              />
              <span className="text-gray-400">→</span>
              <input
                type="time"
                value={p.out}
                onChange={(e) => updatePair(i, "out", e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5"
                disabled={
                  attendanceType === "مرخصی" || attendanceType === "تعطیل"
                }
              />
              {pairs.length > 1 && (
                <button
                  onClick={() => removePair(i)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {pairs.length < 5 &&
          attendanceType !== "مرخصی" &&
          attendanceType !== "تعطیل" && (
            <button
              onClick={addPair}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              + افزودن بازه زمانی
            </button>
          )}

        {/* Notes */}
        <label className="mb-1 mt-4 block text-sm text-gray-600">یادداشت</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          placeholder="اختیاری..."
        />

        {day.existing && (
          <p className="mt-2 text-xs text-gray-500">
            کارکرد فعلی: {decimalToTime(day.existing.totalHours)} از{" "}
            {decimalToTime(day.existing.expectedHours)}
          </p>
        )}

        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}

        <div className="mt-5 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-xl bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "در حال ذخیره..." : "ذخیره"}
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-4 py-2.5 hover:bg-gray-50"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}
