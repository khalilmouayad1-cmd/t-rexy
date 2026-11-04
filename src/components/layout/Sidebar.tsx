import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Flame,
  Target,
  BarChart3,
  Bot,
  Settings,
  Sparkles,
  X,
  ChevronRight,
} from 'lucide-react';
import { AppView, useApp } from '../../context/AppContext';
import { MASCOT_IMAGE_URL } from '../../constants/initialData';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeView, setActiveView, t, tasks, habits, setIsAIModalOpen } = useApp();

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;
  const activeHabitsCount = habits.length;

  const navItems: { id: AppView; label: string; icon: React.FC<{ className?: string }>; badge?: number | string; badgeColor?: string }[] = [
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    {
      id: 'tasks',
      label: t.navTasks,
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 'habits',
      label: t.navHabits,
      icon: Flame,
      badge: activeHabitsCount > 0 ? activeHabitsCount : undefined,
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    },
    { id: 'goals', label: t.navGoals, icon: Target },
    { id: 'analytics', label: t.navAnalytics, icon: BarChart3 },
    {
      id: 'ai',
      label: t.navAI,
      icon: Bot,
      badge: 'AI',
      badgeColor: 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold',
    },
    { id: 'settings', label: t.navSettings, icon: Settings },
  ];

  const handleSelectView = (id: AppView) => {
    setActiveView(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 start-0 z-50 flex w-64 flex-col border-e border-slate-800/80 bg-slate-900/95 dark:border-slate-800/80 dark:bg-slate-950/95 light:border-slate-200 light:bg-slate-50 p-4 transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full md:rtl:translate-x-0'
        }`}
      >
        {/* Top Header inside sidebar for mobile */}
        <div className="flex items-center justify-between pb-4 md:hidden">
          <div className="flex items-center gap-2">
            <img src={MASCOT_IMAGE_URL} alt="T-Rexy" className="h-8 w-8 rounded-lg object-cover" />
            <span className="font-bold text-emerald-400">T-Rexy</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 space-y-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectView(item.id)}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 font-semibold shadow-sm border border-emerald-500/30 glow-trexy-sm'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 light:text-slate-600 light:hover:bg-slate-200/60 light:hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4.5 w-4.5 transition-colors ${
                      isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[11px] ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Mascot Coach Card in Sidebar */}
        <div className="mt-auto pt-4">
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-b from-emerald-950/40 to-slate-900/60 p-3.5 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden border border-emerald-400/50 glow-trexy-sm">
                <img
                  src={MASCOT_IMAGE_URL}
                  alt="T-Rex Mascot"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                  <span>T-Rex Coach</span>
                  <Sparkles className="h-3 w-3 text-cyan-400" />
                </h4>
                <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">
                  "One focused stomp beats a thousand hesitated thoughts!"
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setIsAIModalOpen(true);
                onClose();
              }}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-500/20 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 transition-colors border border-emerald-500/30"
            >
              <span>{t.askTRex}</span>
              <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </button>
          </div>

          <div className="mt-3 text-center">
            <p className="text-[10px] text-slate-500 dark:text-slate-500 light:text-slate-400 font-medium">
              T-Rexy v1.0 • Developed by MIGO-kh
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
