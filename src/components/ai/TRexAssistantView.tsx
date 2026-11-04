import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Volume2,
  VolumeX,
  Loader2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MASCOT_IMAGE_URL } from '../../constants/initialData';

export const TRexAssistantView: React.FC = () => {
  const {
    t,
    chatMessages,
    addChatMessage,
    clearChatMessages,
    tasks,
    habits,
    goals,
    postponements,
    profile,
  } = useApp();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    setErrorMessage('');
    const userMsg = query.trim();
    setInput('');
    addChatMessage({ role: 'user', content: userMsg });

    setIsLoading(true);

    try {
      // Build context of user's active productivity state
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
        { role: 'user', content: userMsg },
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
        setErrorMessage(data.error);
        addChatMessage({
          role: 'assistant',
          content: `⚠️ ${data.error}`,
        });
      }
    } catch {
      setErrorMessage('Could not connect to T-Rex server.');
      addChatMessage({
        role: 'assistant',
        content: 'ROAR! 🦖 I encountered a connection hiccup with the server. Please check your network or try again in a moment!',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = profile.language === 'ar' ? 'ar' : 'en-US';
    utterance.rate = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const quickPrompts = [
    { label: t.quickPrompt1, query: 'Plan my daily schedule with time blocks based on my pending tasks.' },
    { label: t.quickPrompt2, query: 'Why am I postponing tasks and how can I fix it?' },
    { label: t.quickPrompt3, query: 'What is my highest impact task right now?' },
    { label: t.quickPrompt4, query: 'Give me 3 micro-habits to boost focus and consistency.' },
    { label: t.quickPromptArabic, query: 'نظّم لي يومي باللغة العربية واقترح خطة محكمة للمهام' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl overflow-hidden light:border-slate-200 light:bg-white transition-colors">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-3.5 light:border-slate-200">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 rounded-2xl overflow-hidden border-2 border-emerald-400 glow-trexy-sm shadow-md shrink-0">
            <img src={MASCOT_IMAGE_URL} alt="T-Rex Mascot" className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-100 light:text-slate-900">
                T-Rex AI Coach
              </h2>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {t.aiAssistantSubtitle}
            </p>
          </div>
        </div>

        <button
          onClick={clearChatMessages}
          title={t.clearChat}
          className="flex items-center gap-1 rounded-xl border border-slate-700/60 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-400 hover:border-rose-500/30 light:border-slate-200 light:bg-slate-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t.clearChat}</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`h-9 w-9 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border ${
                  isUser
                    ? 'border-cyan-500/40 bg-cyan-500/20 text-cyan-300'
                    : 'border-emerald-400/60 bg-emerald-950/40 shadow-sm'
                }`}
              >
                {isUser ? (
                  <User className="h-4 w-4" />
                ) : (
                  <img src={MASCOT_IMAGE_URL} alt="T-Rex" className="h-full w-full object-cover" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`group relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-slate-950 font-medium rounded-tr-none shadow-md shadow-emerald-500/15'
                    : 'border border-slate-800 bg-slate-800/60 text-slate-200 rounded-tl-none light:border-slate-200 light:bg-slate-100 light:text-slate-900 shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Speech Button for AI replies */}
                {!isUser && (
                  <button
                    onClick={() => handleSpeech(msg.content)}
                    title={isSpeaking ? t.stopAudio : t.readAloud}
                    className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors opacity-80 group-hover:opacity-100"
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="h-3.5 w-3.5 text-rose-400" />
                        <span>{t.stopAudio}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>{t.readAloud}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl overflow-hidden border border-emerald-400/60 shrink-0">
              <img src={MASCOT_IMAGE_URL} alt="T-Rex" className="h-full w-full object-cover animate-pulse" />
            </div>
            <div className="rounded-2xl rounded-tl-none border border-slate-800 bg-slate-800/60 p-4 text-xs text-slate-300 light:border-slate-200 light:bg-slate-100 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
              <span>T-Rex is analyzing your schedule and thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="border-t border-slate-800/60 px-5 py-2.5 bg-slate-950/40 light:bg-slate-50 overflow-x-auto flex gap-2">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp.query)}
            disabled={isLoading}
            className="whitespace-nowrap rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300 transition-colors light:border-slate-200 light:bg-white light:text-slate-700"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="border-t border-slate-800 p-4 bg-slate-900/90 light:border-slate-200 light:bg-white flex items-center gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.chatPlaceholder}
          disabled={isLoading}
          className="flex-1 rounded-xl border border-slate-700/80 bg-slate-800/60 px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 light:border-slate-300 light:bg-slate-50 light:text-slate-900"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-md shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-400 transition-all disabled:opacity-40"
        >
          <Send className="h-4 w-4 rtl:rotate-180" />
          <span className="hidden sm:inline ms-1.5">{t.send}</span>
        </button>
      </form>
    </div>
  );
};
