import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  Trash2,
  Edit2,
  Check,
  Sparkles,
  Calendar
} from 'lucide-react';
import { useStudyOS } from '../../context/StudyOSContext';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { TimetableModal } from './TimetableModal';
import { TimetableEntry, DayOfWeek } from '../../types';
import { DAYS_OF_WEEK, getCurrentDayOfWeek } from '../../utils/dateUtils';

export const TimetableView: React.FC = () => {
  const {
    timetable,
    subjects,
    toggleTimetableCompletion,
    deleteTimetableEntry
  } = useStudyOS();

  const currentDay = getCurrentDayOfWeek();
  const [selectedMobileDay, setSelectedMobileDay] = useState<DayOfWeek>(currentDay);
  const [activeViewMode, setActiveViewMode] = useState<'week' | 'day'>('week');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<TimetableEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<TimetableEntry | null>(null);

  const handleEdit = (entry: TimetableEntry) => {
    setEntryToEdit(entry);
    setIsModalOpen(true);
  };

  const handleCreate = (day?: DayOfWeek) => {
    setEntryToEdit(null);
    if (day) setSelectedMobileDay(day);
    setIsModalOpen(true);
  };

  // Group entries by day of week
  const entriesByDay: Record<DayOfWeek, TimetableEntry[]> = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  };

  timetable.forEach((entry) => {
    if (entriesByDay[entry.dayOfWeek]) {
      entriesByDay[entry.dayOfWeek].push(entry);
    }
  });

  // Sort each day chronologically
  DAYS_OF_WEEK.forEach((day) => {
    entriesByDay[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Weekly Class Timetable</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-400">
              Today: {currentDay}
            </span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Organize lectures, lab practicals, tutorials, and structured study blocks.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* View toggle on tablet/desktop */}
          <div className="hidden md:flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveViewMode('week')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeViewMode === 'week'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Full Week
            </button>
            <button
              onClick={() => setActiveViewMode('day')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeViewMode === 'day'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Day by Day
            </button>
          </div>

          <button
            onClick={() => handleCreate()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition shrink-0"
          >
            <Plus size={16} />
            Add Entry
          </button>
        </div>
      </div>

      {/* MOBILE DAY SELECTOR (Always on mobile, or when Day view active) */}
      <div className={`flex items-center gap-1.5 overflow-x-auto pb-2 ${activeViewMode === 'week' ? 'md:hidden' : ''}`}>
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedMobileDay === day;
          const isToday = currentDay === day;
          const count = entriesByDay[day].length;

          return (
            <button
              key={day}
              onClick={() => setSelectedMobileDay(day)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isToday
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <span>{day.slice(0, 3)}</span>
              {isToday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* MOBILE / SINGLE DAY VIEW */}
      <div className={`${activeViewMode === 'week' ? 'md:hidden' : ''}`}>
        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <span>{selectedMobileDay} Schedule</span>
                {selectedMobileDay === currentDay && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                    Today
                  </span>
                )}
              </div>
            }
            subtitle={`${entriesByDay[selectedMobileDay].length} scheduled sessions`}
            action={
              <button
                onClick={() => handleCreate(selectedMobileDay)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Add Slot
              </button>
            }
          />
          <CardContent className="p-0">
            {entriesByDay[selectedMobileDay].length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No classes scheduled for {selectedMobileDay}.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {entriesByDay[selectedMobileDay].map((entry) => {
                  const subject = subjects.find((s) => s.id === entry.subjectId);
                  const isDone = !!entry.completed;

                  return (
                    <div
                      key={entry.id}
                      className={`p-4 flex items-start gap-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition ${
                        isDone ? 'bg-slate-50/50 dark:bg-slate-900/30' : ''
                      }`}
                    >
                      {/* Time pill */}
                      <div className="w-18 shrink-0 py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-center font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <div>{entry.startTime}</div>
                        <div className="text-[10px] text-slate-400 font-normal">to {entry.endTime}</div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {subject && (
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: subject.color }}
                            />
                          )}
                          <h4
                            className={`text-sm font-bold truncate ${
                              isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {subject ? subject.name : 'Class Session'}
                          </h4>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {entry.topic || 'General Lecture'}
                        </p>

                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 flex-wrap">
                          {entry.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={11} /> {entry.location}
                            </span>
                          )}
                          {entry.notes && <span className="italic">"{entry.notes}"</span>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => toggleTimetableCompletion(entry.id)}
                          className={`p-1.5 rounded-lg transition ${
                            isDone
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title="Toggle completion"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(entry)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setEntryToDelete(entry)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* DESKTOP FULL WEEK VIEW (7 Column Responsive Grid) */}
      <div className={`hidden ${activeViewMode === 'week' ? 'md:grid' : ''} grid-cols-7 gap-3`}>
        {DAYS_OF_WEEK.map((day) => {
          const isToday = currentDay === day;
          const dayEntries = entriesByDay[day];

          return (
            <div
              key={day}
              className={`flex flex-col rounded-xl border transition-all ${
                isToday
                  ? 'bg-indigo-50/20 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Day Column Header */}
              <div
                className={`p-3 border-b flex items-center justify-between text-xs font-semibold ${
                  isToday
                    ? 'border-indigo-100 dark:border-indigo-800/80 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span>{day}</span>
                  {isToday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                </div>
                <button
                  onClick={() => handleCreate(day)}
                  className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-white/80 dark:hover:bg-slate-800 transition"
                  title={`Add entry for ${day}`}
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* Day Sessions List */}
              <div className="p-2 space-y-2 flex-1 min-h-[360px]">
                {dayEntries.length === 0 ? (
                  <div className="h-full flex items-center justify-center p-4 text-center text-[11px] text-slate-400 italic">
                    No classes
                  </div>
                ) : (
                  dayEntries.map((entry) => {
                    const subject = subjects.find((s) => s.id === entry.subjectId);
                    const isDone = !!entry.completed;

                    return (
                      <div
                        key={entry.id}
                        className={`p-2.5 rounded-lg border text-xs relative group transition ${
                          isDone
                            ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 opacity-75'
                            : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 shadow-2xs hover:shadow-xs'
                        }`}
                        style={{
                          borderLeftWidth: '3.5px',
                          borderLeftColor: subject ? subject.color : '#6366f1'
                        }}
                      >
                        {/* Time & Complete Checkbox */}
                        <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mb-1">
                          <span>
                            {entry.startTime} - {entry.endTime}
                          </span>
                          <button
                            onClick={() => toggleTimetableCompletion(entry.id)}
                            className={`p-0.5 rounded transition ${
                              isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 hover:text-emerald-500'
                            }`}
                            title="Toggle session complete"
                          >
                            <CheckCircle2 size={13} />
                          </button>
                        </div>

                        {/* Title */}
                        <div
                          className={`font-semibold truncate text-[11px] ${
                            isDone
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {subject ? subject.name : 'Class'}
                        </div>

                        {/* Topic */}
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {entry.topic || 'General Session'}
                        </div>

                        {/* Location */}
                        {entry.location && (
                          <div className="text-[10px] text-slate-400 truncate mt-1 flex items-center gap-1">
                            <MapPin size={10} /> {entry.location}
                          </div>
                        )}

                        {/* Hover action buttons */}
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex items-center gap-0.5 bg-white/90 dark:bg-slate-800/90 rounded p-0.5 shadow-xs transition">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            title="Edit"
                          >
                            <Edit2 size={11} />
                          </button>
                          <button
                            onClick={() => setEntryToDelete(entry)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Timetable Modal */}
      <TimetableModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEntryToEdit(null);
        }}
        entryToEdit={entryToEdit}
        defaultDay={selectedMobileDay}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!entryToDelete}
        onClose={() => setEntryToDelete(null)}
        onConfirm={() => {
          if (entryToDelete) {
            deleteTimetableEntry(entryToDelete.id);
            setEntryToDelete(null);
          }
        }}
        title="Delete Timetable Entry"
        message={`Are you sure you want to remove this timetable entry?`}
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
