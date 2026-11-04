import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  MoreVertical,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Priority, Task, TaskCategory } from '../../types';
import { TaskModal } from './TaskModal';
import { PostponeModal } from './PostponeModal';

type TaskTab = 'all' | 'today' | 'weekly' | 'upcoming' | 'completed';

export const TasksView: React.FC = () => {
  const {
    t,
    tasks,
    toggleTaskCompleted,
    deleteTask,
    toggleSubtask,
    addSubtask,
    profile,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TaskTab>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title' | 'newest'>('dueDate');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToPostpone, setTaskToPostpone] = useState<Task | null>(null);

  // Expanded subtasks state for cards
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});
  const [breakingDownTaskId, setBreakingDownTaskId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedTaskIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const handleCardAIBreakdown = async (task: Task) => {
    setBreakingDownTaskId(task.id);
    try {
      const res = await fetch('/api/breakdown-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: task.title,
          taskDescription: task.description,
          language: profile.language,
        }),
      });
      const data = await res.json();
      if (data.breakdown && Array.isArray(data.breakdown.subtasks)) {
        data.breakdown.subtasks.forEach((st: { title: string; estimatedMinutes?: number }) => {
          addSubtask(task.id, st.title, st.estimatedMinutes);
        });
        setExpandedTaskIds((prev) => ({ ...prev, [task.id]: true }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBreakingDownTaskId(null);
    }
  };

  // Filter & Sort Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Tab filtering
      if (activeTab === 'today') {
        if (task.dueDate !== todayStr || task.completed) return false;
      } else if (activeTab === 'weekly') {
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);
        const taskD = new Date(task.dueDate);
        if (taskD < now || taskD > nextWeek || task.completed) return false;
      } else if (activeTab === 'upcoming') {
        if (task.dueDate <= todayStr || task.completed) return false;
      } else if (activeTab === 'completed') {
        if (!task.completed) return false;
      }

      // Priority filtering
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;

      // Category filtering
      if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description?.toLowerCase().includes(q);
        const matchCat = task.category.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCat) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'dueDate') {
        return a.dueDate.localeCompare(b.dueDate);
      } else if (sortBy === 'priority') {
        const weight: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
        return weight[b.priority] - weight[a.priority];
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else {
        return b.createdAt.localeCompare(a.createdAt);
      }
    });
  }, [tasks, activeTab, selectedPriority, selectedCategory, searchQuery, sortBy, todayStr]);

  const priorityWeights = {
    high: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    medium: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 light:text-slate-900">
            {t.tasksTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {t.tasksSubtitle}
          </p>
        </div>

        <button
          onClick={() => {
            setTaskToEdit(null);
            setIsTaskModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-md shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-400 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>{t.newTask}</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 light:border-slate-200 overflow-x-auto gap-2 pb-1">
        {[
          { id: 'today', label: t.todayView },
          { id: 'weekly', label: t.weeklyView },
          { id: 'upcoming', label: t.upcomingView },
          { id: 'all', label: t.allTasks },
          { id: 'completed', label: t.completedView },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TaskTab)}
            className={`whitespace-nowrap px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 light:text-slate-600 light:hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Controls Bar: Search, Filters, Sort */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative md:col-span-2">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/60 ps-9 pe-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none light:border-slate-300 light:bg-white light:text-slate-900"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs light:border-slate-300 light:bg-white">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full bg-transparent text-slate-200 focus:outline-none light:text-slate-800"
          >
            <option value="all">All Priorities</option>
            <option value="high">{t.priorityHigh}</option>
            <option value="medium">{t.priorityMedium}</option>
            <option value="low">{t.priorityLow}</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs light:border-slate-300 light:bg-white">
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-transparent text-slate-200 focus:outline-none light:text-slate-800"
          >
            <option value="dueDate">{t.sortDeadline}</option>
            <option value="priority">{t.sortPriority}</option>
            <option value="title">{t.sortTitle}</option>
            <option value="newest">{t.sortNewest}</option>
          </select>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center light:border-slate-300 light:bg-slate-50">
            <CheckCircle2 className="mx-auto h-12 w-12 text-slate-600 mb-3" />
            <h3 className="text-base font-semibold text-slate-300 light:text-slate-800">
              No tasks match your selection
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Add a new task or adjust your search filter.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isExpanded = !!expandedTaskIds[task.id];
            const isOverdue = !task.completed && task.dueDate < todayStr;
            const completedSubCount = task.subtasks.filter((st) => st.completed).length;

            return (
              <div
                key={task.id}
                className={`group rounded-2xl border p-4 transition-all ${
                  task.completed
                    ? 'border-slate-800/50 bg-slate-900/30 opacity-75 light:border-slate-200 light:bg-slate-50'
                    : isOverdue
                    ? 'border-rose-500/30 bg-rose-950/10 light:border-rose-200 light:bg-rose-50/40'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 light:border-slate-200 light:bg-white shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Complete checkbox */}
                  <button
                    onClick={() => toggleTaskCompleted(task.id)}
                    className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                      task.completed
                        ? 'border-emerald-500 bg-emerald-500 text-slate-950'
                        : 'border-slate-600 bg-slate-800/80 hover:border-emerald-400 light:border-slate-300 light:bg-slate-100'
                    }`}
                  >
                    {task.completed && <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />}
                  </button>

                  {/* Task details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-bold ${
                          task.completed
                            ? 'line-through text-slate-500'
                            : 'text-slate-100 light:text-slate-900'
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Priority */}
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase border ${
                          priorityWeights[task.priority]
                        }`}
                      >
                        {task.priority}
                      </span>

                      {/* Category */}
                      <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-400 border border-slate-700/50 light:bg-slate-200 light:text-slate-700">
                        {task.category}
                      </span>

                      {/* Due date info */}
                      <span
                        className={`flex items-center gap-1 text-[11px] font-medium ${
                          isOverdue
                            ? 'text-rose-400 font-bold'
                            : task.dueDate === todayStr
                            ? 'text-emerald-400'
                            : 'text-slate-400'
                        }`}
                      >
                        <Calendar className="h-3 w-3" />
                        <span>{task.dueDate}</span>
                        {task.dueTime && <span>at {task.dueTime}</span>}
                        {isOverdue && <span>(Overdue)</span>}
                      </span>

                      {/* Postponed Warning Badge */}
                      {task.postponedCount > 0 && (
                        <span className="flex items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/30">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          <span>{task.postponedCount}x postponed</span>
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                    )}

                    {/* Subtasks summary & T-Rex Breakdown Action */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-3">
                      {task.subtasks.length > 0 ? (
                        <button
                          onClick={() => toggleExpand(task.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                        >
                          <span>
                            {completedSubCount}/{task.subtasks.length} steps completed
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCardAIBreakdown(task)}
                          disabled={breakingDownTaskId === task.id}
                          className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/25 transition-all"
                        >
                          {breakingDownTaskId === task.id ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>Breaking down with T-Rex...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3" />
                              <span>🦖 AI Breakdown</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Expanded Subtasks checklist */}
                    {isExpanded && task.subtasks.length > 0 && (
                      <div className="mt-3 space-y-1.5 rounded-xl border border-slate-800 bg-slate-950/40 p-3 light:border-slate-200 light:bg-slate-50">
                        {task.subtasks.map((st) => (
                          <div
                            key={st.id}
                            onClick={() => toggleSubtask(task.id, st.id)}
                            className="flex items-center gap-2 text-xs cursor-pointer text-slate-300 hover:text-white"
                          >
                            <input
                              type="checkbox"
                              checked={st.completed}
                              onChange={() => {}}
                              className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                            />
                            <span className={st.completed ? 'line-through text-slate-500' : ''}>
                              {st.title}
                            </span>
                            {st.estimatedMinutes && (
                              <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1 rounded">
                                ~{st.estimatedMinutes}m
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {!task.completed && (
                      <button
                        onClick={() => setTaskToPostpone(task)}
                        title={t.postponeTask}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-amber-400 transition-colors light:hover:bg-slate-100"
                      >
                        <Clock className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setTaskToEdit(task);
                        setIsTaskModalOpen(true);
                      }}
                      title={t.editTask}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors light:hover:bg-slate-100"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      title={t.deleteTask}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors light:hover:bg-slate-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
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
    </div>
  );
};
