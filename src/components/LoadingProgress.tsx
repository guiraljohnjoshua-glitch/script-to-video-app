import React, { useEffect, useState } from 'react';
import { Loader2, Mic, FileText, Video, CheckCircle2 } from 'lucide-react';

interface LoadingProgressProps {
  currentStage?: number;
}

export const LoadingProgress: React.FC<LoadingProgressProps> = () => {
  const stages = [
    { title: 'Generating voiceover...', icon: Mic, detail: 'Synthesizing AI audio narration' },
    { title: 'Creating subtitles...', icon: FileText, detail: 'Calculating timing and styling ASS file' },
    { title: 'Rendering video...', icon: Video, detail: 'Encoding 1080p canvas & burning subtitles via FFmpeg' },
    { title: 'Finalizing video...', icon: CheckCircle2, detail: 'Generating single playable MP4 package' },
  ];

  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    // Progressively advance through stages during typical 5-10s pipeline
    const timer1 = setTimeout(() => setActiveStage(1), 1800);
    const timer2 = setTimeout(() => setActiveStage(2), 3600);
    const timer3 = setTimeout(() => setActiveStage(3), 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              {stages[activeStage].title}
            </h4>
            <p className="text-xs text-zinc-400">{stages[activeStage].detail}</p>
          </div>
        </div>
        <span className="text-xs font-mono font-semibold text-amber-400">
          Step {activeStage + 1} of 4
        </span>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-4 gap-1.5 pt-1">
        {stages.map((stage, idx) => {
          const isDone = idx < activeStage;
          const isCurrent = idx === activeStage;
          return (
            <div key={idx} className="space-y-1.5">
              <div className="h-1.5 rounded-full overflow-hidden bg-zinc-800">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isDone
                      ? 'bg-amber-400 w-full'
                      : isCurrent
                      ? 'bg-amber-500 w-3/4 animate-pulse'
                      : 'w-0'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] block truncate ${
                  isDone
                    ? 'text-amber-400 font-medium'
                    : isCurrent
                    ? 'text-white font-medium'
                    : 'text-zinc-600'
                }`}
              >
                {stage.title.replace('...', '')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
