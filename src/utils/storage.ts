import { Subject, Task, TimetableEntry, StudySession, AcademicDeadline, UserSettings } from '../types';
import {
  INITIAL_SUBJECTS,
  getInitialTasks,
  INITIAL_TIMETABLE,
  getInitialStudySessions,
  getInitialDeadlines,
  INITIAL_SETTINGS
} from '../data/sampleData';

const KEYS = {
  SUBJECTS: 'studyos_subjects_v1',
  TASKS: 'studyos_tasks_v1',
  TIMETABLE: 'studyos_timetable_v1',
  SESSIONS: 'studyos_sessions_v1',
  DEADLINES: 'studyos_deadlines_v1',
  SETTINGS: 'studyos_settings_v1',
  INITIALIZED: 'studyos_initialized_v1'
};

export interface AppDataStore {
  subjects: Subject[];
  tasks: Task[];
  timetable: TimetableEntry[];
  sessions: StudySession[];
  deadlines: AcademicDeadline[];
  settings: UserSettings;
}

export function loadItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error loading key "${key}" from localStorage:`, err);
    return defaultValue;
  }
}

export function saveItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving key "${key}" to localStorage:`, err);
  }
}

/**
 * Loads entire app state from LocalStorage, initializing with sample data only on first run
 */
export function loadInitialAppData(): AppDataStore {
  const isInitialized = localStorage.getItem(KEYS.INITIALIZED);

  if (!isInitialized) {
    const initial: AppDataStore = {
      subjects: INITIAL_SUBJECTS,
      tasks: getInitialTasks(),
      timetable: INITIAL_TIMETABLE,
      sessions: getInitialStudySessions(),
      deadlines: getInitialDeadlines(),
      settings: INITIAL_SETTINGS
    };

    saveItem(KEYS.SUBJECTS, initial.subjects);
    saveItem(KEYS.TASKS, initial.tasks);
    saveItem(KEYS.TIMETABLE, initial.timetable);
    saveItem(KEYS.SESSIONS, initial.sessions);
    saveItem(KEYS.DEADLINES, initial.deadlines);
    saveItem(KEYS.SETTINGS, initial.settings);
    localStorage.setItem(KEYS.INITIALIZED, 'true');

    return initial;
  }

  return {
    subjects: loadItem<Subject[]>(KEYS.SUBJECTS, INITIAL_SUBJECTS),
    tasks: loadItem<Task[]>(KEYS.TASKS, []),
    timetable: loadItem<TimetableEntry[]>(KEYS.TIMETABLE, []),
    sessions: loadItem<StudySession[]>(KEYS.SESSIONS, []),
    deadlines: loadItem<AcademicDeadline[]>(KEYS.DEADLINES, []),
    settings: loadItem<UserSettings>(KEYS.SETTINGS, INITIAL_SETTINGS)
  };
}

/**
 * Resets application data to factory sample data
 */
export function resetAppDataToSample(): AppDataStore {
  const initial: AppDataStore = {
    subjects: INITIAL_SUBJECTS,
    tasks: getInitialTasks(),
    timetable: INITIAL_TIMETABLE,
    sessions: getInitialStudySessions(),
    deadlines: getInitialDeadlines(),
    settings: INITIAL_SETTINGS
  };

  saveItem(KEYS.SUBJECTS, initial.subjects);
  saveItem(KEYS.TASKS, initial.tasks);
  saveItem(KEYS.TIMETABLE, initial.timetable);
  saveItem(KEYS.SESSIONS, initial.sessions);
  saveItem(KEYS.DEADLINES, initial.deadlines);
  saveItem(KEYS.SETTINGS, initial.settings);
  localStorage.setItem(KEYS.INITIALIZED, 'true');

  return initial;
}

/**
 * Exports all data as JSON and triggers browser download
 */
export function exportDataAsJSON(data: AppDataStore): void {
  const payload = {
    app: 'StudyOS',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    data
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `studyos-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Validates imported JSON string before applying changes
 */
export function validateImportedData(rawJSON: string): {
  success: boolean;
  data?: AppDataStore;
  summary?: {
    subjectsCount: number;
    tasksCount: number;
    timetableCount: number;
    sessionsCount: number;
    deadlinesCount: number;
  };
  error?: string;
} {
  try {
    const parsed = JSON.parse(rawJSON);
    const store = parsed.data || parsed;

    if (!store || typeof store !== 'object') {
      return { success: false, error: 'Invalid JSON format: missing root object.' };
    }

    if (!Array.isArray(store.subjects)) {
      return { success: false, error: 'Invalid data format: "subjects" must be an array.' };
    }

    if (!Array.isArray(store.tasks)) {
      return { success: false, error: 'Invalid data format: "tasks" must be an array.' };
    }

    const cleanStore: AppDataStore = {
      subjects: store.subjects || [],
      tasks: store.tasks || [],
      timetable: Array.isArray(store.timetable) ? store.timetable : [],
      sessions: Array.isArray(store.sessions) ? store.sessions : [],
      deadlines: Array.isArray(store.deadlines) ? store.deadlines : [],
      settings: store.settings && typeof store.settings === 'object' ? store.settings : INITIAL_SETTINGS
    };

    return {
      success: true,
      data: cleanStore,
      summary: {
        subjectsCount: cleanStore.subjects.length,
        tasksCount: cleanStore.tasks.length,
        timetableCount: cleanStore.timetable.length,
        sessionsCount: cleanStore.sessions.length,
        deadlinesCount: cleanStore.deadlines.length
      }
    };
  } catch (err: any) {
    return {
      success: false,
      error: `JSON parse error: ${err.message || 'Unable to parse file'}`
    };
  }
}

export { KEYS };
