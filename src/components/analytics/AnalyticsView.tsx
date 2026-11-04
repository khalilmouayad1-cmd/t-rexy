import React, { useState } from 'react';
import {
  BarChart3,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Target,
  Loader2,
  Quote,
  Lightbulb,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AIInsightsData } from '../../types';
import { MASCOT_IMAGE_URL } from '../../constants/initialData';

export const AnalyticsView: React.FC = () => {
  const {
    t,
    tasks,
    habits,
    goals,
    postponements,
    productivityScore,
    profile,
  } = useApp();

  const [insights, setInsights] = useState<AIInsightsData | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Weekly completion data simulation from tasks
  const completedTasks = tasks.filter((t) => t.completed);
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completionRate =
    tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Day of week bars
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayStats = daysOfWeek.map((day, idx) => {
    // Generate realistic distribution based on tasks
    const count = tasks.filter((_, i) => i % 7 === idx).length || 1;
    const completed = completedTasks.filter((_, i) => i % 7 === idx).length;
    return { day, total: count, completed };
  });

  // Frequently postponed tasks (postponed >= 1)
  const postponedTasks = tasks.filter((t) => t.postponedCount > 0);

  const handleFetchInsights = async () => {
    setIsLoadingInsights(true);
    setErrorMsg('');
    try {
      const statsPayload = {
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        pendingTasks: pendingTasks.length,
        completionRate: `${completionRate}%`,
        productivityScore,
        habits: habits.map((h) => ({ name: h.name, streak: h.streak, bestStreak: h.bestStreak })),
        goals: goals.map((g) => ({ title: g.title, progress: `${g.progress}%`, status: g.status })),
        postponements: postponements.slice(0, 5),
      };

      const res = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stats: statsPayload,
          language: profile.language,
        }),
      });

      const data = await res.json();
      if (data.insights) {
        setInsights(data.insights);
      } else if (data.error) {
        setErrorMsg(data.error);
      }
    } catch {
      setErrorMsg('Failed to fetch AI insights. Check server connection or API key.');
    } finally {
      setIsLoadingInsights(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 light:text-slate-900">
            {t.analyticsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {t.analyticsSubtitle}
          </p>
        </div>

        <button
          onClick={handleFetchInsights}
          disabled={isLoadingInsights}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-md shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-400 transition-all active:scale-95 disabled:opacity-50"
        >
          {isLoadingInsights ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t.generatingInsights}</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>{t.generateInsightsBtn}</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-xs text-rose-300">
          {errorMsg}
        </div>
      )}

      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Productivity Index */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm light:border-slate-200 light:bg-white">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>{t.productivityScore}</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">
              {productivityScore}%
            </span>
            <span className="text-xs text-slate-400 font-medium">Optimal</span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-800 overflow-hidden light:bg-slate-200">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
              style={{ width: `${productivityScore}%` }}
            />
          </div>
        </div>

        {/* Task Completion Rate */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm light:border-slate-200 light:bg-white">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>{t.completedVsUnfinished}</span>
            <CheckCircle2 className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-cyan-400">{completionRate}%</span>
            <span className="text-xs text-slate-400">
              ({completedTasks.length} / {tasks.length})
            </span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-800 overflow-hidden light:bg-slate-200 flex">
            <div
              className="h-full bg-emerald-400"
              style={{ width: `${completionRate}%` }}
            />
            <div
              className="h-full bg-slate-700"
              style={{ width: `${100 - completionRate}%` }}
            />
          </div>
        </div>

        {/* Postponed Rate */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm light:border-slate-200 light:bg-white">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Postponed Tasks</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">
              {postponedTasks.length}
            </span>
            <span className="text-xs text-slate-400">recorded</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            {postponedTasks.length === 0
              ? 'Zero delays! Superb execution flow.'
              : `${postponedTasks.length} tasks delayed; click AI analysis below.`}
          </p>
        </div>
      </div>

      {/* T-Rex AI Deep Review Results Card */}
      {insights && (
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-slate-900 via-emerald-950/30 to-slate-900 p-6 shadow-xl light:border-slate-200 light:bg-white">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800 light:border-slate-200">
            <div className="h-12 w-12 rounded-xl overflow-hidden border border-emerald-400 glow-trexy-sm shrink-0">
              <img src={MASCOT_IMAGE_URL} alt="T-Rex" className="h-full w-full object-cover" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-emerald-300 flex items-center gap-1.5">
                <span>{t.aiReviewTitle}</span>
                <Sparkles className="h-4 w-4 text-cyan-400" />
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">{insights.summary}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Strengths */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 light:border-emerald-200 light:bg-emerald-50/40">
              <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{t.keyStrengths}</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-200 light:text-slate-800">
                {insights.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Postponement Diagnosis */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-4 light:border-amber-200 light:bg-amber-50/40">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>{t.postponementDiagnosis}</span>
              </h3>
              <p className="text-xs text-slate-200 light:text-slate-800 leading-relaxed">
                {insights.postponementAnalysis}
              </p>
            </div>
          </div>

          {/* Action Recommendations */}
          <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4 light:border-cyan-200 light:bg-cyan-50/40">
            <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4 text-cyan-400" />
              <span>{t.actionRecommendations}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {insights.actionableTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-200 light:border-slate-200 light:bg-white light:text-slate-800"
                >
                  <span className="font-bold text-cyan-400 block mb-1">Step {idx + 1}</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Motivational Dinosaur Motto */}
          {insights.motivationalQuote && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
              <Quote className="h-5 w-5 text-emerald-400 shrink-0" />
              <span className="font-semibold italic">{insights.motivationalQuote}</span>
            </div>
          )}
        </div>
      )}

      {/* Charts Grid: Weekly Completion & Postponements Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Bar Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm light:border-slate-200 light:bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100 light:text-slate-900">
                {t.weeklyCompletionRate}
              </h3>
            </div>
            <span className="text-xs text-slate-400">Current Week</span>
          </div>

          {/* Bars */}
          <div className="flex items-end justify-between gap-3 h-48 pt-6 px-2">
            {dayStats.map((item) => {
              const max = 5;
              const heightPct = Math.min(100, Math.max(15, Math.round((item.completed / max) * 100)));
              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 mb-1 font-semibold">
                      {item.completed}
                    </span>
                    <div className="w-full max-w-[28px] rounded-t-lg bg-slate-800/80 overflow-hidden light:bg-slate-200 h-32 flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-emerald-500 to-cyan-400 rounded-t-lg transition-all duration-500"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Postponement Diagnosis Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm light:border-slate-200 light:bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-100 light:text-slate-900">
                {t.frequentlyPostponed}
              </h3>
            </div>
            <span className="text-xs text-amber-400 font-semibold">
              {postponedTasks.length} tasks
            </span>
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto">
            {postponedTasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500 light:border-slate-200">
                {t.noPostponedTasks}
              </div>
            ) : (
              postponedTasks.map((pt) => (
                <div
                  key={pt.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-xs light:border-slate-200 light:bg-slate-50"
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-200 light:text-slate-800 truncate">
                      {pt.title}
                    </span>
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-300 border border-amber-500/30">
                      {pt.postponedCount}x postponed
                    </span>
                  </div>
                  {pt.lastPostponedReason && (
                    <p className="text-[11px] text-slate-400 mt-1 italic">
                      "{pt.lastPostponedReason}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
