/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { DashboardView } from './components/dashboard/DashboardView';
import { TasksView } from './components/tasks/TasksView';
import { HabitsView } from './components/habits/HabitsView';
import { GoalsView } from './components/goals/GoalsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { TRexAssistantView } from './components/ai/TRexAssistantView';
import { SettingsView } from './components/settings/SettingsView';
import { TRexFloatingModal } from './components/ai/TRexFloatingModal';
import { MASCOT_IMAGE_URL } from './constants/initialData';
import { Sparkles } from 'lucide-react';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { TaskModal } from './components/tasks/TaskModal';

const AppContent: React.FC = () => {
  const { activeView, setIsAIModalOpen, setActiveView } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  useKeyboardShortcuts(
    () => setIsAIModalOpen(true),
    () => {
      setActiveView('tasks');
      setIsTaskModalOpen(true);
    }
  );

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'tasks':
        return <TasksView />;
      case 'habits':
        return <HabitsView />;
      case 'goals':
        return <GoalsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'ai':
        return <TRexAssistantView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col dark:bg-slate-950 dark:text-slate-100 transition-colors">
      <Header onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

      <div className="flex flex-1 relative overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>

      <Footer />

      {/* Floating T-Rex AI Mascot Shortcut Button */}
      {activeView !== 'ai' && (
        <div className="fixed bottom-6 end-6 z-40 group">
          <button
            onClick={() => setIsAIModalOpen(true)}
            title="Chat with T-Rex AI Coach"
            className="relative flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-emerald-400 bg-slate-900 shadow-xl shadow-emerald-500/25 glow-trexy transition-all hover:scale-110 active:scale-95"
          >
            <img
              src={MASCOT_IMAGE_URL}
              alt="T-Rex AI"
              className="h-full w-full object-cover rounded-xl"
            />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-slate-950 ring-2 ring-slate-900">
              <Sparkles className="h-2.5 w-2.5 fill-current" />
            </span>
          </button>
        </div>
      )}

      {/* Quick AI Floating Modal */}
      <TRexFloatingModal />
      
      {/* Global Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

