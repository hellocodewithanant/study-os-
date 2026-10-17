import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Moon,
  Sun,
  Target,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Check,
  AlertTriangle,
  HardDrive
} from 'lucide-react';
import { useStudyOS } from '../../context/StudyOSContext';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { Modal } from '../ui/Modal';
import { validateImportedData } from '../../utils/storage';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    toggleTheme,
    resetAllData,
    exportData,
    importData,
    subjects,
    tasks,
    sessions,
    deadlines
  } = useStudyOS();

  // Local form state
  const [studentName, setStudentName] = useState(settings.studentName);
  const [program, setProgram] = useState(settings.program || 'B.Tech CSE');
  const [semester, setSemester] = useState(settings.semester || 'Semester 1');
  const [dailyTargetMinutes, setDailyTargetMinutes] = useState(settings.dailyTargetMinutes);
  const [weeklyTargetHours, setWeeklyTargetHours] = useState(settings.weeklyTargetHours);
  const [weekStart, setWeekStart] = useState(settings.weekStart || 'Monday');

  const [savedNotice, setSavedNotice] = useState(false);

  // Reset dialog
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Import JSON Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedJSONString, setImportedJSONString] = useState('');
  const [importValidationResult, setImportValidationResult] = useState<any>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      studentName: studentName.trim() || 'Student',
      program: program.trim() || 'B.Tech CSE',
      semester: semester.trim() || 'Semester 1',
      dailyTargetMinutes: Number(dailyTargetMinutes) || 180,
      weeklyTargetHours: Number(weeklyTargetHours) || 20,
      weekStart: weekStart as any
    });

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportedJSONString(content);
      const res = validateImportedData(content);
      setImportValidationResult(res);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!importedJSONString) return;
    const res = importData(importedJSONString);
    if (res.success) {
      setIsImportModalOpen(false);
      setImportedJSONString('');
      setImportValidationResult(null);
      alert('Data successfully imported!');
    } else {
      alert(`Import error: ${res.error}`);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Settings & Personalization
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your student profile, study targets, theme preferences, and data backups.
        </p>
      </div>

      {/* Storage Information Notice */}
      <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-3 text-xs text-indigo-900 dark:text-indigo-200">
        <HardDrive size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold">Local Storage Architecture</div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            StudyOS saves all your subjects, tasks, timetables, and logged sessions directly in your browser's LocalStorage. No accounts, tracking, or cloud servers are required. Your data survives browser refreshes and system restarts. You can export a JSON backup at any time.
          </p>
        </div>
      </div>

      {/* Form: Profile & Targets */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Student Profile */}
        <Card>
          <CardHeader
            title="Student Profile"
            subtitle="Personalize your greeting and dashboard headers"
          />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Semester
                </label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder="e.g. Semester 1"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Degree & Branch
              </label>
              <input
                type="text"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                placeholder="e.g. B.Tech Computer Science & Engineering"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Study Targets & Preferences */}
        <Card>
          <CardHeader
            title="Study Goals & Preferences"
            subtitle="Customize target hours and scheduling preferences"
          />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Daily Target (Minutes)
                </label>
                <input
                  type="number"
                  min="30"
                  max="720"
                  step="15"
                  value={dailyTargetMinutes}
                  onChange={(e) => setDailyTargetMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  = {(dailyTargetMinutes / 60).toFixed(1)} hours per day
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Weekly Target (Hours)
                </label>
                <input
                  type="number"
                  min="5"
                  max="80"
                  step="1"
                  value={weeklyTargetHours}
                  onChange={(e) => setWeeklyTargetHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Target for analytics & goals
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Week Starts On
                </label>
                <select
                  value={weekStart}
                  onChange={(e) => setWeekStart(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Monday">Monday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>
            </div>

            {/* Appearance Theme Toggle */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Interface Theme
                </span>
                <p className="text-xs text-slate-400">
                  Switch between clean light and dark workspace themes
                </p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                {settings.theme === 'dark' ? (
                  <>
                    <Sun size={15} className="text-amber-400" /> Light Mode
                  </>
                ) : (
                  <>
                    <Moon size={15} className="text-slate-600" /> Dark Mode
                  </>
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3">
          {savedNotice && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check size={14} /> Profile preferences saved!
            </span>
          )}
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition"
          >
            Save Settings
          </button>
        </div>
      </form>

      {/* Data Management & Backups */}
      <Card>
        <CardHeader
          title="Data Management & Backups"
          subtitle="Export your data, restore from JSON, or reset to sample defaults"
        />
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Export */}
            <button
              onClick={exportData}
              className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
            >
              <Download size={16} className="text-indigo-600 dark:text-indigo-400" />
              <span>Export Data (JSON)</span>
            </button>

            {/* Import */}
            <button
              onClick={() => {
                setImportedJSONString('');
                setImportValidationResult(null);
                setIsImportModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
            >
              <Upload size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span>Import Data (JSON)</span>
            </button>

            {/* Reset */}
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/50 text-xs font-semibold text-rose-700 dark:text-rose-400 transition"
            >
              <RotateCcw size={16} />
              <span>Reset to Sample Data</span>
            </button>
          </div>

          <div className="pt-2 text-xs text-slate-400">
            Current records stored: {subjects.length} subjects, {tasks.length} tasks, {sessions.length} study sessions, {deadlines.length} deadlines.
          </div>
        </CardContent>
      </Card>

      {/* Reset Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={resetAllData}
        title="Reset to Sample Data"
        message="Are you sure you want to restore the initial sample dataset? This will overwrite your current subjects, tasks, timetable entries, and study sessions."
        confirmLabel="Reset Everything"
        isDestructive={true}
      />

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import StudyOS Data"
        description="Select a valid StudyOS backup JSON file from your computer."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select JSON Backup File
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChosen}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>

          {/* Validation Result Preview */}
          {importValidationResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs ${
                importValidationResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-800 dark:text-rose-300'
              }`}
            >
              {importValidationResult.success ? (
                <div className="space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Check size={14} /> File Validated Successfully
                  </div>
                  <p>
                    Found: {importValidationResult.summary.subjectsCount} subjects,{' '}
                    {importValidationResult.summary.tasksCount} tasks,{' '}
                    {importValidationResult.summary.sessionsCount} sessions,{' '}
                    {importValidationResult.summary.deadlinesCount} deadlines.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Validation Failed
                  </div>
                  <p>{importValidationResult.error}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!importValidationResult || !importValidationResult.success}
              onClick={handleConfirmImport}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Replace & Import
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
