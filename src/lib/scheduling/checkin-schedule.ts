/**
 * Delay 1 scheduling: every mother gets a default biweekly Saturday 2PM voice
 * call plus a weekly WhatsApp/SMS message, both individually adjustable.
 * Two independent cadences, each anchored to the mother's preferred weekday:
 *   - the call, every `checkinFrequencyDays` at `preferredCheckinHour`
 *   - the message, every 7 days at a fixed morning hour so it never competes
 *     with the call for the mother's attention
 */

export const DEFAULT_CHECKIN_FREQUENCY_DAYS = 14;
export const DEFAULT_CHECKIN_DAY_OF_WEEK = 6; // Saturday
export const DEFAULT_CHECKIN_HOUR = 14; // 2PM
const WEEKLY_MESSAGE_HOUR = 9; // fixed morning slot, not user-configurable

/** Next date/time on `dayOfWeek` at `hour:00`, strictly after `from`. */
function nextOccurrence(from: Date, dayOfWeek: number, hour: number): Date {
  const result = new Date(from);
  result.setHours(hour, 0, 0, 0);
  let dayDiff = (dayOfWeek - result.getDay() + 7) % 7;
  if (dayDiff === 0 && result <= from) dayDiff = 7;
  result.setDate(result.getDate() + dayDiff);
  return result;
}

export interface CheckinSchedule {
  checkinFrequencyDays: number;
  preferredCheckinDayOfWeek: number;
  preferredCheckinHour: number;
}

export function computeInitialSchedule(schedule: CheckinSchedule, from: Date = new Date()) {
  return {
    nextCallAt: nextOccurrence(from, schedule.preferredCheckinDayOfWeek, schedule.preferredCheckinHour),
    nextWeeklyMessageAt: nextOccurrence(from, schedule.preferredCheckinDayOfWeek, WEEKLY_MESSAGE_HOUR),
  };
}

/** Called after a call/message actually goes out, to roll the schedule forward. */
export function advanceCallSchedule(schedule: CheckinSchedule, firedAt: Date): Date {
  const next = new Date(firedAt);
  next.setDate(next.getDate() + schedule.checkinFrequencyDays);
  next.setHours(schedule.preferredCheckinHour, 0, 0, 0);
  return next;
}

export function advanceWeeklyMessageSchedule(firedAt: Date): Date {
  const next = new Date(firedAt);
  next.setDate(next.getDate() + 7);
  next.setHours(WEEKLY_MESSAGE_HOUR, 0, 0, 0);
  return next;
}
