import { Task, Subject, StudySession, AcademicDeadline } from '../types';
import { getTodayDateString, isDateInCurrentWeek, getDeadlineInfo } from './dateUtils';

/**
 * Calculates daily task completion percentage (0-100)
 * Only counts tasks where dueDate === today
 */
export function calculateDailyTaskProgress(tasks: Task[]): {
  completed: number;
  total: number;
  percentage: number;
  remaining: number;
} {
  const today = getTodayDateString();
  const todayTasks = tasks.filter(t => t.dueDate === today);
  const total = todayTasks.length;
  if (total === 0) {
    return { completed: 0, total: 0, percentage: 0, remaining: 0 };
  }
  const completed = todayTasks.filter(t => t.status === 'Completed').length;
  const percentage = Math.round((completed / total) * 100);
  return {
    completed,
    total,
    percentage,
    remaining: total - completed
  };
}

/**
 * Calculates weekly task completion percentage (0-100)
 */
export function calculateWeeklyTaskProgress(tasks: Task[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  const weekTasks = tasks.filter(t => isDateInCurrentWeek(t.dueDate));
  const total = weekTasks.length;
  if (total === 0) {
    return { completed: 0, total: 0, percentage: 0 };
  }
  const completed = weekTasks.filter(t => t.status === 'Completed').length;
  const percentage = Math.round((completed / total) * 100);
  return { completed, total, percentage };
}

/**
 * Calculates study time for today in minutes
 */
export function calculateTodayStudyMinutes(sessions: StudySession[]): number {
  const today = getTodayDateString();
  return sessions
    .filter(s => s.date === today)
    .reduce((sum, s) => sum + s.durationMinutes, 0);
}

/**
 * Calculates study time for the current week in minutes
 */
export function calculateWeeklyStudyMinutes(sessions: StudySession[]): number {
  return sessions
    .filter(s => isDateInCurrentWeek(s.date))
    .reduce((sum, s) => sum + s.durationMinutes, 0);
}

/**
 * Calculates subject total study minutes
 */
export function calculateSubjectTotalStudyMinutes(subjectId: string, sessions: StudySession[]): number {
  return sessions
    .filter(s => s.subjectId === subjectId)
    .reduce((sum, s) => sum + s.durationMinutes, 0);
}

/**
 * Calculates subject study minutes for this week
 */
export function calculateSubjectWeeklyStudyMinutes(subjectId: string, sessions: StudySession[]): number {
  return sessions
    .filter(s => s.subjectId === subjectId && isDateInCurrentWeek(s.date))
    .reduce((sum, s) => sum + s.durationMinutes, 0);
}

/**
 * Calculates topic progress percentage for a subject
 */
export function calculateSubjectTopicProgress(subject: Subject): {
  completed: number;
  total: number;
  percentage: number;
} {
  const total = subject.topics.length;
  if (total === 0) {
    return { completed: 0, total: 0, percentage: 0 };
  }
  const completed = subject.topics.filter(t => t.completed).length;
  const percentage = Math.round((completed / total) * 100);
  return { completed, total, percentage };
}

/**
 * Get overdue tasks (dueDate < today and status !== 'Completed')
 */
export function getOverdueTasks(tasks: Task[]): Task[] {
  const today = getTodayDateString();
  return tasks.filter(t => t.status !== 'Completed' && t.dueDate < today);
}

/**
 * Get active / upcoming deadlines
 */
export function getUpcomingDeadlines(deadlines: AcademicDeadline[], limit?: number): AcademicDeadline[] {
  const active = deadlines.filter(d => d.status !== 'Completed');
  // Sort by date ascending
  active.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return limit ? active.slice(0, limit) : active;
}

/**
 * Returns subjects that have active pending tasks or timetable entries
 */
export function getSubjectsInProgressCount(subjects: Subject[], tasks: Task[]): number {
  const activeSubjectIds = new Set(
    tasks.filter(t => t.status !== 'Completed').map(t => t.subjectId)
  );
  return subjects.filter(s => activeSubjectIds.has(s.id)).length;
}

/**
 * Calculates overall daily progress (weighted 60% task completion, 40% study goal completion)
 */
export function calculateDailyOverallProgress(
  taskCompletionPercent: number,
  todayStudyMinutes: number,
  dailyTargetMinutes: number
): {
  overallPercentage: number;
  studyPercentage: number;
  remainingMinutes: number;
} {
  const studyPercentage = dailyTargetMinutes > 0
    ? Math.min(100, Math.round((todayStudyMinutes / dailyTargetMinutes) * 100))
    : 100;
  
  const remainingMinutes = Math.max(0, dailyTargetMinutes - todayStudyMinutes);
  
  // If no tasks today, base it purely on study percentage
  let overall = 0;
  if (taskCompletionPercent === 0 && todayStudyMinutes === 0) {
    overall = 0;
  } else {
    overall = Math.round((taskCompletionPercent * 0.6) + (studyPercentage * 0.4));
  }

  return {
    overallPercentage: Math.min(100, overall),
    studyPercentage,
    remainingMinutes
  };
}
