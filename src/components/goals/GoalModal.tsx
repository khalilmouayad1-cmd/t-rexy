import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, Plus, Trash2 } from 'lucide-react';
import { Goal, GoalMilestone, GoalStatus } from '../../types';
import { useApp } from '../../context/AppContext';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: Goal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  goalToEdit,
}) => {
  const { t, addGoal, updateGoal } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('work');
  const [status, setStatus] = useState<GoalStatus>('in_progress');
  const [milestones, setMilestones] = useState<GoalMilestone[]>([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  useEffect(() => {
    if (goalToEdit) {
      setTitle(goalToEdit.title);
      setDescription(goalToEdit.description || '');
      setTargetDate(goalToEdit.targetDate);
      setCategory(goalToEdit.category);
      setStatus(goalToEdit.status);
      setMilestones(goalToEdit.milestones || []);
    } else {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      setTitle('');
      setDescription('');
      setTargetDate(futureDate.toISOString().split('T')[0]);
      setCategory('work');
      setStatus('in_progress');
      setMilestones([]);
    }
  }, [goalToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    setMilestones((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        title: newMilestoneTitle.trim(),
        completed: false,
      },
    ]);
    setNewMilestoneTitle('');
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetDate) return;

    const completedCount = milestones.filter((m) => m.completed).length;
    const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

    if (goalToEdit) {
      updateGoal(goalToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        targetDate,
        category,
        status,
        progress,
        milestones,
      });
    } else {
      addGoal({
        title: title.trim(),
        description: description.trim(),
        targetDate,
        category,
        status,
        progress,
        milestones,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700/80 bg-slate-900 p-6 shadow-2xl dark:bg-slate-900 dark:border-slate-800 light:bg-white light:border-slate-200 text-slate-100 light:text-slate-900">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 light:border-slate-200">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100 light:text-slate-900">
              {goalToEdit ? t.editGoal : t.newGoal}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white light:hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
              Goal Objective *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.goalTitlePlaceholder}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none light:bg-slate-50 light:border-slate-300 light:text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
              Outcome & Motivation
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.goalDescriptionPlaceholder}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none light:bg-slate-50 light:border-slate-300 light:text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
                <Calendar className="inline h-3.5 w-3.5 me-1 text-emerald-400" />
                {t.targetDate} *
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none light:bg-slate-50 light:border-slate-300 light:text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as GoalStatus)}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none light:bg-slate-50 light:border-slate-300 light:text-slate-900"
              >
                <option value="in_progress">{t.statusInProgress}</option>
                <option value="achieved">{t.statusAchieved}</option>
                <option value="paused">{t.statusPaused}</option>
              </select>
            </div>
          </div>

          {/* Milestones Checklist */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
              {t.milestones} ({milestones.length})
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto mb-2">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg bg-slate-800/40 px-3 py-1.5 text-xs text-slate-200 light:bg-slate-100 light:text-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={m.completed}
                      onChange={() => {
                        setMilestones((prev) =>
                          prev.map((item) =>
                            item.id === m.id ? { ...item, completed: !item.completed } : item
                          )
                        );
                      }}
                      className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className={m.completed ? 'line-through text-slate-500' : ''}>{m.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(m.id)}
                    className="text-slate-500 hover:text-rose-400 p-0.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMilestone();
                  }
                }}
                placeholder={t.addMilestone}
                className="flex-1 rounded-lg border border-slate-700/80 bg-slate-800/40 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none light:bg-slate-50 light:border-slate-300 light:text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddMilestone}
                className="flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 light:bg-slate-200 light:text-slate-700"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t.addMilestone}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800 light:border-slate-200">
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
