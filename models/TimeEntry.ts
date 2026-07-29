import mongoose, { Schema, models, model } from "mongoose";
import type { AttendanceType, DayName, DayStatus, TimePair } from "@/types";

export interface ITimeEntry {
  shamsiDate: string;
  miladiDate: Date;
  dayName: DayName;
  entries: TimePair[];
  totalHours: number;
  expectedHours: number;
  attendanceType: AttendanceType;
  status: DayStatus;
  notes?: string;
}

const TimePairSchema = new Schema(
  {
    in: { type: String, default: "" },
    out: { type: String, default: "" },
  },
  { _id: false }
);

const TimeEntrySchema = new Schema<ITimeEntry>(
  {
    shamsiDate: { type: String, required: true, unique: true, index: true },
    miladiDate: { type: Date, required: true },
    dayName: {
      type: String,
      required: true,
      enum: [
        "شنبه",
        "یک شنبه",
        "دو شنبه",
        "سه شنبه",
        "چهار شنبه",
        "پنج شنبه",
        "جمعه",
      ],
    },
    entries: { type: [TimePairSchema], default: [] },
    totalHours: { type: Number, default: 0 },
    expectedHours: { type: Number, default: 0 },
    attendanceType: {
      type: String,
      enum: ["حاضر", "مرخصی", "تعطیل", "غایب"],
      default: "حاضر",
    },
    status: {
      type: String,
      enum: [
        "اضافه کار",
        "کم کاری",
        "کامل",
        "مرخصی",
        "تعطیل",
        "غایب",
        "اطلاعات هنوز وارد نشده",
      ],
      default: "اطلاعات هنوز وارد نشده",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Index for monthly queries
TimeEntrySchema.index({ shamsiDate: 1 });

const TimeEntry =
  models.TimeEntry || model<ITimeEntry>("TimeEntry", TimeEntrySchema);

export default TimeEntry;
