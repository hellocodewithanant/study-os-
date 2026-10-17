import { DayOfWeek } from '../types';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns the current day of the week name
 */
export function getCurrentDayOfWeek(): DayOfWeek {
  const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday
  const mapping: DayOfWeek[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];
  return mapping[dayIndex];
}

/**
 * Returns a friendly greeting based on time of day
 */
export function getTimeOfDayGreeting(name: string): string {
  const hour = new Date().getHours();
  let timeStr = 'Good morning';
  if (hour >= 12 && hour < 17) {
    timeStr = 'Good afternoon';
  } else if (hour >= 17 && hour < 22) {
    timeStr = 'Good evening';
  } else if (hour >= 22 || hour < 5) {
    timeStr = 'Working late';
  }
  return `${timeStr}, ${name}!`;
}

/**
 * Format date string (YYYY-MM-DD) to friendly format like "Fri, Oct 16, 2026"
 */
export function formatFriendlyDate(dateString: string): string {
  if (!dateString) return '';
  const [y, m, d] = dateString.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Calculate deadline status and countdown
 * Returns: { isOverdue: boolean, isToday: boolean, daysDiff: number, text: string }
 */
export function getDeadlineInfo(dueDateString: string, dueTime?: string): {
  isOverdue: boolean;
  isToday: boolean;
  daysDiff: number;
  text: string;
} {
  const todayStr = getTodayDateString();
  if (dueDateString === todayStr) {
    return {
      isOverdue: false,
      isToday: true,
      daysDiff: 0,
      text: dueTime ? `Due today at ${dueTime}` : 'Due today'
    };
  }

  const [y1, m1, d1] = todayStr.split('-').map(Number);
  const [y2, m2, d2] = dueDateString.split('-').map(Number);

  const today = new Date(y1, m1 - 1, d1).getTime();
  const due = new Date(y2, m2 - 1, d2).getTime();
  const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      isOverdue: true,
      isToday: false,
      daysDiff: diffDays,
      text: overdueDays === 1 ? 'Overdue by 1 day' : `Overdue by ${overdueDays} days`
    };
  }

  if (diffDays === 1) {
    return {
      isOverdue: false,
      isToday: false,
      daysDiff: 1,
      text: 'Due tomorrow'
    };
  }

  return {
    isOverdue: false,
    isToday: false,
    daysDiff: diffDays,
    text: `Due in ${diffDays} days`
  };
}

/**
 * Checks if a date falls in the current week (Monday through Sunday)
 */
export function isDateInCurrentWeek(dateString: string): boolean {
  if (!dateString) return false;
  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday
  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

  const monday = new Date(now);
  monday.setDate(now.getDate() + distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const [y, m, d] = dateString.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d, 12, 0, 0);

  return targetDate >= monday && targetDate <= sunday;
}

/**
 * Formats duration in minutes to readable hours and minutes: e.g. "2h 45m" or "45m"
 */
export function formatMinutes(minutes: number): string {
  if (!minutes || minutes <= 0) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

/**
 * Formats seconds to HH:MM:SS
 */
export function formatSecondsToHHMMSS(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

/**
 * Get dates for the current week (Monday to Sunday)
 */
export function getCurrentWeekDates(): { day: DayOfWeek; dateStr: string; label: string }[] {
  const now = new Date();
  const currentDay = now.getDay();
  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

  const monday = new Date(now);
  monday.setDate(now.getDate() + distanceToMonday);

  return DAYS_OF_WEEK.map((day, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayOfMonth}`;
    return {
      day,
      dateStr,
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  });
}
