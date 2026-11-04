import React from 'react';
import {
  Sparkles,
  Sun,
  Moon,
  Languages,
  Menu,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MASCOT_IMAGE_URL } from '../../constants/initialData';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    t,
    profile,
    updateProfile,
    productivityScore,
    setIsAIModalOpen,
    todayTasksCompletedCount,
    todayTasksTotalCount,
  } = useApp();

  const toggleTheme = () => {
    updateProfile({ theme: profile.theme === 'dark' ? 'light' : 'dark' });
  };

  const toggleLanguage = () => {
    updateProfile({ language: profile.language === 'en' ? 'ar' : 'en' });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white/85 text-slate-900 border-slate-200 dark:border-slate-800/80 dark:bg-slate-950/85 dark:text-slate-100 backdrop-blur-md transition-colors">
      {/* Left: Mobile hamburger & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 md:hidden dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </button>


        <div className="flex items-center gap-2.5">
          <div className="relative group cursor-pointer" onClick={() => setIsAIModalOpen(true)}>
            <div className="h-10 w-10 rounded-xl overflow-hidden border-2 border-emerald-500/70 shadow-sm shadow-emerald-500/30 glow-trexy-sm transition-transform duration-200 group-hover:scale-105">
              <img
                src={MASCOT_IMAGE_URL}
                alt="T-Rex Mascot"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-slate-900">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-lg text-emerald-400">
                T-Rexy
              </span>
              <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/20">
                by MIGO-kh
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none">
              Smart AI Productivity
            </p>
          </div>
        </div>
      </div>

      {/* Center: Productivity & Daily Momentum Quick Stats */}
      <div className="hidden sm:flex items-center gap-4">
        {/* Daily Progress Pill */}
        <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-800/40 px-3 py-1 text-xs text-slate-300 light:border-slate-200 light:bg-slate-100 light:text-slate-700">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>
            {todayTasksCompletedCount}/{todayTasksTotalCount} {t.tasksCompleted}
          </span>
        </div>

        {/* Productivity Score */}
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 glow-trexy-sm">
          <Flame className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400/30 animate-pulse" />
          <span>{productivityScore}% {t.productivityScore}</span>
        </div>
      </div>

      {/* Right: Actions, AI Quick Button, Theme & Lang */}
      <div className="flex items-center gap-2">
        {/* T-Rex AI Quick Trigger */}
        <button
          onClick={() => setIsAIModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/25 transition-all hover:scale-105 hover:from-emerald-400 hover:to-teal-400 active:scale-95"
        >
          <Sparkles className="h-3.5 w-3.5 fill-current" />
          <span className="hidden xs:inline">{t.askTRex}</span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          title={profile.language === 'en' ? 'التحويل إلى العربية' : 'Switch to English'}
          className="flex h-9 items-center gap-1 rounded-lg border border-slate-700/60 bg-slate-800/50 px-2.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-700 light:border-slate-300 light:bg-slate-100 light:text-slate-700"
        >
          <Languages className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-semibold">{profile.language === 'en' ? 'AR' : 'EN'}</span>
        </button>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          title={profile.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-800/50 text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-700 light:border-slate-300 light:bg-slate-100 light:text-slate-700"
        >
          {profile.theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-cyan-500" />
          )}
        </button>
      </div>
    </header>
  );
};
