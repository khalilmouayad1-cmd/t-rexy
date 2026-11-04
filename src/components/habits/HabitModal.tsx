import React, { useState, useEffect } from 'react';
import {
  X,
  Flame,
  Droplets,
  BookOpen,
  Footprints,
  Sparkles,
  Heart,
  Activity,
  Dumbbell,
  Code,
  Brain,
  Coffee,
  Check,
} from 'lucide-react';
import { Habit, HabitFrequency } from '../../types';
import { useApp } from '../../context/AppContext';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitToEdit?: Habit | null;
}

const AVAILABLE_ICONS = [
  { name: 'Droplets', component: Droplets },
  { name: 'BookOpen', component: BookOpen },
  { name: 'Footprints', component: Footprints },
  { name: 'Sparkles', component: Sparkles },
  { name: 'Heart', component: Heart },
  { name: 'Activity', component: Activity },
  { name: 'Dumbbell', component: Dumbbell },
  { name: 'Code', component: Code },
  { name: 'Brain', component: Brain },
  { name: 'Coffee', component: Coffee },
];

const AVAILABLE_COLORS = [
  '#22c55e', // Emerald
  '#06b6d4', // Cyan
  '#a855f7', // Purple
  '#eab308', // Amber
  '#f43f5e', // Rose
  '#3b82f6', // Blue
];

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  habitToEdit,
}) => {
  const { t, addHabit, updateHabit } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [icon, setIcon] = useState('Sparkles');
  const [color, setColor] = useState('#22c55e');

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setDescription(habitToEdit.description || '');
      setFrequency(habitToEdit.frequency);
      setIcon(habitToEdit.icon);
      setColor(habitToEdit.color);
    } else {
      setName('');
      setDescription('');
      setFrequency('daily');
      setIcon('Sparkles');
      setColor('#22c55e');
    }
  }, [habitToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (habitToEdit) {
      updateHabit(habitToEdit.id, {
        name: name.trim(),
        description: description.trim(),
        frequency,
        icon,
        color,
      });
    } else {
      addHabit({
        name: name.trim(),
        description: description.trim(),
        category: 'wellness',
        frequency,
        icon,
        color,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700/80 bg-slate-900 p-6 shadow-2xl dark:bg-slate-900 dark:border-slate-800 light:bg-white light:border-slate-200 text-slate-100 light:text-slate-900">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 light:border-slate-200">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Flame className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100 light:text-slate-900">
              {habitToEdit ? t.editHabit : t.newHabit}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white light:hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
              Habit Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.habitNamePlaceholder}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none light:bg-slate-50 light:border-slate-300 light:text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
              Purpose / Cue
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.habitDescriptionPlaceholder}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none light:bg-slate-50 light:border-slate-300 light:text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
              {t.frequency}
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none light:bg-slate-50 light:border-slate-300 light:text-slate-900"
            >
              <option value="daily">{t.freqDaily}</option>
              <option value="weekdays">{t.freqWeekdays}</option>
              <option value="weekends">{t.freqWeekends}</option>
              <option value="3_times_week">{t.freq3x}</option>
            </select>
          </div>

          {/* Color & Icon Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
              {t.selectColor}
            </label>
            <div className="flex gap-2">
              {AVAILABLE_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className="h-7 w-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="h-4 w-4 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
              {t.selectIcon}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {AVAILABLE_ICONS.map((item) => {
                const IconComponent = item.component;
                const isSelected = icon === item.name;
                return (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => setIcon(item.name)}
                    className={`flex h-10 items-center justify-center rounded-xl border transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm'
                        : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800 light:border-slate-200 light:bg-slate-100 light:text-slate-600'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </button>
                );
              })}
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
