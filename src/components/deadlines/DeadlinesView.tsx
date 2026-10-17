import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2,
  FileText,
  BookmarkCheck,
  Check
} from 'lucide-react';
import { useStudyOS } from '../../context/StudyOSContext';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { PriorityBadge, Badge } from '../ui/Badge';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { EmptyState } from '../ui/EmptyState';
import { DeadlineModal } from './DeadlineModal';
import { AcademicDeadline, DeadlineType } from '../../types';
import {
  getTodayDateString,
  getDeadlineInfo,
  formatFriendlyDate
} from '../../utils/dateUtils';

export const DeadlinesView: React.FC = () => {
  const {
    deadlines,
    subjects,
    toggleDeadlineStatus,
    deleteDeadline
  } = useStudyOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deadlineToEdit, setDeadlineToEdit] = useState<AcademicDeadline | null>(null);
  const [deadlineToDelete, setDeadlineToDelete] = useState<AcademicDeadline | null>(null);

  const todayStr = getTodayDateString();

  // Summary counts
  const totalDeadlines = deadlines.length;
  const completedCount = deadlines.filter((d) => d.status === 'Completed').length;
  const overdueCount = deadlines.filter(
    (d) => d.status !== 'Completed' && d.dueDate < todayStr
  ).length;
  const dueTodayCount = deadlines.filter(
    (d) => d.status !== 'Completed' && d.dueDate === todayStr
  ).length;

  const filteredDeadlines = useMemo(() => {
    return deadlines
      .filter((d) => {
        if (
          searchQuery &&
          !d.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !(d.notes && d.notes.toLowerCase().includes(searchQuery.toLowerCase()))
        ) {
          return false;
        }

        if (selectedSubject !== 'ALL' && d.subjectId !== selectedSubject) {
          return false;
        }

        if (selectedType !== 'ALL' && d.type !== selectedType) {
          return false;
        }

        if (selectedStatus !== 'ALL') {
          if (selectedStatus === 'Overdue') {
            return d.status !== 'Completed' && d.dueDate < todayStr;
          }
          if (selectedStatus === 'DueToday') {
            return d.status !== 'Completed' && d.dueDate === todayStr;
          }
          if (d.status !== selectedStatus) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Incomplete first, then by dueDate ascending
        if (a.status === 'Completed' && b.status !== 'Completed') return 1;
        if (a.status !== 'Completed' && b.status === 'Completed') return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
  }, [deadlines, searchQuery, selectedSubject, selectedType, selectedStatus, todayStr]);

  const handleEdit = (d: AcademicDeadline) => {
    setDeadlineToEdit(d);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setDeadlineToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Assignments & Examinations
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track submission deadlines, lab practicals, vivas, and exam dates.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition shrink-0"
        >
          <Plus size={16} />
          Add Deadline
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Due Today
          </span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {dueTodayCount}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Submissions due today</p>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Overdue
          </span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {overdueCount}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Past scheduled date</p>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Completed
          </span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {completedCount}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Submitted / Finished</p>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Tracked
          </span>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">
            {totalDeadlines}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Across this semester</p>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search assessment title or syllabus details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
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

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Types</option>
              <option value="Assignment">Assignment</option>
              <option value="Practical">Practical</option>
              <option value="Internal Test">Internal Test</option>
              <option value="Viva">Viva</option>
              <option value="Examination">Examination</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Status</option>
              <option value="DueToday">Due Today</option>
              <option value="Overdue">Overdue</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Deadlines List */}
      <Card>
        {filteredDeadlines.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No deadlines found"
            description="No assignments or examinations match your filters."
            actionLabel="Add Deadline"
            onAction={handleCreate}
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredDeadlines.map((deadline) => {
              const subject = subjects.find((s) => s.id === deadline.subjectId);
              const isCompleted = deadline.status === 'Completed';
              const countdown = getDeadlineInfo(deadline.dueDate, deadline.dueTime);

              return (
                <div
                  key={deadline.id}
                  className={`p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group ${
                    isCompleted ? 'bg-slate-50/40 dark:bg-slate-900/40' : ''
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => toggleDeadlineStatus(deadline.id)}
                      className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          onClick={() => handleEdit(deadline)}
                          className={`text-sm sm:text-base font-bold cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition ${
                            isCompleted
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {deadline.title}
                        </span>

                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                          {deadline.type}
                        </span>

                        <PriorityBadge priority={deadline.priority} size="sm" />

                        {/* Countdown Badge */}
                        {!isCompleted && (
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                              countdown.isOverdue
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
                                : countdown.isToday
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 animate-pulse'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {countdown.isOverdue && <AlertTriangle size={11} />}
                            {countdown.text}
                          </span>
                        )}
                      </div>

                      {deadline.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {deadline.notes}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-slate-400 dark:text-slate-500">
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

                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatFriendlyDate(deadline.dueDate)}
                        </span>

                        {deadline.dueTime && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {deadline.dueTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleEdit(deadline)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                      title="Edit assessment"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setDeadlineToDelete(deadline)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                      title="Delete assessment"
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

      {/* Deadline Modal */}
      <DeadlineModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setDeadlineToEdit(null);
        }}
        deadlineToEdit={deadlineToEdit}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deadlineToDelete}
        onClose={() => setDeadlineToDelete(null)}
        onConfirm={() => {
          if (deadlineToDelete) {
            deleteDeadline(deadlineToDelete.id);
            setDeadlineToDelete(null);
          }
        }}
        title="Delete Assessment Deadline"
        message={`Are you sure you want to remove "${deadlineToDelete?.title}"?`}
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
