import React from 'react';
import { FileText, Wand2, Trash2, Mic } from 'lucide-react';

interface ScriptInputProps {
  script: string;
  onChangeScript: (value: string) => void;
  voiceName: string;
  onChangeVoice: (value: string) => void;
  disabled?: boolean;
}

export const DEMO_SCRIPT =
  "Today we're going to talk about business automation. Automation can save businesses time, reduce repetitive tasks, and help teams focus on more important work. With the right tools, businesses can automate lead follow-ups, customer communication, and many other daily processes.";

export const ScriptInput: React.FC<ScriptInputProps> = ({
  script,
  onChangeScript,
  voiceName,
  onChangeVoice,
  disabled = false,
}) => {
  const wordCount = script.trim() ? script.trim().split(/\s+/).length : 0;
  const charCount = script.length;

  const handleUseDemo = () => {
    onChangeScript(DEMO_SCRIPT);
  };

  const handleClear = () => {
    onChangeScript('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label htmlFor="script-textarea" className="text-sm font-semibold text-zinc-200 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-amber-400" />
          Script Input
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={handleUseDemo}
            className="flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Wand2 className="w-3 h-3" />
            Load Demo Script
          </button>
          {script && (
            <button
              type="button"
              disabled={disabled}
              onClick={handleClear}
              className="text-xs text-zinc-400 hover:text-red-400 p-1 rounded transition-colors cursor-pointer disabled:opacity-50"
              title="Clear text"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <textarea
          id="script-textarea"
          rows={6}
          disabled={disabled}
          value={script}
          onChange={e => onChangeScript(e.target.value)}
          placeholder="Paste your script here..."
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm p-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/80 transition-all resize-y disabled:opacity-60 font-sans leading-relaxed"
        />
        <div className="absolute right-3 bottom-3 flex items-center gap-3 text-[11px] text-zinc-500 pointer-events-none bg-zinc-900/90 px-2 py-0.5 rounded-md backdrop-blur border border-zinc-800">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount} chars</span>
        </div>
      </div>

      {/* Voice selection */}
      <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
        <span className="flex items-center gap-1.5">
          <Mic className="w-3.5 h-3.5 text-zinc-400" />
          AI Voiceover Narration:
        </span>
        <select
          disabled={disabled}
          value={voiceName}
          onChange={e => onChangeVoice(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-md px-2.5 py-1 text-zinc-200 text-xs focus:outline-none focus:border-amber-500"
        >
          <option value="Kore">Kore (Clear & Professional)</option>
          <option value="Puck">Puck (Energetic & Modern)</option>
          <option value="Fenrir">Fenrir (Deep & Authoritative)</option>
          <option value="Zephyr">Zephyr (Warm & Engaging)</option>
        </select>
      </div>
    </div>
  );
};
