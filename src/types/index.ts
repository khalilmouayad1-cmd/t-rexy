export type Priority = 'high' | 'medium' | 'low';
export type TaskCategory = 'work' | 'study' | 'personal' | 'health' | 'finance' | 'creative';
export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | '3_times_week';
export type GoalStatus = 'in_progress' | 'achieved' | 'paused';
export type ThemeMode = 'dark' | 'light';
export type Language = 'en' | 'ar';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  estimatedMinutes?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  category: TaskCategory;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  completed: boolean;
  completedAt?: string;
  postponedCount: number;
  lastPostponedReason?: string;
  subtasks: SubTask[];
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: string;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  history: Record<string, boolean>; // 'YYYY-MM-DD': true
  streak: number;
  bestStreak: number;
  createdAt: string;
}

export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  targetDate: string;
  progress: number; // 0 - 100
  status: GoalStatus;
  milestones: GoalMilestone[];
  createdAt: string;
}

export interface PostponementRecord {
  id: string;
  taskId: string;
  taskTitle: string;
  date: string;
  reason: string;
}

export interface UserProfile {
  name: string;
  theme: ThemeMode;
  language: Language;
  dailyTaskTarget: number;
  soundEnabled: boolean;
  celebrationsEnabled: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionType?: 'plan' | 'breakdown' | 'tip';
  actionData?: any;
}

export interface AIInsightsData {
  summary: string;
  strengths: string[];
  postponementAnalysis: string;
  actionableTips: string[];
  motivationalQuote: string;
}

export interface DayPlanBlock {
  time: string;
  taskTitle: string;
  priority: Priority;
  whyNow: string;
}

export interface DayPlan {
  theme: string;
  blocks: DayPlanBlock[];
  dinosaurTip: string;
}
