import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Subject,
  Topic,
  Task,
  TimetableEntry,
  StudySession,
  AcademicDeadline,
  UserSettings,
  NavigationTab
} from '../types';
import {
  loadInitialAppData,
  saveItem,
  resetAppDataToSample,
  exportDataAsJSON,
  validateImportedData,
  AppDataStore,
  KEYS
} from '../utils/storage';
import { getTodayDateString } from '../utils/dateUtils';

interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  subjectId: string;
  topic: string;
  startTime: number | null; // epoch ms
  accumulatedSeconds: number;
  currentElapsedSeconds: number;
}

interface StudyOSContextType {
  // Navigation
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;

  // Data
  subjects: Subject[];
  tasks: Task[];
  timetable: TimetableEntry[];
  sessions: StudySession[];
  deadlines: AcademicDeadline[];
  settings: UserSettings;

  // Subjects actions
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  addTopic: (subjectId: string, topicName: string) => void;
  toggleTopic: (subjectId: string, topicId: string) => void;
  updateTopic: (subjectId: string, topicId: string, newName: string) => void;
  deleteTopic: (subjectId: string, topicId: string) => void;

  // Tasks actions
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;

  // Timetable actions
  addTimetableEntry: (entry: Omit<TimetableEntry, 'id'>) => void;
  updateTimetableEntry: (id: string, updates: Partial<TimetableEntry>) => void;
  deleteTimetableEntry: (id: string) => void;
  toggleTimetableCompletion: (id: string) => void;

  // Study session actions
  addStudySession: (session: Omit<StudySession, 'id'>) => void;
  deleteStudySession: (id: string) => void;

  // Deadlines actions
  addDeadline: (deadline: Omit<AcademicDeadline, 'id'>) => void;
  updateDeadline: (id: string, updates: Partial<AcademicDeadline>) => void;
  deleteDeadline: (id: string) => void;
  toggleDeadlineStatus: (id: string) => void;

  // Settings & Theme
  updateSettings: (updates: Partial<UserSettings>) => void;
  toggleTheme: () => void;
  resetAllData: () => void;
  exportData: () => void;
  importData: (jsonStr: string) => { success: boolean; error?: string };

  // Timer
  timer: TimerState;
  startTimer: (subjectId: string, topic?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  stopTimer: () => { subjectId: string; topic: string; durationMinutes: number; durationSeconds: number } | null;
}

const StudyOSContext = createContext<StudyOSContextType | undefined>(undefined);

export const StudyOSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppDataStore>(() => loadInitialAppData());
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  // Timer state
  const [timer, setTimer] = useState<TimerState>({
    isActive: false,
    isPaused: false,
    subjectId: '',
    topic: '',
    startTime: null,
    accumulatedSeconds: 0,
    currentElapsedSeconds: 0
  });

  const timerIntervalRef = useRef<number | null>(null);

