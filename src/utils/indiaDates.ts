export function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const timestamp = Date.parse(value + 'T00:00:00Z');
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value;
}
export const dateLabel = (d: string) => new Date(d+'T00:00:00+05:30').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kolkata'});
export function reminderTimes(deadline: string, offsets: number[], now = Date.now()) {
  if (!isCalendarDate(deadline)) return [];
  const base = Date.parse(deadline + 'T09:00:00+05:30');
  return [...new Set(offsets)]
    .filter(n => Number.isSafeInteger(n) && n >= 0)
    .map(n => base - n * 86400000)
    .filter(t => Number.isFinite(t) && t > now && t >= -8640000000000000 && t <= 8640000000000000)
    .map(t => new Date(t).toISOString());
}
export const deadlinePassed = (d: string, now = Date.now()) =>
  !isCalendarDate(d) || now >= Date.parse(d + 'T00:00:00+05:30') + 86400000;
