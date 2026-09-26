import React from 'react';
import { X, CheckCircle2, Terminal, Code2, Cpu, Video, Sparkles, Layers } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
          <div>
            <span className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider">
              Technical Documentation & Walkthrough
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              Script-to-Video Generator Architecture
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
          {/* 1. Frontend Architecture */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-amber-400" />
              1. Frontend Architecture
            </h3>
            <p className="text-xs text-zinc-400">
              Built with <strong>React 19</strong>, <strong>TypeScript</strong>, and <strong>Tailwind CSS v4</strong>. Organized into modular functional components:
            </p>
            <ul className="text-xs text-zinc-400 list-disc list-inside space-y-1 pl-1">
              <li><strong className="text-zinc-200">ScriptInput:</strong> Textarea with word/character counter, demo script loader, and voice selector.</li>
              <li><strong className="text-zinc-200">StyleSelector:</strong> Two distinct subtitle styles: Style 1 (Classic white centered) and Style 2 (Highlight yellow uppercase box).</li>
              <li><strong className="text-zinc-200">VideoPlayer:</strong> Native HTML5 video player with seek/scrub controls, download button, and range streaming.</li>
              <li><strong className="text-zinc-200">SceneSuggestions:</strong> Chronological B-roll cards with interactive seek buttons that scrub the player to specific scenes.</li>
              <li><strong className="text-zinc-200">LoadingProgress:</strong> Real-time 4-stage pipeline visualization.</li>
            </ul>
          </div>

          {/* 2. Backend Architecture */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              2. Backend Architecture
            </h3>
            <p className="text-xs text-zinc-400">
              A full-stack <strong>Express</strong> server in <code className="text-amber-300">server.ts</code> running on port 3000. In development, it mounts Vite dev middlewares directly on Express (<code className="text-amber-300">vite.middlewares</code>) so API and frontend run on the same port with zero CORS issues.
            </p>
            <ul className="text-xs text-zinc-400 list-disc list-inside space-y-1 pl-1">
              <li><code className="text-amber-300">POST /api/generate-video</code>: Orchestrates voiceover, subtitle generation, scene analysis, and FFmpeg video compilation.</li>
              <li><code className="text-amber-300">GET /api/videos/:fileName</code>: Streams video with HTTP 206 Partial Content (Range header) for smooth browser seeking and scrub capability.</li>
            </ul>
          </div>

          {/* 3. AI Voiceover Generation */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              3. AI Voiceover Generation
            </h3>
            <p className="text-xs text-zinc-400">
              Implemented in <code className="text-amber-300">server/tts.ts</code>:
            </p>
            <ul className="text-xs text-zinc-400 list-disc list-inside space-y-1 pl-1">
              <li><strong>Primary:</strong> Uses Google Gemini TTS model (<code className="text-amber-300">gemini-3.8-flash-lite-tts</code>) via the <code className="text-amber-300">@google/genai</code> SDK with natural voices like Kore, Puck, Fenrir, and Zephyr.</li>
              <li><strong>Offline Fallback:</strong> If network or rate limits occur, it seamlessly falls back to FFmpeg&apos;s built-in <code className="text-amber-300">flite</code> voice synthesizer, ensuring 100% video generation reliability.</li>
              <li>Calculates exact audio duration via <code className="text-amber-300">ffprobe</code> down to the millisecond.</li>
            </ul>
          </div>

          {/* 4. Subtitle Creation and Synchronization */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              4. Subtitle Creation & Synchronization
            </h3>
            <p className="text-xs text-zinc-400">
              Handled in <code className="text-amber-300">server/subtitles.ts</code>:
            </p>
            <ul className="text-xs text-zinc-400 list-disc list-inside space-y-1 pl-1">
              <li>Segments the script into natural, readable phrases (4–8 words) at clause and punctuation boundaries.</li>
              <li>Calculates timing by assigning weighted word counts and natural pause buffers proportional to the total audio duration.</li>
              <li>Outputs an <strong>Advanced SubStation Alpha (.ass)</strong> file with pixel-precise typography:</li>
              <li className="pl-4"><strong>Style 1 (Classic):</strong> Size 42, white text, subtle shadow, bottom-centered alignment.</li>
              <li className="pl-4"><strong>Style 2 (Highlight):</strong> Size 64 (50% larger), electric yellow (<code className="text-amber-300">&amp;H0000FFFF</code>), solid dark pill background box (<code className="text-amber-300">BorderStyle 3</code>), uppercase text, positioned higher up towards center.</li>
            </ul>
          </div>

          {/* 5. FFmpeg / Video Rendering */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-amber-400" />
              5. FFmpeg / Video Rendering
            </h3>
            <p className="text-xs text-zinc-400">
              In <code className="text-amber-300">server/video.ts</code>, a single FFmpeg execution merges everything into ONE MP4:
            </p>
            <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg font-mono text-[11px] text-amber-300 overflow-x-auto">
              ffmpeg -y -f lavfi -i color=c=black:s=1920x1080:r=30 -i voice.wav -vf &quot;ass=subtitles.ass&quot; -c:v libx264 -preset ultrafast -tune stillimage -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart output.mp4
            </div>
            <p className="text-xs text-zinc-400">
              The subtitles are burned directly onto the video frames using <code className="text-amber-300">libass</code>, not overlaid in HTML.
            </p>
          </div>

          {/* 6. Scene / B-roll Suggestions */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              6. Scene / B-roll Suggestions Generation
            </h3>
            <p className="text-xs text-zinc-400">
              Implemented in <code className="text-amber-300">server/sceneAnalysis.ts</code>:
            </p>
            <ul className="text-xs text-zinc-400 list-disc list-inside space-y-1 pl-1">
              <li>Analyzes narrative arcs and script keywords (business, tech, workflow, automation, customer relations).</li>
              <li>Generates chronological timestamp intervals mapped to the audio duration.</li>
              <li>Outputs clear suggestions (e.g. &quot;Person working on a laptop&quot;, &quot;Business workflow screen&quot;, &quot;Successful team&quot;).</li>
              <li>Uses Gemini 3.8 Flash structured JSON schema when available, with a fast semantic fallback.</li>
            </ul>
          </div>

          {/* 7. Environment Variables */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              7. Environment Variables Configuration
            </h3>
            <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg font-mono text-xs text-zinc-300 space-y-1">
              <div><span className="text-amber-400">GEMINI_API_KEY</span>=&quot;your_gemini_api_key&quot; <span className="text-zinc-500"># Required for Gemini AI TTS &amp; scenes (auto-injected in AI Studio)</span></div>
              <div><span className="text-amber-400">TTS_API_KEY</span>=&quot;your_tts_key&quot; <span className="text-zinc-500"># Optional alias (defaults to GEMINI_API_KEY)</span></div>
              <div><span className="text-amber-400">PORT</span>=3000 <span className="text-zinc-500"># Server port (default: 3000)</span></div>
            </div>
          </div>

          {/* 8. Local Testing Instructions */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              8. How to Run &amp; Test Locally
            </h3>
            <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg font-mono text-xs text-zinc-300 space-y-1">
              <div className="text-zinc-500"># 1. Start development server on port 3000</div>
              <div className="text-emerald-400">npm run dev</div>
              <div className="text-zinc-500 mt-2"># 2. Open browser at http://localhost:3000</div>
              <div className="text-zinc-500"># 3. Click &quot;Load Demo Script&quot; &rarr; Select Style 1 (Classic) &rarr; Click &quot;Generate Video&quot;</div>
              <div className="text-zinc-500"># 4. Play the resulting 1080p MP4 (verify voice is audible and subtitles are burned into video)</div>
              <div className="text-zinc-500"># 5. Select Style 2 (Highlight) &rarr; Generate again (verify distinct visual yellow highlight box)</div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Got it, close walkthrough
          </button>
        </div>
      </div>
    </div>
  );
};
