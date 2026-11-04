import React, { useState } from 'react';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit2,
  Trophy,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Goal } from '../../types';
import { GoalModal } from './GoalModal';

export const GoalsView: React.FC = () => {
  const { t, goals, toggleGoalMilestone, deleteGoal } = useApp();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);

  const getDaysRemaining = (targetDateStr: string) => {
    const target = new Date(targetDateStr);
    const now = new Date();
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 light:text-slate-900">
            {t.goalsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {t.goalsSubtitle}
          </p>
        </div>

        <button
          onClick={() => {
            setGoalToEdit(null);
            setIsGoalModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-md shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-400 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>{t.newGoal}</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.length === 0 ? (
          <div className="md:col-span-3 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center light:border-slate-300 light:bg-slate-50">
            <Target className="mx-auto h-12 w-12 text-slate-600 mb-3" />
            <h3 className="text-base font-semibold text-slate-300 light:text-slate-800">
              No long-term goals set yet
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Define your vision and break it down into conquerable milestones.
            </p>
            <button
              onClick={() => setIsGoalModalOpen(true)}
              className="mt-4 rounded-xl bg-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30"
            >
              + {t.newGoal}
            </button>
          </div>
        ) : (
          goals.map((goal) => {
            const daysLeft = getDaysRemaining(goal.targetDate);
            const isCompleted = goal.status === 'achieved' || goal.progress === 100;

            return (
              <div
                key={goal.id}
                className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all shadow-sm ${
                  isCompleted
                    ? 'border-emerald-500/40 bg-emerald-950/20 light:border-emerald-300 light:bg-emerald-50/50'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 light:border-slate-200 light:bg-white'
                }`}
              >
                <div>
                  {/* Status & Actions */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        isCompleted
                          ? 'bg-emerald-500 text-slate-950'
                          : goal.status === 'paused'
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {isCompleted ? t.statusAchieved : goal.status === 'paused' ? t.statusPaused : t.statusInProgress}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setGoalToEdit(goal);
                          setIsGoalModalOpen(true);
                        }}
                        className="rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-200 light:hover:bg-slate-100"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-rose-400 light:hover:bg-slate-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-100 light:text-slate-900 leading-snug">
                    {goal.title}
                  </h3>
                  {goal.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {goal.description}
                    </p>
                  )}

                  {/* Deadline Pill */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{t.daysRemaining.replace('{days}', String(daysLeft))}</span>
                    <span className="text-[10px] text-slate-500">({goal.targetDate})</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-emerald-400 font-bold">{goal.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden light:bg-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all rounded-full"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones Checklist */}
                  {goal.milestones.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80 light:border-slate-200/80 space-y-1.5">
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {t.milestones}
                      </span>
                      {goal.milestones.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => toggleGoalMilestone(goal.id, m.id)}
                          className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer py-0.5 light:text-slate-700 light:hover:text-slate-900"
                        >
                          <input
                            type="checkbox"
                            checked={m.completed}
                            onChange={() => {}}
                            className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                          />
                          <span className={m.completed ? 'line-through text-slate-500' : ''}>
                            {m.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setGoalToEdit(null);
        }}
        goalToEdit={goalToEdit}
      />
    </div>
  );
};
