import React, { useState } from 'react';
import {
  Flame,
  Plus,
  Trophy,
  CheckCircle2,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Habit } from '../../types';
import { HabitModal } from './HabitModal';

export const HabitsView: React.FC = () => {
  const { t, habits, toggleHabitDay, deleteHabit, profile } = useApp();

  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [habitToEdit, setTaskToEdit] = useState<Habit | null>(null);

  // Generate last 7 days array
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString(profile.language === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'narrow',
    });
    const isToday = i === 6;
    return { dateStr, dayLabel, isToday };
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 light:text-slate-900">
            {t.habitsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {t.habitsSubtitle}
          </p>
        </div>

        <button
          onClick={() => {
            setTaskToEdit(null);
            setIsHabitModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-md shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-400 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>{t.newHabit}</span>
        </button>
      </div>

      {/* Habit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {habits.length === 0 ? (
          <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center light:border-slate-300 light:bg-slate-50">
            <Flame className="mx-auto h-12 w-12 text-slate-600 mb-3" />
            <h3 className="text-base font-semibold text-slate-300 light:text-slate-800">
              No habits tracked yet
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Start an atomic habit today and watch your streak roar!
            </p>
            <button
              onClick={() => setIsHabitModalOpen(true)}
              className="mt-4 rounded-xl bg-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30"
            >
              + {t.newHabit}
            </button>
          </div>
        ) : (
          habits.map((habit) => {
            // Calculate 7-day rate
            const daysCompletedCount = last7Days.filter((d) => !!habit.history[d.dateStr]).length;
            const completionRate = Math.round((daysCompletedCount / 7) * 100);

            return (
              <div
                key={habit.id}
                className="group relative rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm hover:border-slate-700 transition-all light:border-slate-200 light:bg-white"
              >
                {/* Top: Icon, Title & Streak Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                      style={{ backgroundColor: habit.color }}
                    >
                      <Flame className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-100 light:text-slate-900">
                        {habit.name}
                      </h3>
                      {habit.description && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {habit.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setTaskToEdit(habit);
                        setIsHabitModalOpen(true);
                      }}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200 light:hover:bg-slate-100"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-rose-400 light:hover:bg-slate-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Streak Counters */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 light:border-amber-200 light:bg-amber-50">
                    <Flame className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <div>
                      <span className="block text-[10px] text-amber-300 font-semibold uppercase">
                        {t.streak}
                      </span>
                      <span className="text-base font-black text-amber-400">
                        {habit.streak} days
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-2.5 light:border-cyan-200 light:bg-cyan-50">
                    <Trophy className="h-4 w-4 text-cyan-400" />
                    <div>
                      <span className="block text-[10px] text-cyan-300 font-semibold uppercase">
                        {t.bestStreak}
                      </span>
                      <span className="text-base font-black text-cyan-400">
                        {habit.bestStreak} days
                      </span>
                    </div>
                  </div>
                </div>

                {/* 7-Day Interactive Tracker */}
                <div className="mt-4 pt-4 border-t border-slate-800 light:border-slate-200">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-400 font-medium">{t.habitCompletionRate}</span>
                    <span className="font-bold text-emerald-400">{completionRate}%</span>
                  </div>

                  <div className="flex items-center justify-between gap-1.5">
                    {last7Days.map((day) => {
                      const isCompleted = !!habit.history[day.dateStr];
                      return (
                        <div key={day.dateStr} className="flex-1 text-center">
                          <button
                            type="button"
                            onClick={() => toggleHabitDay(habit.id, day.dateStr)}
                            title={`${day.dateStr}: ${isCompleted ? 'Completed' : 'Missed'}`}
                            className={`mx-auto flex h-8 w-8 items-center justify-center rounded-xl border text-xs font-bold transition-all ${
                              isCompleted
                                ? 'border-emerald-400 bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                                : day.isToday
                                ? 'border-dashed border-emerald-400/80 bg-slate-800 text-slate-300 hover:border-emerald-400'
                                : 'border-slate-800 bg-slate-800/40 text-slate-500 hover:bg-slate-800 light:border-slate-200 light:bg-slate-100'
                            }`}
                          >
                            {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : day.dayLabel}
                          </button>
                          <span
                            className={`mt-1 block text-[10px] ${
                              day.isToday ? 'font-bold text-emerald-400' : 'text-slate-500'
                            }`}
                          >
                            {day.dayLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => {
          setIsHabitModalOpen(false);
          setTaskToEdit(null);
        }}
        habitToEdit={habitToEdit}
      />
    </div>
  );
};
