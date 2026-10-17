import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  HelpCircle,
  BookOpen,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Cpu,
  Loader2,
  Lightbulb
} from 'lucide-react';
import { useStudyOS } from '../../context/StudyOSContext';
import { Card, CardHeader, CardContent } from '../ui/Card';
import {
  checkAIHealth,
  sendAIChat,
  explainTopic,
  generateQuiz,
  summarizeNotes,
  generateRevisionPlan,
  OllamaHealthStatus,
  ChatMessage
} from '../../services/aiService';

export const AIAssistantView: React.FC = () => {
  const { subjects, settings } = useStudyOS();

  // Mode: 'chat' | 'explain' | 'quiz' | 'summarize' | 'plan'
  const [activeMode, setActiveMode] = useState<'chat' | 'explain' | 'quiz' | 'summarize' | 'plan'>('chat');

  // Health state
  const [health, setHealth] = useState<OllamaHealthStatus>({ online: false });
  const [isCheckingHealth, setIsCheckingHealth] = useState(true);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello ${settings.studentName.split(' ')[0] || 'there'}! 👋 I am your local StudyOS AI tutor, powered by the **qwen2.5:3b** model. I run 100% locally on your machine with zero cloud fees and complete privacy.\n\nAsk me any concept from your B.Tech CSE curriculum, or use the tabs above to generate quizzes, summaries, and revision plans!`
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');

  // Tool states
  const [explainTopicInput, setExplainTopicInput] = useState('');
  const [explainResult, setExplainResult] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);

  const [quizTopicInput, setQuizTopicInput] = useState('');
  const [quizCount, setQuizCount] = useState(3);
  const [quizResult, setQuizResult] = useState('');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const [notesInput, setNotesInput] = useState('');
  const [notesResult, setNotesResult] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  const [planDays, setPlanDays] = useState(7);
  const [planHours, setPlanHours] = useState(3);
  const [planResult, setPlanResult] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);

  const [copied, setCopied] = useState(false);

  // Load health check on mount
  const checkStatus = async () => {
    setIsCheckingHealth(true);
    const res = await checkAIHealth();
    setHealth(res);
    setIsCheckingHealth(false);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  // Handle Chat Submit
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSending) return;

    const userText = chatInput.trim();
    setChatInput('');
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setIsSending(true);

    const res = await sendAIChat(newMessages, selectedSubject?.name);
    setIsSending(false);

    if (res.error) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: `⚠️ **AI Service Notice:** ${res.error}\n\nMake sure Ollama is installed from [ollama.com/download/windows](https://ollama.com/download/windows) and running \`ollama run qwen2.5:3b\`.`
        }
      ]);
    } else {
      setMessages([...newMessages, { role: 'assistant', content: res.text }]);
    }
  };

  // Handle Explain
  const handleExplain = async () => {
    if (!explainTopicInput.trim() || isExplaining) return;
    setIsExplaining(true);
    setExplainResult('');

    const res = await explainTopic(explainTopicInput.trim(), selectedSubject?.name);
    setIsExplaining(false);
    if (res.error) {
      setExplainResult(`⚠️ Error: ${res.error}`);
    } else {
      setExplainResult(res.explanation || 'No response generated.');
    }
  };

  // Handle Quiz
  const handleGenerateQuiz = async () => {
    if (!selectedSubject || isGeneratingQuiz) return;
    setIsGeneratingQuiz(true);
    setQuizResult('');

    const res = await generateQuiz(selectedSubject.name, quizTopicInput.trim(), quizCount);
    setIsGeneratingQuiz(false);
    if (res.error) {
      setQuizResult(`⚠️ Error: ${res.error}`);
    } else {
      setQuizResult(res.quiz || 'No quiz generated.');
    }
  };

  // Handle Summarize
  const handleSummarize = async () => {
    if (!notesInput.trim() || isSummarizing) return;
    setIsSummarizing(true);
    setNotesResult('');

    const res = await summarizeNotes(notesInput.trim(), selectedSubject?.name);
    setIsSummarizing(false);
    if (res.error) {
      setNotesResult(`⚠️ Error: ${res.error}`);
    } else {
      setNotesResult(res.summary || 'No summary generated.');
    }
  };

  // Handle Revision Plan
  const handlePlan = async () => {
    if (!selectedSubject || isPlanning) return;
    setIsPlanning(true);
    setPlanResult('');

    const topicsList = selectedSubject.topics.map((t) => t.name);
    const res = await generateRevisionPlan(selectedSubject.name, planDays, planHours, topicsList);
    setIsPlanning(false);
    if (res.error) {
      setPlanResult(`⚠️ Error: ${res.error}`);
    } else {
      setPlanResult(res.plan || 'No revision plan generated.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Bot className="text-indigo-600 dark:text-indigo-400" size={26} />
            <span>AI Study Assistant</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
              qwen2.5:3b (Local)
            </span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Privacy-first local AI tutor. Clarify concepts, generate quizzes, and prepare for exams.
          </p>
        </div>

        {/* Refresh connection status */}
        <button
          onClick={checkStatus}
          disabled={isCheckingHealth}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition self-start sm:self-center"
        >
          <RefreshCw size={13} className={isCheckingHealth ? 'animate-spin' : ''} />
          <span>Check Status</span>
        </button>
      </div>

      {/* Ollama Status Alert Banner */}
      {!health.online && !isCheckingHealth && (
        <Card className="p-4 bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 shrink-0">
              <AlertCircle size={20} />
            </div>
            <div className="flex-1 space-y-2 text-xs">
              <div className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                Ollama Local Service is Not Connected
              </div>
              <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                To enable local AI inference without paid APIs or cloud fees, Ollama needs to be installed on your Windows system.
              </p>
              <div className="flex items-center gap-3 flex-wrap pt-1">
                <a
                  href="https://ollama.com/download/windows"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs transition"
                >
                  <ExternalLink size={13} />
                  Download Ollama for Windows
                </a>
                <span className="text-amber-700 dark:text-amber-400 font-mono">
                  Then run: <code>ollama run qwen2.5:3b</code>
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {health.online && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">Ollama Local Engine Connected</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono">
              ({health.currentModel || 'qwen2.5:3b'})
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">100% Private & Free</span>
        </div>
      )}

      {/* Feature Mode Tabs & Subject Selector Bar */}
      <Card className="p-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Modes */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveMode('chat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                activeMode === 'chat'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bot size={14} /> Tutor Chat
            </button>
            <button
              onClick={() => setActiveMode('explain')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                activeMode === 'explain'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Lightbulb size={14} /> Explain Topic
            </button>
            <button
              onClick={() => setActiveMode('quiz')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                activeMode === 'quiz'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <HelpCircle size={14} /> Practice Quiz
            </button>
            <button
              onClick={() => setActiveMode('summarize')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                activeMode === 'summarize'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText size={14} /> Summarize Notes
            </button>
            <button
              onClick={() => setActiveMode('plan')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                activeMode === 'plan'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Calendar size={14} /> Revision Plan
            </button>
          </div>

          {/* Subject Context Selector */}
          <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0 text-xs">
            <span className="text-slate-500 text-xs font-medium whitespace-nowrap">Subject Context:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* VIEW 1: Interactive Chat Mode */}
      {activeMode === 'chat' && (
        <Card className="flex flex-col h-[560px]">
          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((m, idx) => {
              const isAssistant = m.role === 'assistant';
              return (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-3xl ${isAssistant ? '' : 'ml-auto flex-row-reverse'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      isAssistant
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-700 text-white'
                    }`}
                  >
                    {isAssistant ? <Bot size={16} /> : 'You'}
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isAssistant
                        ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 rounded-tl-xs'
                        : 'bg-indigo-600 text-white rounded-tr-xs'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}
            {isSending && (
              <div className="flex gap-3 items-center text-xs text-slate-400">
                <Loader2 size={16} className="animate-spin text-indigo-600" />
                <span>Thinking using local qwen2.5:3b model...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleChatSubmit}
            className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Ask any question about ${selectedSubject?.name || 'Computer Science'}...`}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isSending || !chatInput.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition shrink-0"
              title="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </Card>
      )}

      {/* VIEW 2: Explain Topic in Simple English */}
      {activeMode === 'explain' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-5 p-5 space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Explain Difficult Topics
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Breaks down any tough concept into simple English with real-life analogies, step-by-step logic, and common exam traps.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Topic or Concept
              </label>
              <input
                type="text"
                value={explainTopicInput}
                onChange={(e) => setExplainTopicInput(e.target.value)}
                placeholder="e.g. Double Pointers, A* Search Heuristics, Deadlock Prevention"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Quick Suggestions from subject topics */}
            {selectedSubject && selectedSubject.topics.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Suggested from {selectedSubject.name} syllabus:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSubject.topics.slice(0, 4).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setExplainTopicInput(t.name)}
                      className="text-[11px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition"
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleExplain}
              disabled={isExplaining || !explainTopicInput.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              {isExplaining ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              <span>{isExplaining ? 'Generating Simple Explanation...' : 'Explain in Simple English'}</span>
            </button>
          </Card>

          <Card className="lg:col-span-7 p-5">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Explanation Result
              </h4>
              {explainResult && (
                <button
                  onClick={() => handleCopy(explainResult)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'Copied!' : 'Copy Explanation'}</span>
                </button>
              )}
            </div>

            {explainResult ? (
              <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap max-h-[460px] overflow-y-auto pr-1 text-slate-800 dark:text-slate-200">
                {explainResult}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 text-xs p-6">
                <Lightbulb size={28} className="mb-2 text-indigo-400" />
                <span>Enter a topic and click "Explain in Simple English" to see the breakdown.</span>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* VIEW 3: Practice Quiz Generator */}
      {activeMode === 'quiz' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-5 p-5 space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Subject Practice Quiz
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Generates instant multiple choice questions with answers and detailed 1-line rationales.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Topic Focus (Optional)
              </label>
              <input
                type="text"
                value={quizTopicInput}
                onChange={(e) => setQuizTopicInput(e.target.value)}
                placeholder="e.g. CPU Scheduling or Leave empty for subject overview"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Number of Questions
              </label>
              <select
                value={quizCount}
                onChange={(e) => setQuizCount(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={3}>3 Questions (Quick Drill)</option>
                <option value={5}>5 Questions (Standard Practice)</option>
                <option value={10}>10 Questions (Full Assessment)</option>
              </select>
            </div>

            <button
              onClick={handleGenerateQuiz}
              disabled={isGeneratingQuiz}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              {isGeneratingQuiz ? <Loader2 size={16} className="animate-spin" /> : <HelpCircle size={16} />}
              <span>{isGeneratingQuiz ? 'Generating Questions...' : 'Generate Practice Quiz'}</span>
            </button>
          </Card>

          <Card className="lg:col-span-7 p-5">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Quiz & Answer Key
              </h4>
              {quizResult && (
                <button
                  onClick={() => handleCopy(quizResult)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'Copied!' : 'Copy Quiz'}</span>
                </button>
              )}
            </div>

            {quizResult ? (
              <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap max-h-[460px] overflow-y-auto pr-1 text-slate-800 dark:text-slate-200">
                {quizResult}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 text-xs p-6">
                <HelpCircle size={28} className="mb-2 text-indigo-400" />
                <span>Select questions and click "Generate Practice Quiz" to test your recall.</span>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* VIEW 4: Summarize Study Notes */}
      {activeMode === 'summarize' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-5 p-5 space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Study Notes Summarizer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Paste long lecture transcripts or textbook snippets to generate high-yield bullet points and exam cheat-sheets.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Paste Study Notes
              </label>
              <textarea
                rows={8}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Paste paragraph or notes from lecture..."
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <button
              onClick={handleSummarize}
              disabled={isSummarizing || !notesInput.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              {isSummarizing ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              <span>{isSummarizing ? 'Summarizing...' : 'Generate High-Yield Summary'}</span>
            </button>
          </Card>

          <Card className="lg:col-span-7 p-5">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Summary & Cheat-Sheet
              </h4>
              {notesResult && (
                <button
                  onClick={() => handleCopy(notesResult)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
                </button>
              )}
            </div>

            {notesResult ? (
              <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap max-h-[460px] overflow-y-auto pr-1 text-slate-800 dark:text-slate-200">
                {notesResult}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 text-xs p-6">
                <FileText size={28} className="mb-2 text-indigo-400" />
                <span>Paste lecture notes on the left to extract key exam takeaways.</span>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* VIEW 5: Personalized Revision Plan */}
      {activeMode === 'plan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-5 p-5 space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Personalized Revision Timetable
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Generates a structured, day-by-day study schedule before exams based on your daily capacity.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Days Available
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={planDays}
                  onChange={(e) => setPlanDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Hours / Day
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={planHours}
                  onChange={(e) => setPlanHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              onClick={handlePlan}
              disabled={isPlanning}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              {isPlanning ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
              <span>{isPlanning ? 'Building Plan...' : 'Generate Revision Plan'}</span>
            </button>
          </Card>

          <Card className="lg:col-span-7 p-5">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Structured Revision Plan
              </h4>
              {planResult && (
                <button
                  onClick={() => handleCopy(planResult)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'Copied!' : 'Copy Plan'}</span>
                </button>
              )}
            </div>

            {planResult ? (
              <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap max-h-[460px] overflow-y-auto pr-1 text-slate-800 dark:text-slate-200">
                {planResult}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 text-xs p-6">
                <Calendar size={28} className="mb-2 text-indigo-400" />
                <span>Configure your days and hours to build a realistic study timetable.</span>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
