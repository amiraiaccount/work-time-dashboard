import mongoose, { Schema, models, model } from "mongoose";

export interface IHoliday {
  shamsiDate: string;
  title: string;
  type: "official" | "personal";
}

const HolidaySchema = new Schema<IHoliday>(
  {
    shamsiDate: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["official", "personal"],
      default: "personal",
    },
  },
  { timestamps: true }
);

const Holiday = models.Holiday || model<IHoliday>("Holiday", HolidaySchema);

export default Holiday;
