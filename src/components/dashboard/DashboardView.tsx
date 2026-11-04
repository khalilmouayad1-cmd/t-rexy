import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  Flame,
  Target,
  Calendar,
  AlertCircle,
  MoreVertical,
  CalendarDays,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MASCOT_IMAGE_URL } from '../../constants/initialData';
import { TaskModal } from '../tasks/TaskModal';
import { PostponeModal } from '../tasks/PostponeModal';
import { HabitModal } from '../habits/HabitModal';
import { GoalModal } from '../goals/GoalModal';
import { Task } from '../../types';

export const DashboardView: React.FC = () => {
  const {
    t,
    profile,
    tasks,
    habits,
    goals,
    todayTasksCompletedCount,
    todayTasksTotalCount,
    toggleTaskCompleted,
    toggleHabitDay,
    deleteTask,
    setActiveView,
    setIsAIModalOpen,
    openAIModalWithPrompt,
    productivityScore,
  } = useApp();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToPostpone, setTaskToPostpone] = useState<Task | null>(null);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // Time of day greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t.goodMorning : hour < 18 ? t.goodAfternoon : t.goodEvening;

  const todayStr = new Date().toISOString().split('T')[0];
  const formattedDate = new Date().toLocaleDateString(
    profile.language === 'ar' ? 'ar-EG' : 'en-US',
    {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  );

  // Filter today's tasks
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const pendingTodayTasks = todayTasks.filter((t) => !t.completed);
  const completedTodayTasks = todayTasks.filter((t) => t.completed);

  // Active goals
  const activeGoals = goals.filter((g) => g.status === 'in_progress').slice(0, 3);

  const targetPercentage =
    profile.dailyTaskTarget > 0
      ? Math.min(100, Math.round((todayTasksCompletedCount / profile.dailyTaskTarget) * 100))
      : 0;

  return (
    <div className="space-y-6">
      {/* 1. Hero Mascot Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 p-6 shadow-xl dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/40 light:border-slate-200 light:from-white light:via-emerald-50/30 light:to-cyan-50/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-lg shadow-emerald-500/25 glow-trexy transition-transform hover:scale-105">
                <img
                  src={MASCOT_IMAGE_URL}
                  alt="T-Rex Mascot"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950 ring-2 ring-slate-900">
                🦖
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-100 light:text-slate-900">
                  {greeting}, {profile.name || 'Champion'}!
                </h1>
                <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                  Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-cyan-400" />
                <span>{formattedDate}</span>
              </p>
              <p className="text-xs sm:text-sm text-emerald-300 font-medium mt-1">
                "{t.trexCheer}"
              </p>
            </div>
          </div>

          {/* Quick AI & Plan Action */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => openAIModalWithPrompt?.('Plan my day based on my current tasks')}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-md shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-400 transition-all active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>{t.planMyDay}</span>
            </button>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors light:border-slate-300 light:bg-white light:text-slate-800"
            >
              <Plus className="h-4 w-4 text-emerald-400" />
              <span>{t.addTask}</span>
            </button>
          </div>
        </div>

        {/* Daily Target Progress Strip */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 light:border-slate-200/80">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-slate-300 light:text-slate-700 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>
                {t.dailyGoalTarget}: {todayTasksCompletedCount}/{profile.dailyTaskTarget} tasks
              </span>
            </span>
            <span className="text-emerald-400 font-bold">{targetPercentage}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-800/80 overflow-hidden light:bg-slate-200">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500 rounded-full"
              style={{ width: `${targetPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Stat Tiles Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completed Today */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm light:border-slate-200 light:bg-white transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t.tasksCompleted}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-100 light:text-slate-900">
              {todayTasksCompletedCount}
            </span>
            <span className="text-xs text-slate-500">
              / {todayTasksTotalCount} today
            </span>
          </div>
        </div>

        {/* Remaining Tasks */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm light:border-slate-200 light:bg-white transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t.tasksRemaining}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-100 light:text-slate-900">
              {pendingTodayTasks.length}
            </span>
            <span className="text-xs text-slate-500">pending</span>
          </div>
        </div>

        {/* Habit Streaks */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm light:border-slate-200 light:bg-white transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t.activeHabits}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-100 light:text-slate-900">
              {habits.length}
            </span>
            <span className="text-xs text-emerald-400 font-semibold">
              {habits.filter((h) => !!h.history[todayStr]).length} done today
            </span>
          </div>
        </div>

        {/* Productivity Score */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm light:border-slate-200 light:bg-white transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">{t.productivityScore}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 glow-trexy-sm">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">
              {productivityScore}%
            </span>
            <span className="text-xs text-slate-500">score</span>
          </div>
        </div>
      </div>

      {/* 3. Main Split: Today's Tasks & Habits Routine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-100 light:text-slate-900">
                {t.todayTasks}
              </h2>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400 light:bg-slate-200 light:text-slate-700">
                {todayTasks.length}
              </span>
            </div>
            <button
              onClick={() => setActiveView('tasks')}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <span>{t.viewAllTasks}</span>
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </button>
          </div>

          {/* Today Tasks List */}
          <div className="space-y-2.5">
            {todayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center light:border-slate-300 light:bg-slate-50">
                <Calendar className="h-10 w-10 text-slate-600 mb-2" />
                <p className="text-sm text-slate-400 max-w-sm">
                  {t.noTasksToday}
                </p>
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="mt-3 rounded-xl bg-emerald-500/20 px-3.5 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30"
                >
                  + {t.addTask}
                </button>
              </div>
            ) : (
              todayTasks.map((task) => (
                <div
                  key={task.id}
                  className={`group relative rounded-2xl border p-4 transition-all ${
                    task.completed
                      ? 'border-slate-800/60 bg-slate-900/30 opacity-70 light:border-slate-200 light:bg-slate-50'
                      : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 light:border-slate-200 light:bg-white shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTaskCompleted(task.id)}
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                        task.completed
                          ? 'border-emerald-500 bg-emerald-500 text-slate-950'
                          : 'border-slate-600 bg-slate-800/80 hover:border-emerald-400 light:border-slate-300 light:bg-slate-100'
                      }`}
                    >
                      {task.completed && <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-semibold truncate ${
                            task.completed
                              ? 'line-through text-slate-500'
                              : 'text-slate-200 light:text-slate-800'
                          }`}
                        >
                          {task.title}
                        </span>

                        {/* Priority Badge */}
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                            task.priority === 'high'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : task.priority === 'medium'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {task.priority}
                        </span>

                        {/* Category */}
                        <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-400 light:bg-slate-200 light:text-slate-700">
                          {task.category}
                        </span>

                        {/* Postponed Warning */}
                        {task.postponedCount > 0 && (
                          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                            <AlertCircle className="h-2.5 w-2.5" />
                            <span>{task.postponedCount}x postponed</span>
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                          {task.description}
                        </p>
                      )}

                      {/* Subtasks Progress */}
                      {task.subtasks.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                          <div className="h-1.5 w-24 rounded-full bg-slate-800 overflow-hidden light:bg-slate-200">
                            <div
                              className="h-full bg-emerald-400 rounded-full"
                              style={{
                                width: `${
                                  (task.subtasks.filter((st) => st.completed).length /
                                    task.subtasks.length) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                          <span>
                            {task.subtasks.filter((st) => st.completed).length}/
                            {task.subtasks.length} steps
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quick Task Actions */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      {!task.completed && (
                        <button
                          onClick={() => setTaskToPostpone(task)}
                          title="Postpone"
                          className="rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-amber-400 transition-colors light:hover:bg-slate-200"
                        >
                          <Clock className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setTaskToEdit(task);
                          setIsTaskModalOpen(true);
                        }}
                        title="Edit"
                        className="rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-200 transition-colors light:hover:bg-slate-200"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Today's Habits & Active Goals */}
        <div className="space-y-6">
          {/* Habits Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 light:border-slate-200 light:bg-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100 light:text-slate-900">
                  {t.todayHabits}
                </h3>
              </div>
              <button
                onClick={() => setIsHabitModalOpen(true)}
                className="text-xs text-emerald-400 font-semibold hover:text-emerald-300"
              >
                + {t.addHabit}
              </button>
            </div>

            <div className="space-y-2">
              {habits.slice(0, 4).map((habit) => {
                const isDoneToday = !!habit.history[todayStr];
                return (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabitDay(habit.id, todayStr)}
                    className={`flex items-center justify-between rounded-xl border p-2.5 cursor-pointer transition-all ${
                      isDoneToday
                        ? 'border-emerald-500/40 bg-emerald-950/20 text-slate-200 light:bg-emerald-50 light:border-emerald-300'
                        : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700 light:border-slate-200 light:bg-slate-100 light:text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
                        style={{ backgroundColor: habit.color }}
                      >
                        <Flame className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold leading-tight">{habit.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          🔥 {habit.streak} day streak
                        </p>
                      </div>
                    </div>

                    <div
                      className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                        isDoneToday
                          ? 'border-emerald-500 bg-emerald-500 text-slate-950'
                          : 'border-slate-600 bg-slate-800/60 light:border-slate-300'
                      }`}
                    >
                      {isDoneToday && <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Goals Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 light:border-slate-200 light:bg-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100 light:text-slate-900">
                  {t.activeGoalsPreview}
                </h3>
              </div>
              <button
                onClick={() => setIsGoalModalOpen(true)}
                className="text-xs text-emerald-400 font-semibold hover:text-emerald-300"
              >
                + {t.addGoal}
              </button>
            </div>

            <div className="space-y-3">
              {activeGoals.map((goal) => (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 light:text-slate-800 truncate">
                      {goal.title}
                    </span>
                    <span className="font-bold text-emerald-400">{goal.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden light:bg-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* T-Rex AI Mascot Tip of the Day */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 p-4 shadow-md">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 shrink-0 rounded-xl overflow-hidden border border-emerald-400/50 glow-trexy-sm">
                <img
                  src={MASCOT_IMAGE_URL}
                  alt="T-Rex Mascot"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                  <span>T-Rex Daily Rule</span>
                  <Sparkles className="h-3 w-3 text-cyan-400" />
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  "If a task takes less than 2 minutes, don't postpone it. Stomp it immediately and keep your mental bandwidth clean!"
                </p>
                <button
                  onClick={() => setIsAIModalOpen(true)}
                  className="mt-2 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <span>Chat with T-Rex</span>
                  <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
      />
      <PostponeModal
        isOpen={!!taskToPostpone}
        onClose={() => setTaskToPostpone(null)}
        task={taskToPostpone}
      />
      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
      />
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
      />
    </div>
  );
};
