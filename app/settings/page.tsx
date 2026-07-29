"use client";

import { useEffect, useState } from "react";
import type { Holiday } from "@/types";

export default function SettingsPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [shamsiDate, setShamsiDate] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/holidays");
      if (res.ok) setHolidays(await res.json());
    } catch {
      /* */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addHoliday = async () => {
    if (!shamsiDate || !title) {
      setMsg("تاریخ و عنوان الزامی است");
      return;
    }
    try {
      const res = await fetch("/api/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shamsiDate, title, type: "personal" }),
      });
      if (!res.ok) throw new Error("خطا");
      setShamsiDate("");
      setTitle("");
      setMsg("ذخیره شد ✓");
      load();
    } catch {
      setMsg("خطا در ذخیره");
    }
  };

  const remove = async (id: string) => {
    await fetch(`/api/holidays?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">تنظیمات</h1>

      {/* Working hours info */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-medium">ساعات استاندارد کاری</h2>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>شنبه تا چهارشنبه: <strong>۷ ساعت و ۳۰ دقیقه</strong></li>
          <li>پنج‌شنبه: <strong>۶ ساعت و ۳۰ دقیقه</strong></li>
          <li>جمعه: تعطیل</li>
        </ul>
        <p className="mt-2 text-xs text-gray-400">
          میانگین روزانه ≈ ۷.۳۳ ساعت
        </p>
      </div>

      {/* Holidays */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-medium">تعطیلات اضافه</h2>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="1405/05/15"
            value={shamsiDate}
            onChange={(e) => setShamsiDate(e.target.value)}
            className="flex-1 rounded-lg border px-3 py-2 text-sm"
            dir="ltr"
          />
          <input
            type="text"
            placeholder="عنوان تعطیل"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 rounded-lg border px-3 py-2 text-sm"
          />
          <button
            onClick={addHoliday}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            افزودن
          </button>
        </div>
        {msg && <p className="mb-2 text-sm text-green-600">{msg}</p>}

        {loading ? (
          <p className="text-sm text-gray-400">در حال بارگذاری...</p>
        ) : holidays.length === 0 ? (
          <p className="text-sm text-gray-400">تعطیلی ثبت نشده</p>
        ) : (
          <ul className="divide-y">
            {holidays.map((h) => (
              <li
                key={h._id}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span>
                  <span className="font-mono text-gray-500" dir="ltr">
                    {h.shamsiDate}
                  </span>{" "}
                  — {h.title}
                </span>
                <button
                  onClick={() => h._id && remove(h._id)}
                  className="text-red-500 hover:underline"
                >
                  حذف
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
