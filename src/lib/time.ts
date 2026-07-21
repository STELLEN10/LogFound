/**
 * Time formatting helpers shared by server and client components.
 * Values are intentionally formatted with the browser/runtime locale so the
 * workspace always reflects the founder's local timezone.
 */

export type TimeInput = Date | string | number;

function toDate(value: TimeInput): Date {
  return value instanceof Date ? value : new Date(value);
}

function validDate(value: TimeInput): Date | null {
  const date = toDate(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: TimeInput): string {
  const date = validDate(value);
  return date
    ? new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date)
    : "Unknown date";
}

export function formatDayOfWeek(value: TimeInput): string {
  const date = validDate(value);
  return date
    ? new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(date)
    : "Unknown day";
}

export function formatTime(value: TimeInput): string {
  const date = validDate(value);
  return date
    ? new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(date)
    : "--:--:--";
}

export function formatTimezone(value: TimeInput): string {
  const date = validDate(value);
  if (!date) return "Local time";

  const formatter = new Intl.DateTimeFormat("en-ZA", {
    timeZoneName: "short",
  });
  const part = formatter
    .formatToParts(date)
    .find((item) => item.type === "timeZoneName")?.value;
  if (part && !/^GMT[+-]\d/.test(part)) return part;

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (timezone === "Africa/Johannesburg") return "SAST";
  if (timezone === "UTC" || timezone === "Etc/UTC") return "UTC";
  return part || timezone || "Local time";
}

export function formatRelativeTime(value: TimeInput, now: TimeInput = new Date()): string {
  const date = validDate(value);
  const reference = validDate(now);
  if (!date || !reference) return "Unknown time";

  const difference = (date.getTime() - reference.getTime()) / 1000;
  const absolute = Math.abs(difference);
  if (absolute < 10) return "just now";

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
    ["second", 1],
  ];
  const [unit, seconds] = units.find(([, size]) => absolute >= size) || ["second", 1];
  const amount = Math.round(difference / seconds);
  return new Intl.RelativeTimeFormat(undefined, { numeric: "always" }).format(amount, unit);
}

