import React, { forwardRef } from 'react';
import { Download, Film, CheckCircle2, Volume2, Sparkles, RefreshCw } from 'lucide-react';
import { GeneratedVideoData } from '../types.js';

interface VideoPlayerProps {
  data: GeneratedVideoData;
  onRegenerateOtherStyle?: () => void;
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ data, onRegenerateOtherStyle }, ref) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Generated Video Preview</h3>
            <span className="text-[11px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700">
              {data.duration}s
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onRegenerateOtherStyle && (
              <button
                type="button"
                onClick={onRegenerateOtherStyle}
                className="flex items-center gap-1 text-xs text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-amber-400" />
                Switch to {data.subtitleStyle === 'classic' ? 'Highlight' : 'Classic'}
              </button>
            )}
            <a
              href={data.downloadUrl}
              download={`${data.videoId}.mp4`}
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download MP4
            </a>
          </div>
        </div>

        {/* Video Canvas Container (16:9 Aspect Ratio) */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border-2 border-zinc-800 shadow-2xl group">
          <video
            ref={ref}
            key={data.videoUrl}
            src={data.videoUrl}
            controls
            playsInline
            preload="auto"
            className="w-full h-full object-contain bg-black"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Technical Validation Badges */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Single Unified MP4
            </span>
            <span className="text-zinc-500">•</span>
            <span className="flex items-center gap-1 text-zinc-300">
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              {data.ttsEngine}
            </span>
            <span className="text-zinc-500">•</span>
            <span className="flex items-center gap-1 text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              Style: <strong className="text-white capitalize">{data.subtitleStyle}</strong>
            </span>
          </div>

          <span className="text-[11px] text-zinc-400 font-mono">
            1920×1080 • H.264 / AAC
          </span>
        </div>
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';
