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
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bot
} from 'lucide-react';
import { NavigationTab } from '../../types';
import { useStudyOS } from '../../context/StudyOSContext';
import { getTodayDateString } from '../../utils/dateUtils';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed, onNavigate }) => {
  const { activeTab, setActiveTab, tasks, subjects, deadlines, timer, settings } = useStudyOS();

  // Badges calculation
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
    if (onNavigate) onNavigate();
  };

  return (
    <aside
      className={`relative flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 select-none ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
        <div
          onClick={() => handleSelect('dashboard')}
          className="flex items-center gap-3 cursor-pointer overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
            S
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">
                  StudyOS
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400">
                  CSE
                </span>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                Plan Better. Study Smarter.
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="relative shrink-0">
                <Icon
                  size={19}
                  className={
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }
                />
                {item.id === 'study-tracker' && timer.isActive && isCollapsed && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                )}
              </div>

              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        item.id === 'study-tracker' && timer.isActive
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400 animate-pulse'
                          : isActive
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Tagline snippet */}
      {!isCollapsed && (
        <div className="mx-3 my-2 p-3 rounded-xl bg-linear-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/20 border border-indigo-100/80 dark:border-indigo-900/40">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
            <Sparkles size={13} className="text-indigo-500" />
            <span>Study Consistency</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            Plan better. Study smarter. Track your progress daily.
          </p>
        </div>
      )}

      {/* Profile Section */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <div
          onClick={() => handleSelect('settings')}
          className={`flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 cursor-pointer transition ${
            isCollapsed ? 'justify-center p-1' : ''
          }`}
          title="Student Profile & Settings"
        >
          <div className="w-9 h-9 rounded-full bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shrink-0 shadow-xs">
            {settings.studentName.charAt(0) || 'Y'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 truncate">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                {settings.studentName}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                {settings.program}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
