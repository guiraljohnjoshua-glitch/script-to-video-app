/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Header } from './components/Header.js';
import { ScriptInput, DEMO_SCRIPT } from './components/ScriptInput.js';
import { StyleSelector } from './components/StyleSelector.js';
import { LoadingProgress } from './components/LoadingProgress.js';
import { VideoPlayer } from './components/VideoPlayer.js';
import { SceneSuggestions } from './components/SceneSuggestions.js';
import { ArchitectureModal } from './components/ArchitectureModal.js';
import { SubtitleStyle, GeneratedVideoData } from './types.js';
import { Play, AlertCircle, Film, RefreshCw, Sparkles, Layers } from 'lucide-react';

export default function App() {
  const [script, setScript] = useState<string>(DEMO_SCRIPT);
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>('classic');
  const [voiceName, setVoiceName] = useState<string>('Kore');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedData, setGeneratedData] = useState<GeneratedVideoData | null>(null);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleGenerateVideo = async (overrideStyle?: SubtitleStyle) => {
    const activeStyle = overrideStyle || subtitleStyle;

    if (!script || !script.trim()) {
      setErrorMessage('Please enter or paste a script before generating video.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: script.trim(),
          subtitleStyle: activeStyle,
          voiceName,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate video. Please try again.');
      }

      setGeneratedData(data);
      if (overrideStyle) {
        setSubtitleStyle(overrideStyle);
      }
    } catch (err: any) {
      console.error('Video generation error:', err);
      setErrorMessage(err?.message || 'An unexpected error occurred during generation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeekTo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleRegenerateOtherStyle = () => {
    const nextStyle: SubtitleStyle = subtitleStyle === 'classic' ? 'highlight' : 'classic';
    handleGenerateVideo(nextStyle);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <Header onOpenDocs={() => setIsDocsOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input Studio */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl backdrop-blur-sm">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-400" />
                  Script &amp; Style Configuration
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Configure your text and subtitle styling to produce a complete 1080p MP4.
                </p>
              </div>

              {/* Script Input Component */}
              <ScriptInput
                script={script}
                onChangeScript={setScript}
                voiceName={voiceName}
                onChangeVoice={setVoiceName}
                disabled={isLoading}
              />

              {/* Subtitle Style Selector */}
              <StyleSelector
                selectedStyle={subtitleStyle}
                onSelectStyle={setSubtitleStyle}
                disabled={isLoading}
              />

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3 text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-200 mb-0.5">Generation Error</p>
                    <p className="leading-relaxed">{errorMessage}</p>
                    <button
                      type="button"
                      onClick={() => handleGenerateVideo()}
                      className="mt-2 text-xs font-semibold text-red-300 hover:text-white underline cursor-pointer"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              )}

              {/* Loading Progress State */}
              {isLoading && <LoadingProgress />}

              {/* Generate Video Action Button */}
              <button
                type="button"
                disabled={isLoading || !script.trim()}
                onClick={() => handleGenerateVideo()}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
                  isLoading || !script.trim()
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                    : 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-zinc-950 hover:brightness-105 active:scale-[0.99] shadow-amber-500/20'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                    <span>Processing Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Generate Video</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                <span>Output: 1080p MP4 • H.264 / AAC</span>
                <span>Subtitles: Burned-in (libass)</span>
              </div>
            </div>

            {/* Quick Test Instructions Card */}
            <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-xl p-4 text-xs text-zinc-400 space-y-2">
              <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Prototype Verification Guide:
              </div>
              <ul className="list-disc list-inside space-y-1 text-zinc-400">
                <li><strong className="text-zinc-300">Test 1 (Style 1 Classic):</strong> Select Classic &rarr; Generate &rarr; verify centered white subtitles burned in.</li>
                <li><strong className="text-zinc-300">Test 2 (Style 2 Highlight):</strong> Select Highlight &rarr; Generate &rarr; verify 50% larger yellow text with dark highlight box.</li>
                <li><strong className="text-zinc-300">Test 3 (B-roll):</strong> Verify timestamped scene recommendations below the player.</li>
                <li><strong className="text-zinc-300">Test 4 (Unified File):</strong> Play or download the single MP4 containing both audio &amp; burned-in subtitles.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Output & Scene Suggestions */}
          <div className="lg:col-span-6 space-y-6">
            {generatedData ? (
              <div className="space-y-6">
                {/* Single MP4 Video Player */}
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm">
                  <VideoPlayer
                    ref={videoRef}
                    data={generatedData}
                    onRegenerateOtherStyle={handleRegenerateOtherStyle}
                  />
                </div>

                {/* Scene & B-roll Suggestions */}
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm">
                  <SceneSuggestions
                    scenes={generatedData.scenes}
                    onSeekTo={handleSeekTo}
                  />
                </div>
              </div>
            ) : (
              /* Empty Placeholder State */
              <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-4 min-h-[460px]">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 shadow-inner">
                  <Film className="w-8 h-8 text-zinc-600" />
                </div>
                <div className="max-w-xs space-y-1">
                  <h3 className="text-sm font-semibold text-zinc-300">
                    No Video Generated Yet
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Paste your script or click &ldquo;Load Demo Script&rdquo;, pick a subtitle style, and click &ldquo;Generate Video&rdquo;.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleGenerateVideo()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-semibold border border-zinc-700 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Quick Start Demo Video
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-4 mt-auto bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-zinc-500">
          <span>Script-to-Video Generator Prototype</span>
          <button
            onClick={() => setIsDocsOpen(true)}
            className="hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            <Layers className="w-3 h-3" />
            Architecture Walkthrough
          </button>
        </div>
      </footer>

      {/* Technical Architecture Modal */}
      <ArchitectureModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  );
}
