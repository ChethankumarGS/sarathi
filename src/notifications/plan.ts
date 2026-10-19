import { Scholarship, ReminderPreference } from '../types/scholarship';
import { reminderTimes, deadlinePassed } from '../utils/indiaDates';

export function planReminder(s: Scholarship | undefined, r: ReminderPreference, now = Date.now()) {
  const cycle = s?.cycles.find(c => c.mode === r.mode && c.academicYear === r.academicYear);
  const closesOn = cycle?.status === 'verified' ? cycle.closesOn : null;
  const deadlineOk = !!closesOn && !deadlinePassed(closesOn, now);
  const customTimestamp = r.customDate ? Date.parse(r.customDate) : NaN;
  const deadlineEnd = closesOn ? Date.parse(closesOn + 'T00:00:00+05:30') + 86400000 : Infinity;
  const custom = Number.isFinite(customTimestamp) && customTimestamp > now && customTimestamp < deadlineEnd
    ? [new Date(customTimestamp).toISOString()] : [];
  if (!deadlineOk && !custom.length) return { deadline: null, times: [], unavailable: true };
  const times = deadlineOk
    ? [...new Set([...reminderTimes(closesOn!, r.offsets, now), ...custom])].sort()
    : custom;
  return { deadline: deadlineOk ? closesOn : null, times, unavailable: false };
}
