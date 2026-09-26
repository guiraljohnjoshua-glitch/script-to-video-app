import React from 'react';
import { Clapperboard, Play, Sparkles } from 'lucide-react';
import { SceneSuggestion } from '../types.js';

interface SceneSuggestionsProps {
  scenes: SceneSuggestion[];
  onSeekTo?: (seconds: number) => void;
}

export const SceneSuggestions: React.FC<SceneSuggestionsProps> = ({
  scenes,
  onSeekTo,
}) => {
  if (!scenes || scenes.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
          <Clapperboard className="w-4 h-4 text-amber-400" />
          Scene / B-roll Suggestions
        </h3>
        <span className="text-xs text-zinc-400">Based on your script</span>
      </div>

      <div className="space-y-2.5">
        {scenes.map((scene) => (
          <div
            key={scene.id}
            className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900 transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {onSeekTo ? (
                  <button
                    type="button"
                    onClick={() => onSeekTo(scene.startTime)}
                    className="inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer"
                    title={`Jump video to ${scene.timeRange}`}
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    {scene.timeRange}
                  </button>
                ) : (
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {scene.timeRange}
                  </span>
                )}
                <span className="text-xs font-bold text-zinc-200">
                  {scene.title}
                </span>
              </div>
            </div>

            {scene.description && (
              <p className="text-xs text-zinc-400 mb-2 leading-relaxed">
                {scene.description}
              </p>
            )}

            <div className="flex items-start gap-2 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80 text-xs">
              <span className="text-amber-400 font-semibold shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Suggested B-roll:
              </span>
              <span className="text-zinc-300 leading-snug">
                {scene.suggestedBroll}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
