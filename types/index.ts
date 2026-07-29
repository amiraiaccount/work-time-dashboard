export type AttendanceType = "حاضر" | "مرخصی" | "تعطیل" | "غایب";
export type DayStatus =
  | "اضافه کار"
  | "کم کاری"
  | "کامل"
  | "مرخصی"
  | "تعطیل"
  | "غایب"
  | "اطلاعات هنوز وارد نشده";

export type DayName =
  | "شنبه"
  | "یک شنبه"
  | "دو شنبه"
  | "سه شنبه"
  | "چهار شنبه"
  | "پنج شنبه"
  | "جمعه";

export interface TimePair {
  in: string; // "08:20"
  out: string; // "15:30"
}

export interface TimeEntry {
  _id?: string;
  shamsiDate: string; // "1405/05/03"
  miladiDate: string | Date;
  dayName: DayName;
  entries: TimePair[];
  totalHours: number;
  expectedHours: number;
  attendanceType: AttendanceType;
  status: DayStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Holiday {
  _id?: string;
  shamsiDate: string;
  title: string;
  type: "official" | "personal";
}

export interface MonthSummary {
  yearMonth: string; // "1405/05"
  expectedDays: number;
  expectedHours: number;
  actualHours: number;
  difference: number;
  overtimeDays: number;
  underworkDays: number;
  leaveDays: number;
  holidayDays: number;
}

export const DAY_NAMES: DayName[] = [
  "شنبه",
  "یک شنبه",
  "دو شنبه",
  "سه شنبه",
  "چهار شنبه",
  "پنج شنبه",
  "جمعه",
];

export const ATTENDANCE_TYPES: AttendanceType[] = [
  "حاضر",
  "مرخصی",
  "تعطیل",
  "غایب",
];
