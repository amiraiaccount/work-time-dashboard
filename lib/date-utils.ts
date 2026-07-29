import jalaali from "jalaali-js";
import type { DayName } from "@/types";

const DAY_NAME_MAP: DayName[] = [
  "یک شنبه", // JS Sunday = 0
  "دو شنبه",
  "سه شنبه",
  "چهار شنبه",
  "پنج شنبه",
  "جمعه",
  "شنبه", // JS Saturday = 6
];

/** Convert JS Date to shamsi string "1405/05/03" */
export function toShamsi(date: Date): string {
  const { jy, jm, jd } = jalaali.toJalaali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
  return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
}

/** Parse "1405/05/03" to { jy, jm, jd } */
export function parseShamsi(shamsi: string): { jy: number; jm: number; jd: number } {
  const [jy, jm, jd] = shamsi.split("/").map(Number);
  return { jy, jm, jd };
}

/** Convert shamsi string to JS Date (local midnight) */
export function shamsiToDate(shamsi: string): Date {
  const { jy, jm, jd } = parseShamsi(shamsi);
  const g = jalaali.toGregorian(jy, jm, jd);
  return new Date(g.gy, g.gm - 1, g.gd);
}

/** Get day name from a Date */
export function getDayName(date: Date): DayName {
  return DAY_NAME_MAP[date.getDay()];
}

/** Get day name from shamsi string */
export function getDayNameFromShamsi(shamsi: string): DayName {
  return getDayName(shamsiToDate(shamsi));
}

/** Extract yearMonth "1405/05" from shamsiDate */
export function getYearMonth(shamsiDate: string): string {
  return shamsiDate.slice(0, 7);
}

/** Persian month names */
export const PERSIAN_MONTHS = [
  "",
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

export function formatMonthTitle(yearMonth: string): string {
  const [y, m] = yearMonth.split("/").map(Number);
  return `${PERSIAN_MONTHS[m]} ${y}`;
}

/** Get all days of a shamsi month as array of shamsiDate strings */
export function getDaysInMonth(yearMonth: string): string[] {
  const [jy, jm] = yearMonth.split("/").map(Number);
  const daysCount = jalaali.jalaaliMonthLength(jy, jm);
  const days: string[] = [];
  for (let d = 1; d <= daysCount; d++) {
    days.push(
      `${jy}/${String(jm).padStart(2, "0")}/${String(d).padStart(2, "0")}`
    );
  }
  return days;
}

/** Previous / next yearMonth */
export function shiftMonth(yearMonth: string, delta: number): string {
  const [jy, jm] = yearMonth.split("/").map(Number);
  let newJm = jm + delta;
  let newJy = jy;
  while (newJm > 12) {
    newJm -= 12;
    newJy += 1;
  }
  while (newJm < 1) {
    newJm += 12;
    newJy -= 1;
  }
  return `${newJy}/${String(newJm).padStart(2, "0")}`;
}

/** Current shamsi yearMonth */
export function currentYearMonth(): string {
  return getYearMonth(toShamsi(new Date()));
}
