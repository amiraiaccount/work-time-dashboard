import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TimeEntry from "@/models/TimeEntry";
import { getDaysInMonth, getDayNameFromShamsi } from "@/lib/date-utils";
import { calcExpectedHours } from "@/lib/time-utils";
import type { MonthSummary } from "@/types";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const yearMonth = req.nextUrl.searchParams.get("yearMonth");

    if (!yearMonth || !/^\d{4}\/\d{2}$/.test(yearMonth)) {
      return NextResponse.json(
        { error: "yearMonth required" },
        { status: 400 }
      );
    }

    const entries = await TimeEntry.find({
      shamsiDate: { $regex: `^${yearMonth}` },
    }).lean();

    const entryMap = new Map(entries.map((e) => [e.shamsiDate, e]));

    // Build expected from calendar (even days without record)
    const allDays = getDaysInMonth(yearMonth);
    let expectedDays = 0;
    let expectedHours = 0;
    let actualHours = 0;
    let overtimeDays = 0;
    let underworkDays = 0;
    let leaveDays = 0;
    let holidayDays = 0;

    for (const day of allDays) {
      const dayName = getDayNameFromShamsi(day);
      const rec = entryMap.get(day);

      if (rec) {
        expectedHours += rec.expectedHours;
        actualHours += rec.totalHours;
        if (rec.expectedHours > 0) expectedDays += 1;
        if (rec.status === "اضافه کار") overtimeDays += 1;
        if (rec.status === "کم کاری") underworkDays += 1;
        if (rec.status === "مرخصی") leaveDays += 1;
        if (rec.status === "تعطیل") holidayDays += 1;
      } else {
        // No record yet → still count standard expected
        const exp = calcExpectedHours(dayName, "حاضر");
        expectedHours += exp;
        if (exp > 0) expectedDays += 1;
        if (dayName === "جمعه") holidayDays += 1;
      }
    }

    const summary: MonthSummary = {
      yearMonth,
      expectedDays,
      expectedHours: Math.round(expectedHours * 100) / 100,
      actualHours: Math.round(actualHours * 100) / 100,
      difference: Math.round((actualHours - expectedHours) * 100) / 100,
      overtimeDays,
      underworkDays,
      leaveDays,
      holidayDays,
    };

    return NextResponse.json(summary);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
