import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit2,
  Clock,
  BookOpen,
  Calendar,
  Check,
  Play,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import { Subject, Topic } from '../../types';
import { useStudyOS } from '../../context/StudyOSContext';
import { Modal } from '../ui/Modal';
import { ProgressBar } from '../ui/ProgressBar';
import { PriorityBadge, Badge } from '../ui/Badge';
import { formatMinutes } from '../../utils/dateUtils';
import {
  calculateSubjectTotalStudyMinutes,
  calculateSubjectWeeklyStudyMinutes,
  calculateSubjectTopicProgress
} from '../../utils/calculations';

interface SubjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
}

export const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({
  isOpen,
  onClose,
  subject
}) => {
  const {
    tasks,
    sessions,
    deadlines,
    addTopic,
    toggleTopic,
    updateTopic,
    deleteTopic,
    startTimer,
    setActiveTab
  } = useStudyOS();

  const [newTopicName, setNewTopicName] = useState('');
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingTopicName, setEditingTopicName] = useState('');
  const [activeTab, setModalTab] = useState<'syllabus' | 'tasks' | 'deadlines' | 'sessions'>('syllabus');

  if (!subject) return null;

  const topicStats = calculateSubjectTopicProgress(subject);
  const totalStudyMinutes = calculateSubjectTotalStudyMinutes(subject.id, sessions);
  const weeklyStudyMinutes = calculateSubjectWeeklyStudyMinutes(subject.id, sessions);

  const subjectTasks = tasks.filter((t) => t.subjectId === subject.id);
  const subjectDeadlines = deadlines.filter((d) => d.subjectId === subject.id);
  const subjectSessions = sessions.filter((s) => s.subjectId === subject.id);

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    addTopic(subject.id, newTopicName.trim());
    setNewTopicName('');
  };

  const handleStartEdit = (topic: Topic) => {
    setEditingTopicId(topic.id);
    setEditingTopicName(topic.name);
  };

  const handleSaveEdit = (topicId: string) => {
    if (editingTopicName.trim()) {
      updateTopic(subject.id, topicId, editingTopicName.trim());
    }
    setEditingTopicId(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <span
            className="w-3.5 h-3.5 rounded-full"
            style={{ backgroundColor: subject.color }}
          />
          <span>{subject.name}</span>
          {subject.code && (
            <span className="text-xs font-mono font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {subject.code}
            </span>
          )}
        </div>
      }
      description="Subject curriculum checklist, study hours, and academic deliverables."
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">
              Topic Completion
            </span>
            <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
              {topicStats.percentage}%
            </div>
            <p className="text-[11px] text-slate-500">
              {topicStats.completed}/{topicStats.total} topics completed
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">
              Total Logged Time
            </span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {formatMinutes(totalStudyMinutes)}
            </div>
            <p className="text-[11px] text-slate-500">Across all sessions</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">
              This Week's Time
            </span>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatMinutes(weeklyStudyMinutes)}
            </div>
            <p className="text-[11px] text-slate-500">
              Target: {subject.weeklyTargetHours || 3}h / week
            </p>
          </div>
        </div>

        {/* Note on Separation of Metrics */}
        <div className="p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-300">
          💡 <strong>Academic Notice:</strong> Topic mastery is tracked via syllabus checklists, while study hours reflect logged effort. Both metrics are independently measured.
        </div>

        {/* Tab Navigation inside Modal */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setModalTab('syllabus')}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'syllabus'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Syllabus Topics ({subject.topics.length})
          </button>
          <button
            onClick={() => setModalTab('tasks')}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'tasks'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Tasks ({subjectTasks.length})
          </button>
          <button
            onClick={() => setModalTab('deadlines')}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'deadlines'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Deadlines ({subjectDeadlines.length})
          </button>
          <button
            onClick={() => setModalTab('sessions')}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'sessions'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Study Sessions ({subjectSessions.length})
          </button>
        </div>

        {/* TAB 1: Syllabus Checklist */}
        {activeTab === 'syllabus' && (
          <div className="space-y-4">
            {/* Add topic form */}
            <form onSubmit={handleAddTopic} className="flex gap-2">
              <input
                type="text"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="Add syllabus topic, chapter, or lab experiment..."
                className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg shadow-xs transition shrink-0 flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Topic
              </button>
            </form>

            {/* Topic items */}
            {subject.topics.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-6">
                No syllabus topics added yet. Add chapters above to track progress!
              </p>
            ) : (
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {subject.topics.map((topic, index) => {
                  const isEditing = editingTopicId === topic.id;

                  return (
                    <div
                      key={topic.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition ${
                        topic.completed
                          ? 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800/60'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={topic.completed}
                          onChange={() => toggleTopic(subject.id, topic.id)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                        />

                        {isEditing ? (
                          <div className="flex items-center gap-1.5 flex-1 mr-2">
                            <input
                              type="text"
                              value={editingTopicName}
                              onChange={(e) => setEditingTopicName(e.target.value)}
                              className="flex-1 px-2 py-1 text-xs border rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveEdit(topic.id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            >
                              <Check size={14} />
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`text-xs font-medium flex-1 truncate ${
                              topic.completed
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <span className="text-slate-400 mr-1.5">{index + 1}.</span>
                            {topic.name}
                          </span>
                        )}
                      </div>

                      {/* Topic Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEdit(topic)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                          title="Rename topic"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => deleteTopic(subject.id, topic.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded"
                          title="Delete topic"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Related Tasks */}
        {activeTab === 'tasks' && (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {subjectTasks.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-6">
                No tasks linked to this subject.
              </p>
            ) : (
              subjectTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className={`font-semibold ${t.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {t.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Due: {t.dueDate} {t.dueTime ? `@ ${t.dueTime}` : ''}
                    </div>
                  </div>
                  <PriorityBadge priority={t.priority} size="sm" />
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: Deadlines */}
        {activeTab === 'deadlines' && (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {subjectDeadlines.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-6">
                No upcoming assignments or tests for this subject.
              </p>
            ) : (
              subjectDeadlines.map((d) => (
                <div
                  key={d.id}
                  className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {d.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Type: {d.type} • Due: {d.dueDate}
                    </div>
                  </div>
                  <Badge variant="warning" size="sm">{d.status}</Badge>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: Past Study Sessions */}
        {activeTab === 'sessions' && (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {subjectSessions.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-6">
                No study sessions logged for this subject yet.
              </p>
            ) : (
              subjectSessions.map((s) => (
                <div
                  key={s.id}
                  className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {s.topic || 'General Revision'}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {s.date} {s.notes ? `• "${s.notes}"` : ''}
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                    {formatMinutes(s.durationMinutes)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer Quick Action: Start Timer for this subject */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              startTimer(subject.id);
              onClose();
              setActiveTab('study-tracker');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
          >
            <Play size={14} /> Start Study Timer for {subject.name}
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
