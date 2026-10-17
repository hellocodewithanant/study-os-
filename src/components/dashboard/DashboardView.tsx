import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  BookOpen,
  Calendar,
  AlertCircle,
  TrendingUp,
  Plus,
  Play,
  ArrowRight,
  Flame,
  Check,
  Target
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useStudyOS } from '../../context/StudyOSContext';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { PriorityBadge, Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import {
  getTodayDateString,
  getCurrentDayOfWeek,
  getCurrentWeekDates,
  formatMinutes,
  DAYS_OF_WEEK
} from '../../utils/dateUtils';
import {
  calculateDailyTaskProgress,
  calculateWeeklyTaskProgress,
  calculateTodayStudyMinutes,
  calculateWeeklyStudyMinutes,
  calculateDailyOverallProgress,
  getSubjectsInProgressCount,
  getUpcomingDeadlines
} from '../../utils/calculations';
import { Task, TimetableEntry } from '../../types';

interface DashboardViewProps {
  onOpenTaskModal: (task?: Task) => void;
  onOpenTimetableModal?: (entry?: TimetableEntry) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenTaskModal }) => {
  const {
    tasks,
    subjects,
    timetable,
    sessions,
    deadlines,
    settings,
    toggleTaskStatus,
    toggleTimetableCompletion,
    setActiveTab,
    startTimer
  } = useStudyOS();

  const todayStr = getTodayDateString();
  const currentDayOfWeek = getCurrentDayOfWeek();

  // 1. Calculate live metrics from actual data
  const dailyTaskStats = calculateDailyTaskProgress(tasks);
  const weeklyTaskStats = calculateWeeklyTaskProgress(tasks);
  const todayStudyMinutes = calculateTodayStudyMinutes(sessions);
  const weeklyStudyMinutes = calculateWeeklyStudyMinutes(sessions);
  const weeklyGoalMinutes = (settings.weeklyTargetHours || 20) * 60;
  const subjectsInProgressCount = getSubjectsInProgressCount(subjects, tasks);
  const activeDeadlines = getUpcomingDeadlines(deadlines, 3);

  const { overallPercentage, studyPercentage, remainingMinutes } = calculateDailyOverallProgress(
    dailyTaskStats.percentage,
    todayStudyMinutes,
    settings.dailyTargetMinutes || 180
  );

  // 2. Today's schedule in chronological order
  const todaySchedule = timetable
    .filter(t => t.dayOfWeek === currentDayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // 3. Today's tasks
  const todayTasks = tasks.filter(t => t.dueDate === todayStr);

  // 4. Weekly chart data (Monday to Sunday)
  const weekDates = getCurrentWeekDates();
  const weeklyChartData = weekDates.map(({ day, dateStr }) => {
    const daySessions = sessions.filter(s => s.date === dateStr);
    const totalMinutes = daySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const hours = Number((totalMinutes / 60).toFixed(1));
    return {
      name: day.slice(0, 3),
      hours,
      minutes: totalMinutes,
      date: dateStr,
      isToday: dateStr === todayStr
    };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* SECTION 1: Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Today's Tasks */}
        <Card className="p-4 bg-linear-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today's Tasks
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {dailyTaskStats.total}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {dailyTaskStats.remaining} remaining for today
          </p>
        </Card>

        {/* Tasks Completed */}
        <Card className="p-4 bg-linear-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Completed
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Check size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {dailyTaskStats.completed}
            <span className="text-sm font-normal text-slate-400 ml-1">/ {dailyTaskStats.total}</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {dailyTaskStats.percentage}% task rate
          </p>
        </Card>

        {/* Study Time Today */}
        <Card className="p-4 bg-linear-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Study Today
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatMinutes(todayStudyMinutes)}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Target: {formatMinutes(settings.dailyTargetMinutes)}
          </p>
        </Card>

        {/* Weekly Study Goal */}
        <Card className="p-4 bg-linear-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Weekly Goal
            </span>
            <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
              <Target size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {(weeklyStudyMinutes / 60).toFixed(1)}
            <span className="text-xs font-normal text-slate-400 ml-0.5">/{settings.weeklyTargetHours}h</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {Math.min(100, Math.round((weeklyStudyMinutes / weeklyGoalMinutes) * 100))}% of weekly target
          </p>
        </Card>

        {/* Subjects in Progress */}
        <Card className="p-4 bg-linear-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Subjects
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <BookOpen size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {subjectsInProgressCount}
            <span className="text-sm font-normal text-slate-400 ml-1">/ {subjects.length}</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Subjects with tasks
          </p>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="p-4 bg-linear-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Deadlines
            </span>
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertCircle size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {deadlines.filter(d => d.status !== 'Completed').length}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Pending assessments
          </p>
        </Card>
      </div>

      {/* SECTION 2: Daily Progress Section (Detailed Breakdown) */}
      <Card className="p-5 sm:p-6 bg-linear-to-r from-indigo-50/40 via-white to-violet-50/30 dark:from-indigo-950/20 dark:via-slate-900 dark:to-violet-950/10 border-indigo-100 dark:border-indigo-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold tracking-wide uppercase">
                Daily Focus Score
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Today's Productivity Progress
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Calculated dynamically: combines today's task completion rate (60% weight) and study goal target fulfillment (40% weight).
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Visual Ring / Percentage */}
            <div className="flex items-center gap-3 bg-white dark:bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 dark:text-slate-700"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-indigo-600 dark:text-indigo-400 transition-all duration-500"
                    strokeDasharray={`${overallPercentage}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-xs font-bold text-slate-900 dark:text-white">
                  {overallPercentage}%
                </span>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {overallPercentage >= 80 ? 'Outstanding Day!' : overallPercentage >= 50 ? 'Steady Progress' : 'Keep Going!'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Daily Progress
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dual Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-medium text-slate-600 dark:text-slate-300">
                Tasks Completed: {dailyTaskStats.completed} / {dailyTaskStats.total}
              </span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {dailyTaskStats.percentage}%
              </span>
            </div>
            <ProgressBar progress={dailyTaskStats.percentage} color="#6366f1" size="sm" />
            <div className="text-[11px] text-slate-400 mt-1">
              {dailyTaskStats.remaining > 0 ? `${dailyTaskStats.remaining} tasks left for today` : 'All tasks for today completed! 🎉'}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-medium text-slate-600 dark:text-slate-300">
                Study Time: {formatMinutes(todayStudyMinutes)} / {formatMinutes(settings.dailyTargetMinutes)}
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {studyPercentage}%
              </span>
            </div>
            <ProgressBar progress={studyPercentage} color="#10b981" size="sm" />
            <div className="text-[11px] text-slate-400 mt-1">
              {remainingMinutes > 0 ? `${formatMinutes(remainingMinutes)} needed to reach daily target` : 'Daily study target achieved! 🚀'}
            </div>
          </div>
        </div>
      </Card>

      {/* SECTION 3: Main Two-Column Layout (Schedule & Tasks) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Today's Tasks & Weekly Study Chart */}
        <div className="lg:col-span-7 space-y-6">
          {/* Today's Tasks Checklist */}
          <Card>
            <CardHeader
              title="Today's Tasks"
              subtitle={`Scheduled for today (${todayTasks.length} total)`}
              action={
                <button
                  onClick={() => onOpenTaskModal()}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 px-3 py-1.5 rounded-lg transition"
                >
                  <Plus size={14} />
                  Add Task
                </button>
              }
            />
            <CardContent className="p-0">
              {todayTasks.length === 0 ? (
                <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-sm">
                  No tasks scheduled for today. Click "Add Task" to plan your day.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {todayTasks.map((task) => {
                    const subject = subjects.find(s => s.id === task.subjectId);
                    const isCompleted = task.status === 'Completed';

                    return (
                      <div
                        key={task.id}
                        className={`p-3.5 sm:px-5 sm:py-3.5 flex items-start gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group ${
                          isCompleted ? 'bg-slate-50/40 dark:bg-slate-900/40' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isCompleted}
                          onChange={() => toggleTaskStatus(task.id)}
                          className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer transition"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              onClick={() => onOpenTaskModal(task)}
                              className={`text-sm font-medium cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition ${
                                isCompleted
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {subject && (
                              <span
                                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-medium"
                                style={{
                                  backgroundColor: `${subject.color}15`,
                                  color: subject.color
                                }}
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: subject.color }}
                                />
                                {subject.name}
                              </span>
                            )}
                            <PriorityBadge priority={task.priority} size="sm" />
                            {task.dueTime && (
                              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Clock size={11} />
                                {task.dueTime}
                              </span>
                            )}
                            {task.estimatedMinutes && (
                              <span className="text-[11px] text-slate-400">
                                ~{formatMinutes(task.estimatedMinutes)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick Start Study Timer with this task's subject */}
                        {!isCompleted && subject && (
                          <button
                            onClick={() => {
                              startTimer(subject.id, task.title);
                              setActiveTab('study-tracker');
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
                            title="Start study timer for this task"
                          >
                            <Play size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Overview Chart */}
          <Card>
            <CardHeader
              title="Weekly Study Hours"
              subtitle={`Total logged this week: ${(weeklyStudyMinutes / 60).toFixed(1)} hrs`}
              action={
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  Full Analytics <ArrowRight size={13} />
                </button>
              }
            />
            <CardContent>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b820" />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      unit="h"
                    />
                    <Tooltip
                      formatter={(val: any) => [`${val} hours`, 'Study Duration']}
                      labelFormatter={(label, items) => {
                        const item = items[0]?.payload;
                        return item ? `${label} (${item.date})` : label;
                      }}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#f8fafc',
                        fontSize: '12px'
                      }}
                    />
                    <Bar
                      dataKey="hours"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (5 cols): Today's Schedule & Deadlines Preview */}
        <div className="lg:col-span-5 space-y-6">
          {/* Today's Schedule (Chronological) */}
          <Card>
            <CardHeader
              title={`Today's Schedule (${currentDayOfWeek})`}
              subtitle={`${todaySchedule.length} lecture / lab sessions`}
              action={
                <button
                  onClick={() => setActiveTab('timetable')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  View Week <ArrowRight size={13} />
                </button>
              }
            />
            <CardContent className="p-0">
              {todaySchedule.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  No scheduled classes for {currentDayOfWeek}. Enjoy your deep study session!
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {todaySchedule.map((session) => {
                    const subject = subjects.find(s => s.id === session.subjectId);
                    const isDone = !!session.completed;

                    return (
                      <div
                        key={session.id}
                        className={`p-3.5 sm:px-4 flex items-start gap-3 transition ${
                          isDone ? 'bg-slate-50/50 dark:bg-slate-900/30' : ''
                        }`}
                      >
                        {/* Time Column */}
                        <div className="w-16 shrink-0 text-center py-1 px-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-medium text-slate-600 dark:text-slate-300">
                          <div>{session.startTime}</div>
                          <div className="text-[10px] text-slate-400">to {session.endTime}</div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {subject && (
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: subject.color }}
                              />
                            )}
                            <h4
                              className={`text-sm font-semibold truncate ${
                                isDone
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-800 dark:text-slate-100'
                              }`}
                            >
                              {subject ? subject.name : 'Class Session'}
                            </h4>
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {session.topic || 'General Lecture'}
                          </p>

                          {session.location && (
                            <span className="inline-block text-[10px] text-slate-400 mt-1">
                              📍 {session.location}
                            </span>
                          )}
                        </div>

                        {/* Completion button */}
                        <button
                          onClick={() => toggleTimetableCompletion(session.id)}
                          className={`shrink-0 p-1.5 rounded-lg text-xs font-medium transition ${
                            isDone
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                          }`}
                          title={isDone ? 'Mark session incomplete' : 'Mark session complete'}
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Academic Deadlines Preview */}
          <Card>
            <CardHeader
              title="Upcoming Deadlines"
              subtitle="Assignments, practicals & tests"
              action={
                <button
                  onClick={() => setActiveTab('deadlines')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight size={13} />
                </button>
              }
            />
            <CardContent className="p-0">
              {activeDeadlines.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  No upcoming deadlines! Great job staying ahead.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activeDeadlines.map((deadline) => {
                    const subject = subjects.find(s => s.id === deadline.subjectId);
                    return (
                      <div
                        key={deadline.id}
                        onClick={() => setActiveTab('deadlines')}
                        className="p-3.5 sm:px-4 flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition"
                      >
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {deadline.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-slate-400">
                              {subject?.name}
                            </span>
                            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {deadline.type}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                            {deadline.dueDate}
                          </span>
                          {deadline.dueTime && (
                            <div className="text-[10px] text-slate-400">
                              {deadline.dueTime}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
