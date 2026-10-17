import React from 'react';
import {
  Menu,
  Moon,
  Sun,
  Timer,
  Plus,
  Play,
  Pause,
  Calendar
} from 'lucide-react';
import { useStudyOS } from '../../context/StudyOSContext';
import {
  getTimeOfDayGreeting,
  formatFriendlyDate,
  getTodayDateString,
  formatSecondsToHHMMSS
} from '../../utils/dateUtils';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenQuickTaskModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, onOpenQuickTaskModal }) => {
  const { settings, toggleTheme, timer, subjects, setActiveTab } = useStudyOS();

  const todayStr = getTodayDateString();
  const greeting = getTimeOfDayGreeting(settings.studentName.split(' ')[0] || 'Student');
  const activeSubject = subjects.find(s => s.id === timer.subjectId);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Left: Mobile Menu Trigger & Personalized Greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex flex-col">
          <h1 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{greeting}</span>
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Calendar size={12} className="shrink-0 text-slate-400" />
            <span>{formatFriendlyDate(todayStr)}</span>
          </div>
        </div>
      </div>

      {/* Right: Quick actions, Live Timer chip, Dark mode toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Timer Chip if Running */}
        {timer.isActive && (
          <div
            onClick={() => setActiveTab('study-tracker')}
            className="flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 cursor-pointer hover:bg-emerald-100/70 transition shadow-xs"
            title="Active Study Timer — Click to open tracker"
          >
            <div className="relative">
              <Timer size={15} className="text-emerald-600 dark:text-emerald-400 animate-spin-slow" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold">
              <span>{formatSecondsToHHMMSS(timer.currentElapsedSeconds)}</span>
              {activeSubject && (
                <span className="hidden lg:inline text-[11px] font-sans font-normal opacity-85 truncate max-w-[100px]">
                  • {activeSubject.name}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Quick Add Task button */}
        <button
          onClick={onOpenQuickTaskModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-xs transition"
          title="Create a new task"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Add Task</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label={settings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={settings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {settings.theme === 'dark' ? (
            <Sun size={18} className="text-amber-400" />
          ) : (
            <Moon size={18} className="text-slate-600" />
          )}
        </button>
      </div>
    </header>
  );
};
