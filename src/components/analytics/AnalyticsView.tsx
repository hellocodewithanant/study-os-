import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import {
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  BookOpen,
  Calendar,
  Sparkles,
  BarChart3,
  Play
} from 'lucide-react';
import { useStudyOS } from '../../context/StudyOSContext';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import {
  getTodayDateString,
  getCurrentWeekDates,
  formatMinutes
} from '../../utils/dateUtils';
import {
  calculateWeeklyStudyMinutes,
  calculateTodayStudyMinutes,
  calculateSubjectTotalStudyMinutes,
  calculateSubjectTopicProgress
} from '../../utils/calculations';

export const AnalyticsView: React.FC = () => {
  const {
    sessions,
    tasks,
    subjects,
    settings,
    setActiveTab
  } = useStudyOS();

  const todayStr = getTodayDateString();
  const weekDates = getCurrentWeekDates();

  // 1. Weekly study hours by day
  const weeklyDayData = useMemo(() => {
    return weekDates.map(({ day, dateStr }) => {
      const daySessions = sessions.filter((s) => s.date === dateStr);
      const minutes = daySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
      return {
        day: day.slice(0, 3),
        fullDay: day,
        date: dateStr,
        hours: Number((minutes / 60).toFixed(1)),
        minutes
      };
    });
  }, [sessions, weekDates]);

  // 2. Subject-wise study time distribution
  const subjectTimeDistribution = useMemo(() => {
    const list = subjects
      .map((s) => {
        const totalMinutes = calculateSubjectTotalStudyMinutes(s.id, sessions);
        return {
          name: s.name,
          color: s.color,
          value: totalMinutes,
          hours: Number((totalMinutes / 60).toFixed(1))
        };
      })
      .filter((s) => s.value > 0);

    return list.sort((a, b) => b.value - a.value);
  }, [subjects, sessions]);

  // 3. Subject Topic Completion Comparison
  const subjectTopicData = useMemo(() => {
    return subjects.map((s) => {
      const stats = calculateSubjectTopicProgress(s);
      return {
        name: s.name.length > 14 ? `${s.name.slice(0, 12)}…` : s.name,
        fullName: s.name,
        completed: stats.completed,
        pending: stats.total - stats.completed,
        total: stats.total,
        percentage: stats.percentage,
        color: s.color
      };
    });
  }, [subjects]);

  // 4. Most studied subject
  const mostStudiedSubject = subjectTimeDistribution[0];

  // 5. Total hours logged
  const totalLoggedMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalLoggedHours = (totalLoggedMinutes / 60).toFixed(1);

  // 6. Tasks completed this week
  const thisWeekTasks = tasks.filter((t) => {
    return weekDates.some((w) => w.dateStr === t.dueDate);
  });
  const tasksCompletedThisWeek = thisWeekTasks.filter((t) => t.status === 'Completed').length;

  // 7. Goal achievement rate
  const weeklyMinutes = calculateWeeklyStudyMinutes(sessions);
  const weeklyTargetMinutes = (settings.weeklyTargetHours || 20) * 60;
  const goalAchievementRate = Math.min(
    100,
    Math.round((weeklyMinutes / weeklyTargetMinutes) * 100)
  );

  if (sessions.length === 0 && tasks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <EmptyState
          icon={BarChart3}
          title="No Study Analytics Yet"
          description="Log study sessions and complete your daily tasks to unlock detailed productivity analytics."
          actionLabel="Start Study Timer"
          onAction={() => setActiveTab('study-tracker')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Productivity & Learning Analytics
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Comprehensive reports driven strictly by your logged study sessions and syllabus milestones.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Most Studied Subject */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Top Subject
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              <Award size={16} />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white truncate">
            {mostStudiedSubject ? mostStudiedSubject.name : 'None yet'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {mostStudiedSubject ? `${mostStudiedSubject.hours} hrs logged` : 'Start studying!'}
          </p>
        </Card>

        {/* Goal Achievement */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Weekly Goal
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {goalAchievementRate}%
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {(weeklyMinutes / 60).toFixed(1)} / {settings.weeklyTargetHours || 20} hrs target
          </p>
        </Card>

        {/* Tasks Completed this week */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tasks Finished
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {tasksCompletedThisWeek}
            <span className="text-sm font-normal text-slate-400 ml-1">/ {thisWeekTasks.length}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Due during current week</p>
        </Card>

        {/* Total Lifetime Hours */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Logged Time
            </span>
            <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {totalLoggedHours}h
          </div>
          <p className="text-xs text-slate-500 mt-1">Across {sessions.length} sessions</p>
        </Card>
      </div>

      {/* CHARTS ROW 1: Weekly Hours & Subject Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Study Trend */}
        <Card className="lg:col-span-7">
          <CardHeader
            title="Weekly Study Hours by Day"
            subtitle="Actual hours logged for each day this week"
          />
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyDayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b820" />
                  <XAxis
                    dataKey="day"
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
                      return item ? `${item.fullDay} (${item.date})` : label;
                    }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subject Time Distribution (Pie) */}
        <Card className="lg:col-span-5">
          <CardHeader
            title="Subject Time Distribution"
            subtitle="Proportion of total study hours by subject"
          />
          <CardContent>
            {subjectTimeDistribution.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-400 text-xs text-center">
                No study sessions logged yet.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectTimeDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={42}
                      paddingAngle={3}
                    >
                      {subjectTimeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [formatMinutes(Number(val)), 'Time Studied']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#f8fafc',
                        fontSize: '12px'
                      }}
                    />
                    <Legend
                      formatter={(val) => <span className="text-xs text-slate-600 dark:text-slate-400">{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CHARTS ROW 2: Subject Topic Completion Comparison */}
      <Card>
        <CardHeader
          title="Syllabus Topics Covered per Subject"
          subtitle="Completed vs remaining curriculum topics"
        />
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={subjectTopicData}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b820" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    `${val} topics`,
                    name === 'completed' ? 'Completed Topics' : 'Remaining Topics'
                  ]}
                  labelFormatter={(_, items) => {
                    const item = items[0]?.payload;
                    return item ? `${item.fullName} (${item.percentage}% done)` : '';
                  }}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: '10px' }}
                  formatter={(val) => (
                    <span className="text-xs capitalize text-slate-600 dark:text-slate-400">
                      {val} Topics
                    </span>
                  )}
                />
                <Bar dataKey="completed" name="completed" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pending" name="pending" stackId="a" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
