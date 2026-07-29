import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TimeEntry from "@/models/TimeEntry";
import { recalculate } from "@/lib/time-utils";
import type { AttendanceType, TimePair } from "@/types";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      entries,
      attendanceType,
      notes,
    }: {
      entries?: TimePair[];
      attendanceType?: AttendanceType;
      notes?: string;
    } = body;

    const existing = await TimeEntry.findById(params.id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const newEntries = entries ?? existing.entries;
    const newType = attendanceType ?? existing.attendanceType;
    const dayName = existing.dayName;

    const { totalHours, expectedHours, status } = recalculate(
      newEntries,
      dayName,
      newType
    );

    existing.entries = newEntries;
    existing.attendanceType = newType;
    existing.totalHours = totalHours;
    existing.expectedHours = expectedHours;
    existing.status = status;
    if (notes !== undefined) existing.notes = notes;

    await existing.save();
    return NextResponse.json(existing);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const deleted = await TimeEntry.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
