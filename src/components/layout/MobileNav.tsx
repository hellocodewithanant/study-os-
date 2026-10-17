import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  CalendarDays,
  Timer,
  GraduationCap,
  BarChart3,
  Settings,
  X,
  Sparkles,
  Bot
} from 'lucide-react';
import { NavigationTab } from '../../types';
import { useStudyOS } from '../../context/StudyOSContext';
import { getTodayDateString } from '../../utils/dateUtils';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, tasks, subjects, deadlines, timer, settings } = useStudyOS();

  if (!isOpen) return null;

  const todayStr = getTodayDateString();
  const pendingTodayTasks = tasks.filter(t => t.dueDate === todayStr && t.status !== 'Completed').length;
  const activeDeadlinesCount = deadlines.filter(d => d.status !== 'Completed').length;

  const navItems: { id: NavigationTab; label: string; icon: React.ElementType; badge?: number | string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare, badge: pendingTodayTasks > 0 ? pendingTodayTasks : undefined },
    { id: 'subjects', label: 'Subjects', icon: BookOpen, badge: subjects.length },
    { id: 'timetable', label: 'Weekly Timetable', icon: CalendarDays },
    {
      id: 'study-tracker',
      label: 'Study Tracker',
      icon: Timer,
      badge: timer.isActive ? 'Active' : undefined
    },
    { id: 'deadlines', label: 'Assignments & Exams', icon: GraduationCap, badge: activeDeadlinesCount > 0 ? activeDeadlinesCount : undefined },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'ai-assistant', label: 'AI Study Assistant', icon: Bot, badge: 'AI' },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleSelect = (tab: NavigationTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-10 transition-transform">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-base shadow-sm">
              S
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                StudyOS
              </div>
              <div className="text-[10px] text-slate-400">First-Year B.Tech CSE</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      item.id === 'study-tracker' && timer.isActive
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 animate-pulse'
                        : isActive
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Profile in drawer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div
            onClick={() => handleSelect('settings')}
            className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
              {settings.studentName.charAt(0) || 'Y'}
            </div>
            <div className="flex-1 truncate">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                {settings.studentName}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {settings.program}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
