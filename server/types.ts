/**
 * Shared types for Script-to-Video Generator
 */

export type SubtitleStyle = 'classic' | 'highlight';

export interface SubtitleItem {
  id: number;
  start: string;       // e.g. "0:00:00.00"
  end: string;         // e.g. "0:00:02.50"
  startSeconds: number;
  endSeconds: number;
  text: string;
}

export interface SceneSuggestion {
  id: number;
  timeRange: string;   // e.g. "00:00 — 00:05"
  startTime: number;   // seconds
  endTime: number;     // seconds
  title: string;       // e.g. "Introduction"
  description: string; // e.g. "Opening statement about business automation"
  suggestedBroll: string; // e.g. "Person working on a laptop in an office"
}

export interface GenerateVideoRequest {
  script: string;
  subtitleStyle: SubtitleStyle;
  voiceName?: string;
}

export interface GenerateVideoResponse {
  success: boolean;
  videoId: string;
  videoUrl: string;
  downloadUrl: string;
  duration: number;
  subtitleStyle: SubtitleStyle;
  ttsEngine: string;
  scenes: SceneSuggestion[];
  subtitles: SubtitleItem[];
  error?: string;
}
