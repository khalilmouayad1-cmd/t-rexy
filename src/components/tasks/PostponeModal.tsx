import React, { useState } from 'react';
import { X, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { Task } from '../../types';
import { useApp } from '../../context/AppContext';

interface PostponeModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export const PostponeModal: React.FC<PostponeModalProps> = ({
  isOpen,
  onClose,
  task,
}) => {
  const { t, postponeTask, profile } = useApp();

  const [newDueDate, setNewDueDate] = useState('');
  const [reason, setReason] = useState('');

  if (!isOpen || !task) return null;

  const getOffsetDateStr = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const presetReasons = profile.language === 'ar' ? [
    'شعور بالإرهاق والحاجة للراحة',
    'انتظار رد أو معلومات من شخص آخر',
    'المهمة كبيرة وتحتاج إلى تفكيك',
    'ظهور مهمة أخرى أكثر إلحاحاً',
    'عدم وضوح الخطوة الأولى للبدء',
  ] : [
    'Felt fatigued / low energy',
    'Waiting on external feedback / inputs',
    'Task felt too large or ambiguous',
    'Urgent fires / higher priority emerged',
    'Unclear on the first physical action',
  ];

  const handleQuickDate = (days: number) => {
    setNewDueDate(getOffsetDateStr(days));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDueDate) return;
    postponeTask(task.id, newDueDate, reason || 'Postponed for focus realignment');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700/80 bg-slate-900 p-6 shadow-2xl dark:bg-slate-900 dark:border-slate-800 light:bg-white light:border-slate-200 text-slate-100 light:text-slate-900">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 light:border-slate-200">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 light:text-slate-900">
                {t.postponeTask}
              </h3>
              <p className="text-xs text-amber-400 font-medium">
                {task.postponedCount > 0 ? t.postponedTimes.replace('{count}', String(task.postponedCount)) : 'First time postponing'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white light:hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="rounded-xl bg-slate-800/40 p-3 text-xs text-slate-300 light:bg-slate-100 light:text-slate-700">
            <span className="font-semibold text-emerald-400">Task:</span> {task.title}
          </div>

          {/* Quick Date Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-2">
              <Calendar className="inline h-3.5 w-3.5 me-1 text-cyan-400" />
              New Target Date *
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              <button
                type="button"
                onClick={() => handleQuickDate(1)}
                className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 hover:text-white light:bg-slate-200 light:text-slate-700"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(2)}
                className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 hover:text-white light:bg-slate-200 light:text-slate-700"
              >
                In 2 Days
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(7)}
                className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 hover:text-white light:bg-slate-200 light:text-slate-700"
              >
                Next Week
              </button>
            </div>
            <input
              type="date"
              required
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none light:bg-slate-50 light:border-slate-300 light:text-slate-900"
            />
          </div>

          {/* Postpone Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
              <AlertTriangle className="inline h-3.5 w-3.5 me-1 text-amber-400" />
              {t.postponeReasonLabel}
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {presetReasons.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setReason(r)}
                  className={`rounded-md px-2 py-1 text-[11px] transition-colors text-start ${
                    reason === r
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 light:bg-slate-100 light:text-slate-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t.postponeReasonPlaceholder}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none light:bg-slate-50 light:border-slate-300 light:text-slate-900"
            />
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
              className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 transition-all active:scale-95"
            >
              Confirm Postponement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
