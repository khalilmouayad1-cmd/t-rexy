import React, { useRef, useState } from 'react';
import {
  Sun,
  Moon,
  Languages,
  User,
  Target,
  Volume2,
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Heart,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MASCOT_IMAGE_URL } from '../../constants/initialData';

export const SettingsView: React.FC = () => {
  const {
    t,
    profile,
    updateProfile,
    loadSampleData,
    clearAllData,
    exportDataJSON,
    importDataJSON,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notificationMsg, setNotificationMsg] = useState('');

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(''), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJSON(content);
        if (success) {
          showNotification('Data successfully restored!');
        } else {
          showNotification('Invalid backup JSON format.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-100 light:text-slate-900">
          {t.settingsTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          {t.settingsSubtitle}
        </p>
      </div>

      {notificationMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* 1. Appearance & Language */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm light:border-slate-200 light:bg-white space-y-4">
        <h2 className="text-sm font-bold text-slate-100 light:text-slate-900">
          {t.appearance} & {t.language}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Theme */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-2">
              {t.themeMode}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateProfile({ theme: 'dark' })}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all ${
                  profile.theme === 'dark'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-sm'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800 light:border-slate-200 light:bg-slate-100'
                }`}
              >
                <Moon className="h-4 w-4 text-cyan-400" />
                <span>{t.themeDark}</span>
              </button>

              <button
                type="button"
                onClick={() => updateProfile({ theme: 'light' })}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all ${
                  profile.theme === 'light'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 shadow-sm'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800 light:border-slate-200 light:bg-slate-100'
                }`}
              >
                <Sun className="h-4 w-4 text-amber-500" />
                <span>{t.themeLight}</span>
              </button>
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-2">
              {t.language}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateProfile({ language: 'en' })}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all ${
                  profile.language === 'en'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-sm'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800 light:border-slate-200 light:bg-slate-100'
                }`}
              >
                <Languages className="h-4 w-4 text-emerald-400" />
                <span>{t.langEn}</span>
              </button>

              <button
                type="button"
                onClick={() => updateProfile({ language: 'ar' })}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all ${
                  profile.language === 'ar'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-sm'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800 light:border-slate-200 light:bg-slate-100'
                }`}
              >
                <Languages className="h-4 w-4 text-cyan-400" />
                <span>{t.langAr}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. User Profile & Targets */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm light:border-slate-200 light:bg-white space-y-4">
        <h2 className="text-sm font-bold text-slate-100 light:text-slate-900">
          {t.profileSettings}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
              <User className="inline h-3.5 w-3.5 me-1 text-emerald-400" />
              {t.userName}
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none light:border-slate-300 light:bg-slate-50 light:text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
              <Target className="inline h-3.5 w-3.5 me-1 text-cyan-400" />
              {t.dailyTargetCount}
            </label>
            <input
              type="number"
              min={1}
              max={25}
              value={profile.dailyTaskTarget}
              onChange={(e) => updateProfile({ dailyTaskTarget: Number(e.target.value) || 5 })}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none light:border-slate-300 light:bg-slate-50 light:text-slate-900"
            />
          </div>
        </div>

        {/* Toggles for Sound & Celebrations */}
        <div className="pt-2 border-t border-slate-800 light:border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/30 p-3 cursor-pointer light:border-slate-200 light:bg-slate-50">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200 light:text-slate-800">
                {t.soundEffects}
              </span>
            </div>
            <input
              type="checkbox"
              checked={profile.soundEnabled}
              onChange={(e) => updateProfile({ soundEnabled: e.target.checked })}
              className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/30 p-3 cursor-pointer light:border-slate-200 light:bg-slate-50">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-semibold text-slate-200 light:text-slate-800">
                {t.confettiCelebration}
              </span>
            </div>
            <input
              type="checkbox"
              checked={profile.celebrationsEnabled}
              onChange={(e) => updateProfile({ celebrationsEnabled: e.target.checked })}
              className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
            />
          </label>
        </div>
      </div>

      {/* 3. Data Management & Backups */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm light:border-slate-200 light:bg-white space-y-4">
        <h2 className="text-sm font-bold text-slate-100 light:text-slate-900">
          {t.dataManagement}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={exportDataJSON}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/70 p-3 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors light:border-slate-300 light:bg-slate-100 light:text-slate-800"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>{t.exportData}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/70 p-3 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors light:border-slate-300 light:bg-slate-100 light:text-slate-800"
          >
            <Upload className="h-4 w-4 text-cyan-400" />
            <span>{t.importData}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => {
              loadSampleData();
              showNotification('Demo data successfully loaded!');
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/70 p-3 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors light:border-slate-300 light:bg-slate-100 light:text-slate-800"
          >
            <RefreshCw className="h-4 w-4 text-amber-400" />
            <span>{t.loadSampleData}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all tasks, habits, and goals?')) {
                clearAllData();
                showNotification('All data cleared.');
              }
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs font-semibold text-rose-300 hover:bg-rose-900/30 transition-colors"
          >
            <Trash2 className="h-4 w-4 text-rose-400" />
            <span>{t.clearAllData}</span>
          </button>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-800 light:border-slate-200">
           <a
            href="#"
            download="t-rexy-app.html"
            className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all"
            onClick={(e) => {
              e.preventDefault();
              const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 't-rexy-app.html';
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>تحميل التطبيق كملف HTML</span>
          </a>
        </div>
      </div>

      {/* 4. About App & MIGO-kh Credits */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 p-6 shadow-md light:border-slate-200 light:bg-slate-50">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="relative h-20 w-20 rounded-2xl overflow-hidden border-2 border-emerald-400 glow-trexy shrink-0">
            <img src={MASCOT_IMAGE_URL} alt="T-Rex Mascot" className="h-full w-full object-cover" />
          </div>

          <div className="text-center sm:text-start">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="text-lg font-black text-emerald-400">T-Rexy</h3>
              <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {t.aboutDescription}
            </p>
            <div className="mt-3 flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>{t.credits}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