  // Sync theme with document element
  useEffect(() => {
    if (data.settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [data.settings.theme]);

  // Handle timer tick with high precision (timestamp difference to avoid drift)
  useEffect(() => {
    if (timer.isActive && !timer.isPaused && timer.startTime) {
      timerIntervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const diffSeconds = Math.floor((now - timer.startTime!) / 1000);
        setTimer(prev => ({
          ...prev,
          currentElapsedSeconds: prev.accumulatedSeconds + diffSeconds
        }));
      }, 500);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timer.isActive, timer.isPaused, timer.startTime, timer.accumulatedSeconds]);

  // Persist helpers
  const updateSubjects = (newSubjects: Subject[]) => {
    setData(prev => {
      const next = { ...prev, subjects: newSubjects };
      saveItem(KEYS.SUBJECTS, newSubjects);
      return next;
    });
  };

  const updateTasks = (newTasks: Task[]) => {
    setData(prev => {
      const next = { ...prev, tasks: newTasks };
      saveItem(KEYS.TASKS, newTasks);
      return next;
    });
  };

  const updateTimetable = (newTimetable: TimetableEntry[]) => {
    setData(prev => {
      const next = { ...prev, timetable: newTimetable };
      saveItem(KEYS.TIMETABLE, newTimetable);
      return next;
    });
  };

  const updateSessions = (newSessions: StudySession[]) => {
    setData(prev => {
      const next = { ...prev, sessions: newSessions };
      saveItem(KEYS.SESSIONS, newSessions);
      return next;
    });
  };

  const updateDeadlines = (newDeadlines: AcademicDeadline[]) => {
    setData(prev => {
      const next = { ...prev, deadlines: newDeadlines };
      saveItem(KEYS.DEADLINES, newDeadlines);
      return next;
    });
  };

  // SUBJECTS ACTIONS
  const addSubject = (subject: Omit<Subject, 'id'>) => {
    const newSub: Subject = {
      ...subject,
      id: `sub-${Date.now()}`
    };
    updateSubjects([...data.subjects, newSub]);
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    updateSubjects(
      data.subjects.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteSubject = (id: string) => {
    // Delete subject and keep related tasks/timetable safe
    updateSubjects(data.subjects.filter(s => s.id !== id));
  };

  const addTopic = (subjectId: string, topicName: string) => {
    if (!topicName.trim()) return;
    const newTopic: Topic = {
      id: `top-${Date.now()}`,
      name: topicName.trim(),
      completed: false
    };
    updateSubjects(
      data.subjects.map(s => {
        if (s.id === subjectId) {
          return { ...s, topics: [...s.topics, newTopic] };
        }
        return s;
      })
    );
  };

  const toggleTopic = (subjectId: string, topicId: string) => {
    updateSubjects(
      data.subjects.map(s => {
        if (s.id === subjectId) {
          return {
            ...s,
            topics: s.topics.map(t =>
              t.id === topicId
                ? {
                    ...t,
                    completed: !t.completed,
                    completedAt: !t.completed ? new Date().toISOString() : undefined
                  }
                : t
            )
          };
        }
        return s;
      })
    );
  };

  const updateTopic = (subjectId: string, topicId: string, newName: string) => {
    updateSubjects(
      data.subjects.map(s => {
        if (s.id === subjectId) {
          return {
            ...s,
            topics: s.topics.map(t => (t.id === topicId ? { ...t, name: newName } : t))
          };
        }
        return s;
      })
    );
  };

  const deleteTopic = (subjectId: string, topicId: string) => {
    updateSubjects(
      data.subjects.map(s => {
        if (s.id === subjectId) {
          return {
            ...s,
            topics: s.topics.filter(t => t.id !== topicId)
          };
        }
        return s;
      })
    );
  };

  // TASKS ACTIONS
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: `tsk-${Date.now()}`
    };
    updateTasks([newTask, ...data.tasks]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    updateTasks(
      data.tasks.map(t => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          if (updates.status === 'Completed' && t.status !== 'Completed') {
            updated.completedAt = new Date().toISOString();
          } else if (updates.status && updates.status !== 'Completed') {
            updated.completedAt = undefined;
          }
          return updated;
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    updateTasks(data.tasks.filter(t => t.id !== id));
  };

  const toggleTaskStatus = (id: string) => {
    updateTasks(
      data.tasks.map(t => {
        if (t.id === id) {
          const isNowCompleted = t.status !== 'Completed';
          return {
            ...t,
            status: isNowCompleted ? 'Completed' : 'Pending',
            completedAt: isNowCompleted ? new Date().toISOString() : undefined
          };
        }
        return t;
      })
    );
  };

  // TIMETABLE ACTIONS
  const addTimetableEntry = (entry: Omit<TimetableEntry, 'id'>) => {
    const newEntry: TimetableEntry = {
      ...entry,
      id: `tt-${Date.now()}`
    };
    updateTimetable([...data.timetable, newEntry]);
  };

  const updateTimetableEntry = (id: string, updates: Partial<TimetableEntry>) => {
    updateTimetable(
      data.timetable.map(tt => (tt.id === id ? { ...tt, ...updates } : tt))
    );
  };

  const deleteTimetableEntry = (id: string) => {
    updateTimetable(data.timetable.filter(tt => tt.id !== id));
  };

  const toggleTimetableCompletion = (id: string) => {
    updateTimetable(
      data.timetable.map(tt =>
        tt.id === id ? { ...tt, completed: !tt.completed } : tt
      )
    );
  };

  // STUDY SESSIONS ACTIONS
  const addStudySession = (session: Omit<StudySession, 'id'>) => {
    const newSession: StudySession = {
      ...session,
      id: `sess-${Date.now()}`
    };
    updateSessions([newSession, ...data.sessions]);
  };

  const deleteStudySession = (id: string) => {
    updateSessions(data.sessions.filter(s => s.id !== id));
  };

  // DEADLINES ACTIONS
  const addDeadline = (deadline: Omit<AcademicDeadline, 'id'>) => {
    const newDeadline: AcademicDeadline = {
      ...deadline,
      id: `dead-${Date.now()}`
    };
    updateDeadlines([...data.deadlines, newDeadline]);
  };

  const updateDeadline = (id: string, updates: Partial<AcademicDeadline>) => {
    updateDeadlines(
      data.deadlines.map(d => {
        if (d.id === id) {
          const updated = { ...d, ...updates };
          if (updates.status === 'Completed' && d.status !== 'Completed') {
            updated.completedAt = new Date().toISOString();
          } else if (updates.status && updates.status !== 'Completed') {
            updated.completedAt = undefined;
          }
          return updated;
        }
        return d;
      })
    );
  };

  const deleteDeadline = (id: string) => {
    updateDeadlines(data.deadlines.filter(d => d.id !== id));
  };

  const toggleDeadlineStatus = (id: string) => {
    updateDeadlines(
      data.deadlines.map(d => {
        if (d.id === id) {
          const isDone = d.status === 'Completed';
          return {
            ...d,
            status: isDone ? 'Pending' : 'Completed',
            completedAt: !isDone ? new Date().toISOString() : undefined
          };
        }
        return d;
      })
    );
  };

  // SETTINGS ACTIONS
  const updateSettings = (updates: Partial<UserSettings>) => {
    setData(prev => {
      const nextSettings = { ...prev.settings, ...updates };
      const nextStore = { ...prev, settings: nextSettings };
      saveItem(KEYS.SETTINGS, nextSettings);
      return nextStore;
    });
  };

  const toggleTheme = () => {
    const newTheme = data.settings.theme === 'light' ? 'dark' : 'light';
    updateSettings({ theme: newTheme });
  };

  const resetAllData = () => {
    const reset = resetAppDataToSample();
    setData(reset);
    resetTimer();
  };

  const exportData = () => {
    exportDataAsJSON(data);
  };

  const importData = (jsonStr: string) => {
    const res = validateImportedData(jsonStr);
    if (res.success && res.data) {
      setData(res.data);
      saveItem(KEYS.SUBJECTS, res.data.subjects);
      saveItem(KEYS.TASKS, res.data.tasks);
      saveItem(KEYS.TIMETABLE, res.data.timetable);
      saveItem(KEYS.SESSIONS, res.data.sessions);
      saveItem(KEYS.DEADLINES, res.data.deadlines);
      saveItem(KEYS.SETTINGS, res.data.settings);
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to import data' };
  };

  // TIMER CONTROLS
  const startTimer = (subjectId: string, topic?: string) => {
    setTimer({
      isActive: true,
      isPaused: false,
      subjectId,
      topic: topic || '',
      startTime: Date.now(),
      accumulatedSeconds: 0,
      currentElapsedSeconds: 0
    });
  };

  const pauseTimer = () => {
    if (!timer.isActive || timer.isPaused) return;
    const now = Date.now();
    const sessionElapsed = timer.startTime ? Math.floor((now - timer.startTime) / 1000) : 0;
    const total = timer.accumulatedSeconds + sessionElapsed;
    setTimer(prev => ({
      ...prev,
      isPaused: true,
      accumulatedSeconds: total,
      currentElapsedSeconds: total,
      startTime: null
    }));
  };

  const resumeTimer = () => {
    if (!timer.isActive || !timer.isPaused) return;
    setTimer(prev => ({
      ...prev,
      isPaused: false,
      startTime: Date.now()
    }));
  };

  const resetTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setTimer({
      isActive: false,
      isPaused: false,
      subjectId: '',
      topic: '',
      startTime: null,
      accumulatedSeconds: 0,
      currentElapsedSeconds: 0
    });
  };

  const stopTimer = () => {
    if (!timer.isActive) return null;
    let totalSeconds = timer.accumulatedSeconds;
    if (!timer.isPaused && timer.startTime) {
      const now = Date.now();
      totalSeconds += Math.floor((now - timer.startTime) / 1000);
    }

    const result = {
      subjectId: timer.subjectId,
      topic: timer.topic,
      durationMinutes: Math.max(1, Math.round(totalSeconds / 60)),
      durationSeconds: totalSeconds
    };

    resetTimer();
    return result;
  };

  return (
    <StudyOSContext.Provider
      value={{
        activeTab,
        setActiveTab,
        subjects: data.subjects,
        tasks: data.tasks,
        timetable: data.timetable,
        sessions: data.sessions,
        deadlines: data.deadlines,
        settings: data.settings,

        addSubject,
        updateSubject,
        deleteSubject,
        addTopic,
        toggleTopic,
        updateTopic,
        deleteTopic,

        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,

        addTimetableEntry,
        updateTimetableEntry,
        deleteTimetableEntry,
        toggleTimetableCompletion,

        addStudySession,
        deleteStudySession,

        addDeadline,
        updateDeadline,
        deleteDeadline,
        toggleDeadlineStatus,

        updateSettings,
        toggleTheme,
        resetAllData,
        exportData,
        importData,

        timer,
        startTimer,
        pauseTimer,
        resumeTimer,
        resetTimer,
        stopTimer
      }}
    >
      {children}
    </StudyOSContext.Provider>
  );
};

export const useStudyOS = () => {
  const context = useContext(StudyOSContext);
  if (!context) {
    throw new Error('useStudyOS must be used within a StudyOSProvider');
  }
  return context;
};
