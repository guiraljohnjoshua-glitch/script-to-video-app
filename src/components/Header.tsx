import React from 'react';
import { Video, Sparkles, BookOpen } from 'lucide-react';

interface HeaderProps {
  onOpenDocs: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDocs }) => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-zinc-950 font-bold">
            <Video className="w-5 h-5 text-zinc-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Script-to-Video Generator</h1>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Ready
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              AI Voiceover • Burned-in Subtitles • Scene & B-roll Suggestions • 1080p MP4
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-all"
            title="View system architecture and test walkthrough"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Architecture Walkthrough</span>
          </button>
        </div>
      </div>
    </header>
  );
};
