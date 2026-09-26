export type SubtitleStyle = 'classic' | 'highlight';

export interface SubtitleItem {
  id: number;
  start: string;
  end: string;
  startSeconds: number;
  endSeconds: number;
  text: string;
}

export interface SceneSuggestion {
  id: number;
  timeRange: string;
  startTime: number;
  endTime: number;
  title: string;
  description: string;
  suggestedBroll: string;
}

export interface GeneratedVideoData {
  videoId: string;
  videoUrl: string;
  downloadUrl: string;
  duration: number;
  subtitleStyle: SubtitleStyle;
  ttsEngine: string;
  scenes: SceneSuggestion[];
  subtitles: SubtitleItem[];
}
