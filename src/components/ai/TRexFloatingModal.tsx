import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Send,
  Loader2,
  Calendar,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MASCOT_IMAGE_URL } from '../../constants/initialData';

export const TRexFloatingModal: React.FC = () => {
  const {
    t,
    isAIModalOpen,
    setIsAIModalOpen,
    initialAIPrompt,
    chatMessages,
    addChatMessage,
    tasks,
    habits,
    goals,
    postponements,
    profile,
  } = useApp();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAIModalOpen && initialAIPrompt) {
      handleSend(initialAIPrompt);
    }
  }, [isAIModalOpen, initialAIPrompt]);

  useEffect(() => {
    if (isAIModalOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAIModalOpen, isLoading]);

  if (!isAIModalOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const text = customPrompt || input;
    if (!text.trim() || isLoading) return;

    setInput('');
    addChatMessage({ role: 'user', content: text.trim() });
    setIsLoading(true);

    try {
      const context = {
        totalTasks: tasks.length,
        completedToday: tasks.filter((t) => t.dueDate === new Date().toISOString().split('T')[0] && t.completed).length,
        pendingTasks: tasks.filter((t) => !t.completed).map((t) => ({
          title: t.title,
          priority: t.priority,
          dueDate: t.dueDate,
          postponedCount: t.postponedCount,
        })),
        habits: habits.map((h) => ({ name: h.name, streak: h.streak })),
        goals: goals.map((g) => ({ title: g.title, progress: `${g.progress}%` })),
        postponedCount: postponements.length,
      };

      const historyToSend = [
        ...chatMessages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: text.trim() },
      ];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyToSend,
          context,
          language: profile.language,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        addChatMessage({ role: 'assistant', content: data.reply });
      } else if (data.error) {
        addChatMessage({ role: 'assistant', content: `⚠️ ${data.error}` });
      }
    } catch {
      addChatMessage({
        role: 'assistant',
        content: 'ROAR! 🦖 Temporary network hiccup. Please try again!',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl h-[80vh] flex flex-col rounded-3xl border border-emerald-500/40 bg-slate-900 shadow-2xl dark:bg-slate-900 dark:border-slate-800 light:bg-white light:border-slate-200 overflow-hidden text-slate-100 light:text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4 light:border-slate-200 bg-slate-950/40 light:bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-xl overflow-hidden border-2 border-emerald-400 glow-trexy-sm shrink-0">
              <img src={MASCOT_IMAGE_URL} alt="T-Rex Mascot" className="h-full w-full object-cover" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 light:text-slate-900 flex items-center gap-1.5">
                <span>T-Rex AI Assistant</span>
                <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400">
                  Ready
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Ask anything about your tasks, schedule, or habits
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAIModalOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white light:hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatMessages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`h-7 w-7 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border text-xs ${
                    isUser
                      ? 'border-cyan-500/30 bg-cyan-500/20 text-cyan-300'
                      : 'border-emerald-400/50 bg-emerald-950'
                  }`}
                >
                  {isUser ? 'You' : <img src={MASCOT_IMAGE_URL} alt="T-Rex" className="h-full w-full object-cover" />}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none'
                      : 'border border-slate-800 bg-slate-800/60 text-slate-200 rounded-tl-none light:border-slate-200 light:bg-slate-100 light:text-slate-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>T-Rex is thinking...</span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="border-t border-slate-800 p-3 bg-slate-950/60 light:border-slate-200 light:bg-white flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.chatPlaceholder}
            className="flex-1 rounded-xl border border-slate-700/80 bg-slate-800/60 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none light:border-slate-300 light:bg-slate-50 light:text-slate-900"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/25 hover:from-emerald-400 transition-all disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5 rtl:rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
