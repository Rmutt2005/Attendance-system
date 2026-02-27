export const ATTENDANCE_ORDER = [
  "MORNING_IN",
  "LUNCH_OUT",
  "AFTERNOON_IN",
  "EVENING_OUT"
] as const;

export type AttendanceTypeValue = (typeof ATTENDANCE_ORDER)[number];

export const attendanceTypeLabel: Record<AttendanceTypeValue, string> = {
  MORNING_IN: "Morning In",
  LUNCH_OUT: "Lunch Out",
  AFTERNOON_IN: "Afternoon In",
  EVENING_OUT: "Evening Out"
};

export const isAttendanceTypeValue = (
  value: string
): value is AttendanceTypeValue => {
  return ATTENDANCE_ORDER.includes(value as AttendanceTypeValue);
};

const getBangkokDateParts = (date: Date) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Failed to determine Bangkok date parts.");
  }

  return { year, month, day };
};

export const getBangkokDayRange = (date: Date = new Date()) => {
  const { year, month, day } = getBangkokDateParts(date);
  const start = new Date(`${year}-${month}-${day}T00:00:00.000+07:00`);
  const end = new Date(`${year}-${month}-${day}T23:59:59.999+07:00`);
  return { start, end };
};
