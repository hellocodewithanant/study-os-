import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Calendar,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  Play
} from 'lucide-react';
import { useStudyOS } from '../../context/StudyOSContext';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { PriorityBadge, StatusBadge, Badge } from '../ui/Badge';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { EmptyState } from '../ui/EmptyState';
import { TaskModal } from './TaskModal';
import { Task, Priority, TaskCategory, TaskStatus } from '../../types';
import {
  getTodayDateString,
  getDeadlineInfo,
  formatFriendlyDate,
  formatMinutes
} from '../../utils/dateUtils';
import {
  calculateDailyTaskProgress,
  calculateWeeklyTaskProgress,
  getOverdueTasks
} from '../../utils/calculations';

export const TasksView: React.FC = () => {
  const {
    tasks,
    subjects,
    toggleTaskStatus,
    deleteTask,
    startTimer,
    setActiveTab
  } = useStudyOS();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const todayStr = getTodayDateString();

  // Calculated metrics
  const dailyProgress = calculateDailyTaskProgress(tasks);
  const weeklyProgress = calculateWeeklyTaskProgress(tasks);
  const overdueTasks = getOverdueTasks(tasks);

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        // Search
        if (
          searchQuery &&
          !t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !(t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
        ) {
          return false;
        }
        // Subject
        if (selectedSubject !== 'ALL' && t.subjectId !== selectedSubject) {
          return false;
        }
        // Status
        if (selectedStatus !== 'ALL') {
          if (selectedStatus === 'Overdue') {
            return t.status !== 'Completed' && t.dueDate < todayStr;
          }
          if (t.status !== selectedStatus) {
            return false;
          }
        }
        // Priority
        if (selectedPriority !== 'ALL' && t.priority !== selectedPriority) {
          return false;
        }
        // Category
        if (selectedCategory !== 'ALL' && t.category !== selectedCategory) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          const comp = a.dueDate.localeCompare(b.dueDate);
          return sortOrder === 'asc' ? comp : -comp;
        }
        if (sortBy === 'priority') {
          const weights: Record<Priority, number> = { High: 3, Medium: 2, Low: 1 };
          const comp = weights[b.priority] - weights[a.priority];
          return sortOrder === 'asc' ? comp : -comp;
        }
        if (sortBy === 'title') {
          const comp = a.title.localeCompare(b.title);
          return sortOrder === 'asc' ? comp : -comp;
        }
        return 0;
      });
  }, [
    tasks,
    searchQuery,
    selectedSubject,
    selectedStatus,
    selectedPriority,
    selectedCategory,
    sortBy,
    sortOrder,
    todayStr
  ]);

  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const categories: TaskCategory[] = [
    'Daily Study',
    'Assignment',
    'Practical or Lab',
    'Revision',
    'Exam Preparation',
    'Personal'
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            My Study Tasks
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Organize daily syllabus checklists, lab work, revisions, and homework.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition shrink-0"
        >
          <Plus size={16} />
          Create Task
        </button>
      </div>

      {/* Task Summary Badges / Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Today's Completion
          </span>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {dailyProgress.percentage}%
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {dailyProgress.completed} of {dailyProgress.total} completed
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Weekly Completion
          </span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {weeklyProgress.percentage}%
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {weeklyProgress.completed} of {weeklyProgress.total} this week
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Pending Tasks
          </span>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">
            {tasks.filter((t) => t.status !== 'Completed').length}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Across all subjects</p>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Overdue Tasks
          </span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {overdueTasks.length}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Requires immediate attention</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search tasks by title or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Filters Grid */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Sort Toggle */}
            <button
              onClick={() => {
                if (sortBy === 'dueDate') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('dueDate');
                  setSortOrder('asc');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
              title="Toggle Sort by Due Date"
            >
              <ArrowUpDown size={14} />
              <span>Sort: Due Date ({sortOrder.toUpperCase()})</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Tasks List */}
      <Card>
        {filteredTasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks found"
            description={
              searchQuery || selectedSubject !== 'ALL' || selectedStatus !== 'ALL'
                ? 'Try adjusting your search or filter settings.'
                : 'You have no study tasks yet. Create one to organize your revision.'
            }
            actionLabel="Create New Task"
            onAction={handleCreate}
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTasks.map((task) => {
              const subject = subjects.find((s) => s.id === task.subjectId);
              const isCompleted = task.status === 'Completed';
              const deadlineInfo = getDeadlineInfo(task.dueDate, task.dueTime);

              return (
                <div
                  key={task.id}
                  className={`p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition group ${
                    isCompleted ? 'bg-slate-50/40 dark:bg-slate-900/40' : ''
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => toggleTaskStatus(task.id)}
                      className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          onClick={() => handleEdit(task)}
                          className={`text-sm sm:text-base font-semibold cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition ${
                            isCompleted
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {task.title}
                        </span>

                        <PriorityBadge priority={task.priority} size="sm" />
                        <StatusBadge status={task.status} size="sm" />

                        {/* Overdue tag */}
                        {!isCompleted && deadlineInfo.isOverdue && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
                            <AlertTriangle size={11} />
                            {deadlineInfo.text}
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2.5 mt-2 flex-wrap text-xs text-slate-400 dark:text-slate-500">
                        {subject && (
                          <span
                            className="inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded text-[11px]"
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

                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px]">
                          {task.category}
                        </span>

                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatFriendlyDate(task.dueDate)}
                        </span>

                        {task.dueTime && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {task.dueTime}
                          </span>
                        )}

                        {task.estimatedMinutes && (
                          <span>~{formatMinutes(task.estimatedMinutes)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    {!isCompleted && subject && (
                      <button
                        onClick={() => {
                          startTimer(subject.id, task.title);
                          setActiveTab('study-tracker');
                        }}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition"
                        title="Start study timer for this task"
                      >
                        <Play size={16} />
                      </button>
                    )}

                    <button
                      onClick={() => handleEdit(task)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                      title="Edit task"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      onClick={() => setTaskToDelete(task)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
      />

      {/* Confirmation Dialog for Deleting Task */}
      <ConfirmationDialog
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            deleteTask(taskToDelete.id);
            setTaskToDelete(null);
          }
        }}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
