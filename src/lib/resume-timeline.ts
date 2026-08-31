export function getTimelineNodeProgress(
  nodeOffset: number,
  timelineLength: number,
) {
  if (timelineLength <= 0) return 0;
  return Math.min(Math.max(nodeOffset / timelineLength, 0), 1);
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function getDateParts(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return { year, month, day };
}

export function formatResumeDate(date: string) {
  const { year, month } = getDateParts(date);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function getResumeDuration(startDate: string, endDate: string) {
  const start = getDateParts(startDate);
  const end = getDateParts(endDate);
  const daysInEndMonth = new Date(Date.UTC(end.year, end.month, 0)).getUTCDate();
  const elapsedMonths = Math.max(
    Math.round(
      (end.year - start.year) * 12 +
        (end.month - start.month) +
        (end.day - start.day) / daysInEndMonth,
    ),
    0,
  );
  const years = Math.floor(elapsedMonths / 12);
  const months = elapsedMonths % 12;
  const parts: string[] = [];

  if (years > 0) parts.push(`${years} year${years === 1 ? "" : "s"}`);
  if (months > 0) parts.push(`${months} month${months === 1 ? "" : "s"}`);

  return parts.length > 0 ? `(${parts.join(", ")})` : "";
}
