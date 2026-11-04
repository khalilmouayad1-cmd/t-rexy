import React from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { t } = useApp();

  return (
    <footer className="border-t border-slate-800/80 bg-slate-900/40 py-4 px-6 text-center text-xs text-slate-500 light:border-slate-200 light:bg-slate-100/50 light:text-slate-600 transition-colors">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="font-bold text-emerald-400">T-Rexy</span>
          <span>•</span>
          <span>{t.byMigokh}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          <span>Smart productivity powered by Gemini AI</span>
          <Sparkles className="h-3 w-3 text-cyan-400" />
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <span>Crafted with</span>
          <Heart className="h-3 w-3 text-emerald-400 fill-emerald-400" />
          <span>for high performers</span>
        </div>
      </div>
    </footer>
  );
};
