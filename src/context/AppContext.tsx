import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { collection, doc, query, onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import {
  DEFAULT_USER_PROFILE,
  INITIAL_TASKS,
  INITIAL_HABITS,
  INITIAL_GOALS,
  INITIAL_POSTPONEMENTS,
} from '../constants/initialData';
import { translations } from '../locales/translations';
import {
  ChatMessage,
  Goal,
  Habit,
  Language,
  PostponementRecord,
  Task,
  ThemeMode,
  UserProfile,
} from '../types';
import { playChime, triggerCelebration } from '../components/common/Confetti';

export type AppView = 'dashboard' | 'tasks' | 'habits' | 'goals' | 'analytics' | 'ai' | 'settings';

interface AppContextType {
  // Navigation
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  isAIModalOpen: boolean;
  setIsAIModalOpen: (open: boolean) => void;
  openAIModalWithPrompt?: (prompt: string) => void;
  initialAIPrompt: string;

  // Auth
  user: User | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;

  // Profile & Preferences
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  theme: ThemeMode;
  language: Language;
  t: typeof translations['en'];

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'postponedCount'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompleted: (id: string) => void;
  postponeTask: (id: string, newDueDate: string, reason: string) => void;
  addSubtask: (taskId: string, title: string, estimatedMinutes?: number) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;

  // Habits
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'bestStreak' | 'history'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitDay: (id: string, dateStr: string) => void;

  // Goals
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleGoalMilestone: (goalId: string, milestoneId: string) => void;

  // Postponements & History
  postponements: PostponementRecord[];

  // Chat History
  chatMessages: ChatMessage[];
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatMessages: () => void;

  // Data Actions
  loadSampleData: () => void;
  clearAllData: () => void;
  exportDataJSON: () => void;
  importDataJSON: (jsonStr: string) => boolean;

  // Computed Metrics
  todayTasksCompletedCount: number;
  todayTasksTotalCount: number;
  todayHabitsCompletedCount: number;
  todayHabitsTotalCount: number;
  productivityScore: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [initialAIPrompt, setInitialAIPrompt] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [postponements, setPostponements] = useState<PostponementRecord[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Setup Firestore listeners
        const tasksQuery = query(collection(db, `users/${firebaseUser.uid}/tasks`));
        const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
          const fetchedTasks = snapshot.docs.map((doc) => ({ ...doc.data() as Task, id: doc.id }));
          setTasks(fetchedTasks);
        });
        return () => unsubscribe();
      } else {
        setTasks([]);
        setHabits([]);
        setGoals([]);
      }
    });
  }, []);

  const signIn = async () => { await signInWithPopup(auth, googleProvider); };
  const signOutUser = async () => { await signOut(auth); };

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'postponedCount'>) => {
    if (!user) return;
    const taskRef = doc(collection(db, `users/${user.uid}/tasks`));
    await setDoc(taskRef, { ...taskData, id: taskRef.id, postponedCount: 0, createdAt: new Date().toISOString() });
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user) return;
    await updateDoc(doc(db, `users/${user.uid}/tasks`, id), updates);
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/tasks`, id));
  };

  const toggleTaskCompleted = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    updateTask(id, { completed: !task.completed });
  };

  const postponeTask = (id: string, newDueDate: string, reason: string) => { /* Simplified for brevity */ };
  const addSubtask = (taskId: string, title: string, estimatedMinutes?: number) => { /* ... */ };
  const toggleSubtask = (taskId: string, subtaskId: string) => { /* ... */ };
  const addHabit = (habitData: any) => { /* ... */ };
  const updateHabit = (id: string, updates: any) => { /* ... */ };
  const deleteHabit = (id: string) => { /* ... */ };
  const toggleHabitDay = (id: string, dateStr: string) => { /* ... */ };
  const addGoal = (goalData: any) => { /* ... */ };
  const updateGoal = (id: string, updates: any) => { /* ... */ };
  const deleteGoal = (id: string) => { /* ... */ };
  const toggleGoalMilestone = (goalId: string, milestoneId: string) => { /* ... */ };
  const addChatMessage = (msg: any) => { /* ... */ };
  const clearChatMessages = () => { /* ... */ };
  const loadSampleData = () => { /* ... */ };
  const clearAllData = () => { /* ... */ };
  const exportDataJSON = () => { /* ... */ };
  const importDataJSON = (json: string) => { return true; };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const todayTasksCompletedCount = todayTasks.filter((t) => t.completed).length;
  const todayTasksTotalCount = todayTasks.length;
  const todayHabitsCompletedCount = habits.filter((h) => !!h.history[todayStr]).length;
  const todayHabitsTotalCount = habits.length;
  const productivityScore = 0;

  const t = translations[profile.language] || translations.en;

  return (
    <AppContext.Provider
      value={{
        activeView, setActiveView, isAIModalOpen, setIsAIModalOpen, initialAIPrompt,
        user, signIn, signOut: signOutUser,
        profile, updateProfile: (u) => setProfile(p => ({...p, ...u})), theme: profile.theme, language: profile.language, t,
        tasks, addTask, updateTask, deleteTask, toggleTaskCompleted, postponeTask, addSubtask, toggleSubtask,
        habits, addHabit, updateHabit, deleteHabit, toggleHabitDay,
        goals, addGoal, updateGoal, deleteGoal, toggleGoalMilestone,
        postponements, chatMessages, addChatMessage, clearChatMessages,
        loadSampleData, clearAllData, exportDataJSON, importDataJSON,
        todayTasksCompletedCount, todayTasksTotalCount, todayHabitsCompletedCount, todayHabitsTotalCount, productivityScore,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
