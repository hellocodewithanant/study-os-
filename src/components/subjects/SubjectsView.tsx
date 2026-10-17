import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Clock,
  CheckCircle2,
  ListOrdered,
  Calendar,
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Edit2,
  Trash2,
  Play
} from 'lucide-react';
import { useStudyOS } from '../../context/StudyOSContext';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { EmptyState } from '../ui/EmptyState';
import { SubjectModal } from './SubjectModal';
import { SubjectDetailModal } from './SubjectDetailModal';
import { Subject } from '../../types';
import { formatMinutes } from '../../utils/dateUtils';
import {
  calculateSubjectTotalStudyMinutes,
  calculateSubjectWeeklyStudyMinutes,
  calculateSubjectTopicProgress
} from '../../utils/calculations';

export const SubjectsView: React.FC = () => {
  const {
    subjects,
    tasks,
    sessions,
    deleteSubject,
    startTimer,
    setActiveTab
  } = useStudyOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterProgress, setFilterProgress] = useState<'ALL' | 'IN_PROGRESS' | 'COMPLETED' | 'NOT_STARTED'>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'time'>('name');

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);
  const [selectedSubjectDetail, setSelectedSubjectDetail] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  // Subject cards enriched with live stats
  const enrichedSubjects = useMemo(() => {
    return subjects.map((subject) => {
      const topicStats = calculateSubjectTopicProgress(subject);
      const totalStudyMinutes = calculateSubjectTotalStudyMinutes(subject.id, sessions);
      const weeklyStudyMinutes = calculateSubjectWeeklyStudyMinutes(subject.id, sessions);

      // Find next pending task for this subject
      const nextTask = tasks
        .filter((t) => t.subjectId === subject.id && t.status !== 'Completed')
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

      return {
        subject,
        topicStats,
        totalStudyMinutes,
        weeklyStudyMinutes,
        nextTask
      };
    });
  }, [subjects, sessions, tasks]);

  // Filter & sort
  const filteredSubjects = useMemo(() => {
    return enrichedSubjects
      .filter(({ subject, topicStats }) => {
        if (searchQuery) {
          const matchName = subject.name.toLowerCase().includes(searchQuery.toLowerCase());
          const matchCode = subject.code && subject.code.toLowerCase().includes(searchQuery.toLowerCase());
          if (!matchName && !matchCode) return false;
        }

        if (filterProgress === 'COMPLETED') {
          return topicStats.total > 0 && topicStats.completed === topicStats.total;
        }
        if (filterProgress === 'NOT_STARTED') {
          return topicStats.completed === 0;
        }
        if (filterProgress === 'IN_PROGRESS') {
          return topicStats.total > 0 && topicStats.completed > 0 && topicStats.completed < topicStats.total;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.subject.name.localeCompare(b.subject.name);
        }
        if (sortBy === 'progress') {
          return b.topicStats.percentage - a.topicStats.percentage;
        }
        if (sortBy === 'time') {
          return b.totalStudyMinutes - a.totalStudyMinutes;
        }
        return 0;
      });
  }, [enrichedSubjects, searchQuery, filterProgress, sortBy]);

  const handleOpenDetail = (subject: Subject) => {
    // Keep reference updated
    const fresh = subjects.find((s) => s.id === subject.id) || subject;
    setSelectedSubjectDetail(fresh);
  };

  const handleEdit = (e: React.MouseEvent, subject: Subject) => {
    e.stopPropagation();
    setSubjectToEdit(subject);
    setIsEditModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, subject: Subject) => {
    e.stopPropagation();
    setSubjectToDelete(subject);
  };

  const handleStartTimer = (e: React.MouseEvent, subjectId: string) => {
    e.stopPropagation();
    startTimer(subjectId);
    setActiveTab('study-tracker');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Academic Subjects
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track syllabus coverage, topic completion checklists, and logged study hours.
          </p>
        </div>
        <button
          onClick={() => {
            setSubjectToEdit(null);
            setIsEditModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition shrink-0"
        >
          <Plus size={16} />
          Add Subject
        </button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search subjects by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterProgress}
              onChange={(e) => setFilterProgress(e.target.value as any)}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Subjects ({subjects.length})</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="NOT_STARTED">Not Started</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="name">Sort by Name</option>
              <option value="progress">Sort by Topic Progress %</option>
              <option value="time">Sort by Total Study Time</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Subject Cards Grid */}
      {filteredSubjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No subjects match your criteria"
          description="Try clearing search filters or add a new subject."
          actionLabel="Add Subject"
          onAction={() => {
            setSubjectToEdit(null);
            setIsEditModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredSubjects.map(({ subject, topicStats, totalStudyMinutes, weeklyStudyMinutes, nextTask }) => {
            return (
              <Card
                key={subject.id}
                hoverable
                onClick={() => handleOpenDetail(subject)}
                className="cursor-pointer flex flex-col justify-between overflow-hidden border-t-4"
                style={{ borderTopColor: subject.color }}
              >
                <div className="p-5 space-y-4">
                  {/* Card Title & Code */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                          {subject.name}
                        </h3>
                      </div>
                      {subject.code && (
                        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase">
                          {subject.code}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleStartTimer(e, subject.id)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition"
                        title="Start study timer for this subject"
                      >
                        <Play size={15} />
                      </button>
                      <button
                        onClick={(e) => handleEdit(e, subject)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        title="Edit subject"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, subject)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                        title="Delete subject"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Topic Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-slate-500 dark:text-slate-400">
                        Topic Progress ({topicStats.completed}/{topicStats.total})
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {topicStats.percentage}%
                      </span>
                    </div>
                    {topicStats.total === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">
                        No syllabus topics added yet. Click card to add topics.
                      </p>
                    ) : (
                      <ProgressBar
                        progress={topicStats.percentage}
                        color={subject.color}
                        size="md"
                      />
                    )}
                  </div>

                  {/* Study Time Metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400">Total Logged</span>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                        {formatMinutes(totalStudyMinutes)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">This Week</span>
                      <div className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {formatMinutes(weeklyStudyMinutes)}
                        <span className="text-[10px] text-slate-400 font-normal ml-1">
                          / {subject.weeklyTargetHours || 3}h
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Next upcoming task pill */}
                  {nextTask && (
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Next Up
                      </span>
                      <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {nextTask.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Due: {nextTask.dueDate}
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-5 py-2.5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-right">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    View Syllabus & Topics →
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit / Create Subject Modal */}
      <SubjectModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSubjectToEdit(null);
        }}
        subjectToEdit={subjectToEdit}
      />

      {/* Detailed Subject Modal (Syllabus checklist, Sessions, Tasks) */}
      <SubjectDetailModal
        isOpen={!!selectedSubjectDetail}
        onClose={() => setSelectedSubjectDetail(null)}
        subject={
          selectedSubjectDetail
            ? subjects.find((s) => s.id === selectedSubjectDetail.id) || selectedSubjectDetail
            : null
        }
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!subjectToDelete}
        onClose={() => setSubjectToDelete(null)}
        onConfirm={() => {
          if (subjectToDelete) {
            deleteSubject(subjectToDelete.id);
            setSubjectToDelete(null);
          }
        }}
        title="Delete Subject"
        message={`Are you sure you want to delete "${subjectToDelete?.name}"? Its syllabus topics will be removed.`}
        confirmLabel="Delete Subject"
        isDestructive={true}
      />
    </div>
  );
};
