import React, { useState, useEffect } from 'react';
import { TimetableEntry, DayOfWeek } from '../../types';
import { useStudyOS } from '../../context/StudyOSContext';
import { Modal } from '../ui/Modal';
import { DAYS_OF_WEEK } from '../../utils/dateUtils';
import { AlertTriangle } from 'lucide-react';

interface TimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryToEdit?: TimetableEntry | null;
  defaultDay?: DayOfWeek;
}

export const TimetableModal: React.FC<TimetableModalProps> = ({
  isOpen,
  onClose,
  entryToEdit,
  defaultDay = 'Monday'
}) => {
  const { subjects, timetable, addTimetableEntry, updateTimetableEntry } = useStudyOS();

  const [subjectId, setSubjectId] = useState('');
  const [topic, setTopic] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(defaultDay);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [overlapWarning, setOverlapWarning] = useState<string | null>(null);

  useEffect(() => {
    if (entryToEdit) {
      setSubjectId(entryToEdit.subjectId);
      setTopic(entryToEdit.topic);
      setDayOfWeek(entryToEdit.dayOfWeek);
      setStartTime(entryToEdit.startTime);
      setEndTime(entryToEdit.endTime);
      setLocation(entryToEdit.location || '');
      setNotes(entryToEdit.notes || '');
    } else {
      setSubjectId(subjects[0]?.id || '');
      setTopic('');
      setDayOfWeek(defaultDay);
      setStartTime('09:00');
      setEndTime('10:30');
      setLocation('');
      setNotes('');
    }
    setError('');
    setOverlapWarning(null);
  }, [entryToEdit, isOpen, subjects, defaultDay]);

  // Check for time overlap whenever times or day change
  useEffect(() => {
    if (!startTime || !endTime || !dayOfWeek) return;

    // Check if end is before start
    if (endTime <= startTime) {
      setError('End time must be after start time');
      setOverlapWarning(null);
      return;
    } else {
      setError('');
    }

    // Overlap check
    const sameDayEntries = timetable.filter((tt) => {
      if (entryToEdit && tt.id === entryToEdit.id) return false;
      return tt.dayOfWeek === dayOfWeek;
    });

    const hasOverlap = sameDayEntries.find((tt) => {
      return (
        (startTime >= tt.startTime && startTime < tt.endTime) ||
        (endTime > tt.startTime && endTime <= tt.endTime) ||
        (startTime <= tt.startTime && endTime >= tt.endTime)
      );
    });

    if (hasOverlap) {
      const subject = subjects.find((s) => s.id === hasOverlap.subjectId);
      setOverlapWarning(
        `Notice: Overlaps with "${subject?.name || 'Session'}" (${hasOverlap.startTime} - ${hasOverlap.endTime})`
      );
    } else {
      setOverlapWarning(null);
    }
  }, [dayOfWeek, startTime, endTime, timetable, entryToEdit, subjects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!subjectId) {
      setError('Please select a subject');
      return;
    }
    if (endTime <= startTime) {
      setError('End time must be after start time');
      return;
    }

    if (entryToEdit) {
      updateTimetableEntry(entryToEdit.id, {
        subjectId,
        topic: topic.trim() || 'General Lecture',
        dayOfWeek,
        startTime,
        endTime,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined
      });
    } else {
      addTimetableEntry({
        subjectId,
        topic: topic.trim() || 'General Lecture',
        dayOfWeek,
        startTime,
        endTime,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
        completed: false
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={entryToEdit ? 'Edit Timetable Entry' : 'Add Timetable Entry'}
      description="Schedule regular lectures, labs, tutorials, or study blocks."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Subject & Day */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Subject *
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Day of Week *
            </label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Start Time & End Time */}
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Start Time *
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              End Time *
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Validation Errors & Overlap Warning */}
        {error && <p className="text-xs text-rose-500">{error}</p>}
        {overlapWarning && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs border border-amber-200 dark:border-amber-800/60">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{overlapWarning}</span>
          </div>
        )}

        {/* Topic / Activity */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Topic or Activity
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. CPU Scheduling Lecture or Lab Practical"
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Location & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Location / Room (Optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. LHC Room 204 or Systems Lab"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bring notebook & calculator"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition"
          >
            {entryToEdit ? 'Save Changes' : 'Add to Timetable'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
