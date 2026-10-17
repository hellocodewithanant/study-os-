import React, { useState } from 'react';
import { StudyOSProvider, useStudyOS } from './context/StudyOSContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { TasksView } from './components/tasks/TasksView';
import { SubjectsView } from './components/subjects/SubjectsView';
import { TimetableView } from './components/timetable/TimetableView';
import { StudyTrackerView } from './components/study-tracker/StudyTrackerView';
import { DeadlinesView } from './components/deadlines/DeadlinesView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AIAssistantView } from './components/ai/AIAssistantView';
import { SettingsView } from './components/settings/SettingsView';
import { TaskModal } from './components/tasks/TaskModal';
import { Task } from './types';

const MainAppContent: React.FC = () => {
  const { activeTab } = useStudyOS();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global Task modal state for Quick Add
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleOpenTaskModal = (task?: Task) => {
    setEditingTask(task || null);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200">
      {/* Desktop / Tablet Sidebar */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
      </div>

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenQuickTaskModal={() => handleOpenTaskModal()}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {activeTab === 'dashboard' && (
            <DashboardView onOpenTaskModal={handleOpenTaskModal} />
          )}
          {activeTab === 'tasks' && <TasksView />}
          {activeTab === 'subjects' && <SubjectsView />}
          {activeTab === 'timetable' && <TimetableView />}
          {activeTab === 'study-tracker' && <StudyTrackerView />}
          {activeTab === 'deadlines' && <DeadlinesView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'ai-assistant' && <AIAssistantView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Task Creation / Editing Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        taskToEdit={editingTask}
      />
    </div>
  );
};

export function App() {
  return (
    <StudyOSProvider>
      <MainAppContent />
    </StudyOSProvider>
  );
}

export default App;
