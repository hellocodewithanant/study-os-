import React, { useState } from 'react';
import {
  Timer as TimerIcon,
  Play,
  Pause,
  Square,
  RotateCcw,
  Plus,
  Save,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  Target,
  BookOpen,
  Coffee
} from 'lucide-react';
import { useStudyOS } from '../../context/StudyOSContext';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import {
  formatSecondsToHHMMSS,
  formatMinutes,
  getTodayDateString,
  formatFriendlyDate
} from '../../utils/dateUtils';
import {
  calculateTodayStudyMinutes,
  calculateWeeklyStudyMinutes,
  calculateSubjectTotalStudyMinutes,
  calculateSubjectWeeklyStudyMinutes
} from '../../utils/calculations';
import { StudySession } from '../../types';

export const StudyTrackerView: React.FC = () => {
  const {
    subjects,
    sessions,
    settings,
    timer,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    addStudySession,
    deleteStudySession
  } = useStudyOS();

  // Local form state for starting a timer
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    timer.subjectId || subjects[0]?.id || ''
  );
  const [topicInput, setTopicInput] = useState<string>(timer.topic || '');

  // Save session modal state (when stopping timer or manually logging)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveSubjectId, setSaveSubjectId] = useState('');
  const [saveTopic, setSaveTopic] = useState('');
  const [saveDurationMinutes, setSaveDurationMinutes] = useState(30);
  const [saveDate, setSaveDate] = useState(getTodayDateString());
  const [saveNotes, setSaveNotes] = useState('');

  // Manual Log Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Deletion confirm
  const [sessionToDelete, setSessionToDelete] = useState<StudySession | null>(null);

  const todayStr = getTodayDateString();
  const todayStudyMinutes = calculateTodayStudyMinutes(sessions);
  const weeklyStudyMinutes = calculateWeeklyStudyMinutes(sessions);
  const dailyTargetMinutes = settings.dailyTargetMinutes || 180;
  const weeklyTargetMinutes = (settings.weeklyTargetHours || 20) * 60;

  const dailyProgressPercent = Math.min(
    100,
    Math.round((todayStudyMinutes / dailyTargetMinutes) * 100)
  );
  const weeklyProgressPercent = Math.min(
    100,
    Math.round((weeklyStudyMinutes / weeklyTargetMinutes) * 100)
  );

  // Handle timer Start
  const handleStart = () => {
    if (!selectedSubjectId) return;
    startTimer(selectedSubjectId, topicInput);
  };

  // Handle timer Stop (opens save dialog with actual calculated duration)
  const handleStop = () => {
    const result = stopTimer();
    if (result && result.durationMinutes > 0) {
      setSaveSubjectId(result.subjectId);
      setSaveTopic(result.topic || '');
      setSaveDurationMinutes(result.durationMinutes);
      setSaveDate(getTodayDateString());
      setSaveNotes('');
      setIsSaveModalOpen(true);
    }
  };

  // Handle saving the completed session
  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveSubjectId || saveDurationMinutes <= 0) return;

    addStudySession({
      subjectId: saveSubjectId,
      topic: saveTopic.trim() || undefined,
      startTime: `${saveDate}T10:00:00.000Z`,
      endTime: `${saveDate}T11:00:00.000Z`,
      durationMinutes: Number(saveDurationMinutes),
      date: saveDate,
      notes: saveNotes.trim() || undefined
    });

    setIsSaveModalOpen(false);
    setIsManualModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Study Session Tracker
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Precision stopwatch, deep work sessions, study targets, and historical logs.
          </p>
        </div>

        <button
          onClick={() => {
            setSaveSubjectId(subjects[0]?.id || '');
            setSaveTopic('');
            setSaveDurationMinutes(45);
            setSaveDate(getTodayDateString());
            setSaveNotes('');
            setIsManualModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-sm font-semibold rounded-xl border border-indigo-200 dark:border-indigo-800 transition shrink-0"
        >
          <Plus size={16} />
          Log Past Session
        </button>
      </div>

      {/* Main Study Timer Card */}
      <Card className="p-6 sm:p-8 bg-linear-to-b from-white via-indigo-50/10 to-white dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 border-indigo-200/60 dark:border-indigo-900/40">
        <div className="max-w-xl mx-auto text-center space-y-6">
          {/* Subject & Topic Selectors (if not active or to switch) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Study Subject
              </label>
              <select
                disabled={timer.isActive}
                value={timer.isActive ? timer.subjectId : selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Topic / Chapter (Optional)
              </label>
              <input
                type="text"
                disabled={timer.isActive}
                value={timer.isActive ? timer.topic : topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="e.g. Dynamic Programming or Lab Work"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Large Stopwatch Display */}
          <div className="py-6">
            <div className="font-mono text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-xs">
              {formatSecondsToHHMMSS(timer.currentElapsedSeconds)}
            </div>
            <div className="flex items-center justify-center gap-2 mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              {timer.isActive ? (
                timer.isPaused ? (
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Timer Paused
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Focus Session in Progress
                  </span>
                )
              ) : (
                <span>Ready to begin deep work</span>
              )}
            </div>
          </div>

          {/* Timer Action Controls */}
          <div className="flex items-center justify-center gap-3">
            {!timer.isActive ? (
              <button
                onClick={handleStart}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition transform active:scale-95"
              >
                <Play size={18} />
                Start Session
              </button>
            ) : (
              <>
                {timer.isPaused ? (
                  <button
                    onClick={resumeTimer}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs transition"
                  >
                    <Play size={16} />
                    Resume
                  </button>
                ) : (
                  <button
                    onClick={pauseTimer}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-xs transition"
                  >
                    <Pause size={16} />
                    Pause
                  </button>
                )}

                <button
                  onClick={handleStop}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-xs transition"
                >
                  <Square size={16} />
                  Stop & Save
                </button>

                <button
                  onClick={resetTimer}
                  className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Reset timer without saving"
                >
                  <RotateCcw size={18} />
                </button>
              </>
            )}
          </div>

          {/* Break reminder advisory */}
          <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Coffee size={14} />
            <span>Suggested: 5-minute break after every 45-50 minutes of deep focus.</span>
          </div>
        </div>
      </Card>

      {/* Study Targets Progress Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Target Card */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
                <Target size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Daily Study Target
                </h4>
                <p className="text-[11px] text-slate-400">
                  Target: {formatMinutes(dailyTargetMinutes)} ({dailyTargetMinutes / 60} hrs)
                </p>
              </div>
            </div>
            <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
              {dailyProgressPercent}%
            </span>
          </div>

          <ProgressBar progress={dailyProgressPercent} color="#6366f1" size="md" />

          <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
            <span>Completed: {formatMinutes(todayStudyMinutes)}</span>
            <span>
              {dailyTargetMinutes > todayStudyMinutes
                ? `${formatMinutes(dailyTargetMinutes - todayStudyMinutes)} remaining`
                : 'Target achieved! 🎉'}
            </span>
          </div>
        </Card>

        {/* Weekly Target Card */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                <Target size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Weekly Study Target
                </h4>
                <p className="text-[11px] text-slate-400">
                  Target: {settings.weeklyTargetHours || 20} hours / week
                </p>
              </div>
            </div>
            <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
              {weeklyProgressPercent}%
            </span>
          </div>

          <ProgressBar progress={weeklyProgressPercent} color="#10b981" size="md" />

          <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
            <span>Completed: {(weeklyStudyMinutes / 60).toFixed(1)} hrs</span>
            <span>
              {weeklyTargetMinutes > weeklyStudyMinutes
                ? `${formatMinutes(weeklyTargetMinutes - weeklyStudyMinutes)} remaining`
                : 'Weekly target achieved! 🚀'}
            </span>
          </div>
        </Card>
      </div>

      {/* Logged Sessions History List */}
      <Card>
        <CardHeader
          title="Recorded Study Sessions"
          subtitle={`Total ${sessions.length} logged study sessions`}
        />
        <CardContent className="p-0">
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No study sessions recorded yet. Start the stopwatch above or click "Log Past Session".
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
              {sessions.map((session) => {
                const subject = subjects.find((s) => s.id === session.subjectId);

                return (
                  <div
                    key={session.id}
                    className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
                        <Clock size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {session.topic || 'General Revision'}
                          </h4>
                          {subject && (
                            <span
                              className="text-[11px] font-medium px-2 py-0.5 rounded"
                              style={{
                                backgroundColor: `${subject.color}15`,
                                color: subject.color
                              }}
                            >
                              {subject.name}
                            </span>
                          )}
                        </div>

                        {session.notes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 italic">
                            "{session.notes}"
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} /> {formatFriendlyDate(session.date)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                        {formatMinutes(session.durationMinutes)}
                      </span>
                      <button
                        onClick={() => setSessionToDelete(session)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                        title="Delete session"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Session Modal (Triggered by Stop or Manual Log) */}
      <Modal
        isOpen={isSaveModalOpen || isManualModalOpen}
        onClose={() => {
          setIsSaveModalOpen(false);
          setIsManualModalOpen(false);
        }}
        title="Save Study Session"
        description="Record your study duration into your analytics and subject tracker."
        maxWidth="md"
      >
        <form onSubmit={handleSaveSession} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Subject *
            </label>
            <select
              value={saveSubjectId}
              onChange={(e) => setSaveSubjectId(e.target.value)}
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
              Topic / Chapter Covered
            </label>
            <input
              type="text"
              value={saveTopic}
              onChange={(e) => setSaveTopic(e.target.value)}
              placeholder="e.g. Pointer arithmetic practice"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Duration (Minutes) *
              </label>
              <input
                type="number"
                min="1"
                max="720"
                value={saveDurationMinutes}
                onChange={(e) => setSaveDurationMinutes(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Session Date *
              </label>
              <input
                type="date"
                value={saveDate}
                onChange={(e) => setSaveDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Session Reflections / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={saveNotes}
              onChange={(e) => setSaveNotes(e.target.value)}
              placeholder="Key breakthroughs, formulas remembered, problems solved..."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsSaveModalOpen(false);
                setIsManualModalOpen(false);
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition"
            >
              Save Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        onConfirm={() => {
          if (sessionToDelete) {
            deleteStudySession(sessionToDelete.id);
            setSessionToDelete(null);
          }
        }}
        title="Delete Study Record"
        message="Are you sure you want to delete this recorded study session? This will update your daily and weekly study totals."
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
