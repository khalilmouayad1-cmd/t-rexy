import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  Tag,
} from 'lucide-react';
import { Priority, Task, TaskCategory, SubTask } from '../../types';
import { useApp } from '../../context/AppContext';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
}) => {
  const { t, addTask, updateTask, profile } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<TaskCategory>('work');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [breakdownError, setBreakdownError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority);
      setCategory(taskToEdit.category);
      setDueDate(taskToEdit.dueDate);
      setDueTime(taskToEdit.dueTime || '');
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('work');
      setDueDate(todayStr);
      setDueTime('');
      setSubtasks([]);
    }
    setBreakdownError('');
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      {
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((st) => st.id !== id));
  };

  const handleAIBreakdown = async () => {
    if (!title.trim()) {
      setBreakdownError('Please enter a task title first so T-Rex can break it down.');
      return;
    }
    setIsBreakingDown(true);
    setBreakdownError('');
    try {
      const res = await fetch('/api/breakdown-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: title,
          taskDescription: description,
          language: profile.language,
        }),
      });
      const data = await res.json();
      if (data.breakdown && Array.isArray(data.breakdown.subtasks)) {
        const generated: SubTask[] = data.breakdown.subtasks.map((item: { title: string; estimatedMinutes?: number }) => ({
          id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          title: item.title,
          completed: false,
          estimatedMinutes: item.estimatedMinutes,
        }));
        setSubtasks((prev) => [...prev, ...generated]);
      } else if (data.error) {
        setBreakdownError(data.error);
      }
    } catch {
      setBreakdownError('Failed to communicate with T-Rex AI breakdown service.');
    } finally {
      setIsBreakingDown(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        dueDate,
        dueTime: dueTime || undefined,
        subtasks,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        dueDate,
        dueTime: dueTime || undefined,
        completed: false,
        subtasks,
      });
    }
    onClose();
  };

  const categories: { id: TaskCategory; label: string }[] = [
    { id: 'work', label: t.categoryWork },
    { id: 'study', label: t.categoryStudy },
    { id: 'personal', label: t.categoryPersonal },
    { id: 'health', label: t.categoryHealth },
    { id: 'finance', label: t.categoryFinance },
    { id: 'creative', label: t.categoryCreative },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl dark:bg-slate-900 dark:border-slate-800 light:bg-white light:border-slate-200 text-slate-100 light:text-slate-900 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5 light:border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-100 light:text-slate-900">
              {taskToEdit ? t.editTask : t.newTask}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white light:hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.taskTitlePlaceholder}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 light:bg-slate-50 light:border-slate-300 light:text-slate-900"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.taskDescriptionPlaceholder}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 light:bg-slate-50 light:border-slate-300 light:text-slate-900"
            />
          </div>

          {/* Priority & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
                {t.filterPriority}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`rounded-lg py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                      priority === p
                        ? p === 'high'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/60 shadow-sm'
                          : p === 'medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-sm'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-sm'
                        : 'border border-slate-700/60 bg-slate-800/40 text-slate-400 hover:bg-slate-800 light:border-slate-200 light:bg-slate-100 light:text-slate-600'
                    }`}
                  >
                    {p === 'high' ? t.priorityHigh : p === 'medium' ? t.priorityMedium : t.priorityLow}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
                <Tag className="inline h-3.5 w-3.5 me-1 text-cyan-400" />
                {t.filterCategory}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 light:bg-slate-50 light:border-slate-300 light:text-slate-900"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
                <Calendar className="inline h-3.5 w-3.5 me-1 text-emerald-400" />
                {t.dueDate} *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 light:bg-slate-50 light:border-slate-300 light:text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
                <Clock className="inline h-3.5 w-3.5 me-1 text-cyan-400" />
                {t.dueTime}
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 light:bg-slate-50 light:border-slate-300 light:text-slate-900"
              />
            </div>
          </div>

          {/* Subtasks Section with T-Rex AI Breakdown */}
          <div className="pt-2 border-t border-slate-800 light:border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 light:text-slate-700">
                {t.subtasks} ({subtasks.length})
              </label>

              {/* T-Rex Breakdown Button */}
              <button
                type="button"
                onClick={handleAIBreakdown}
                disabled={isBreakingDown}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all disabled:opacity-50"
              >
                {isBreakingDown ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>{t.breakdownGenerating}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 text-cyan-400" />
                    <span>{t.aiBreakdown}</span>
                  </>
                )}
              </button>
            </div>

            {breakdownError && (
              <p className="text-xs text-rose-400 mb-2">{breakdownError}</p>
            )}

            {/* List of subtasks */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto mb-2">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between rounded-lg bg-slate-800/40 px-3 py-1.5 text-xs text-slate-200 light:bg-slate-100 light:text-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>{st.title}</span>
                    {st.estimatedMinutes && (
                      <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded">
                        ~{st.estimatedMinutes}m
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="text-slate-500 hover:text-rose-400 p-0.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add subtask input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add subtask or step..."
                className="flex-1 rounded-lg border border-slate-700/80 bg-slate-800/40 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none light:bg-slate-50 light:border-slate-300 light:text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 light:bg-slate-200 light:text-slate-700"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t.addSubtask}</span>
              </button>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 light:border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200 light:hover:bg-slate-100"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400 transition-all active:scale-95"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
