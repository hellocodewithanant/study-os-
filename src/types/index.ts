export type Priority = 'Low' | 'Medium' | 'High';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export type TaskCategory = 
  | 'Daily Study' 
  | 'Assignment' 
  | 'Practical or Lab' 
  | 'Revision' 
  | 'Exam Preparation' 
  | 'Personal';

export type DeadlineType = 
  | 'Assignment' 
  | 'Practical' 
  | 'Internal Test' 
  | 'Viva' 
  | 'Examination';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface Topic {
  id: string;
  name: string;
  completed: boolean;
  completedAt?: string;
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  color: string;
  iconName?: string;
  topics: Topic[];
  weeklyTargetHours?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  category: TaskCategory;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  priority: Priority;
  status: TaskStatus;
  estimatedMinutes?: number;
  completedAt?: string;
}

export interface TimetableEntry {
  id: string;
  subjectId: string;
  topic: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:MM (24h)
  endTime: string;   // HH:MM (24h)
  location?: string;
  notes?: string;
  completed?: boolean;
}

export interface StudySession {
  id: string;
  subjectId: string;
  topic?: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  durationMinutes: number;
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface AcademicDeadline {
  id: string;
  title: string;
  subjectId: string;
  type: DeadlineType;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: Priority;
  notes?: string;
  completedAt?: string;
}

export interface UserSettings {
  studentName: string;
  program: string;
  semester: string;
  dailyTargetMinutes: number;
  weeklyTargetHours: number;
  theme: 'light' | 'dark';
  defaultView: string;
  weekStart: 'Monday' | 'Sunday';
  subjectColors: Record<string, string>;
  breakReminderMinutes?: number;
}

export type NavigationTab = 
  | 'dashboard'
  | 'tasks'
  | 'subjects'
  | 'timetable'
  | 'study-tracker'
  | 'deadlines'
  | 'analytics'
  | 'ai-assistant'
  | 'settings';
