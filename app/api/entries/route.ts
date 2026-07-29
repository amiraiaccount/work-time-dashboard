import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TimeEntry from "@/models/TimeEntry";
import {
  getDayNameFromShamsi,
  shamsiToDate,
  getYearMonth,
} from "@/lib/date-utils";
import { recalculate } from "@/lib/time-utils";
import type { AttendanceType, TimePair } from "@/types";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const yearMonth = req.nextUrl.searchParams.get("yearMonth");

    if (!yearMonth || !/^\d{4}\/\d{2}$/.test(yearMonth)) {
      return NextResponse.json(
        { error: "yearMonth required (e.g. 1405/05)" },
        { status: 400 }
      );
    }

    const entries = await TimeEntry.find({
      shamsiDate: { $regex: `^${yearMonth}` },
    })
      .sort({ shamsiDate: 1 })
      .lean();

    return NextResponse.json(entries);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      shamsiDate,
      entries = [],
      attendanceType = "حاضر",
      notes = "",
    } = body as {
      shamsiDate: string;
      entries?: TimePair[];
      attendanceType?: AttendanceType;
      notes?: string;
    };

    if (!shamsiDate || !/^\d{4}\/\d{2}\/\d{2}$/.test(shamsiDate)) {
      return NextResponse.json(
        { error: "valid shamsiDate required" },
        { status: 400 }
      );
    }

    const dayName = getDayNameFromShamsi(shamsiDate);
    const miladiDate = shamsiToDate(shamsiDate);
    const { totalHours, expectedHours, status } = recalculate(
      entries,
      dayName,
      attendanceType
    );

    const doc = await TimeEntry.findOneAndUpdate(
      { shamsiDate },
      {
        shamsiDate,
        miladiDate,
        dayName,
        entries,
        totalHours,
        expectedHours,
        attendanceType,
        status,
        notes,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(doc);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
