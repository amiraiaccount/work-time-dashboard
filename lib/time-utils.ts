import type { AttendanceType, DayName, DayStatus, TimePair } from "@/types";

/** Parse "08:20" or "8:20" to decimal hours */
export function timeToDecimal(time: string): number {
  if (!time || !time.includes(":")) return 0;
  const [h, m] = time.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return 0;
  return h + m / 60;
}

/** Decimal hours to "H:MM" */
export function decimalToTime(dec: number): string {
  if (dec === 0) return "0:00";
  const sign = dec < 0 ? "-" : "";
  const abs = Math.abs(dec);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `${sign}${h}:${String(m).padStart(2, "0")}`;
}

/** Calculate total worked hours from pairs (only complete pairs) */
export function calcTotalHours(entries: TimePair[]): number {
  let total = 0;
  for (const pair of entries) {
    if (pair.in && pair.out) {
      const start = timeToDecimal(pair.in);
      const end = timeToDecimal(pair.out);
      // handle overnight (rare but safe)
      const diff = end >= start ? end - start : 24 - start + end;
      if (diff > 0) total += diff;
    }
  }
  return Math.round(total * 100) / 100; // 2 decimal places
}

/** Expected hours based on day name + attendance type */
export function calcExpectedHours(
  dayName: DayName,
  attendanceType: AttendanceType
): number {
  if (
    dayName === "جمعه" ||
    attendanceType === "مرخصی" ||
    attendanceType === "تعطیل"
  ) {
    return 0;
  }
  if (dayName === "پنج شنبه") return 6.5;
  return 7.5; // شنبه تا چهارشنبه
}

/** Determine status */
export function calcStatus(
  totalHours: number,
  expectedHours: number,
  attendanceType: AttendanceType,
  dayName: DayName
): DayStatus {
  if (attendanceType === "مرخصی") return "مرخصی";
  if (dayName === "جمعه" || attendanceType === "تعطیل") return "تعطیل";
  if (attendanceType === "غایب") return "غایب";
  if (totalHours === 0) return "اطلاعات هنوز وارد نشده";
  if (totalHours > expectedHours) return "اضافه کار";
  if (totalHours < expectedHours) return "کم کاری";
  return "کامل";
}

/** Full recalculation helper */
export function recalculate(
  entries: TimePair[],
  dayName: DayName,
  attendanceType: AttendanceType
) {
  const totalHours = calcTotalHours(entries);
  const expectedHours = calcExpectedHours(dayName, attendanceType);
  const status = calcStatus(totalHours, expectedHours, attendanceType, dayName);
  return { totalHours, expectedHours, status };
}
