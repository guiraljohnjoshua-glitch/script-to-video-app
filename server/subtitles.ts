import fs from 'fs';
import path from 'path';
import { SubtitleItem, SubtitleStyle } from './types.js';

/**
 * Converts seconds into ASS timestamp format: H:MM:SS.cs (centiseconds)
 * Example: 74.25 seconds -> "0:01:14.25"
 */
export function formatAssTime(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const hrs = Math.floor(clamped / 3600);
  const mins = Math.floor((clamped % 3600) / 60);
  const secs = Math.floor(clamped % 60);
  const centis = Math.floor((clamped % 1) * 100);

  const mm = mins.toString().padStart(2, '0');
  const ss = secs.toString().padStart(2, '0');
  const cs = centis.toString().padStart(2, '0');

  return `${hrs}:${mm}:${ss}.${cs}`;
}

/**
 * Splits raw script text into natural, bite-sized subtitle phrases (4 to 8 words).
 */
export function segmentScriptIntoPhrases(script: string): string[] {
  // Normalize whitespace
  const cleanScript = script.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
  if (!cleanScript) return [];

  // Split into sentences
  const sentenceRegex = /[^.!?]+[.!?]+|[^.!?]+$/g;
  const rawSentences = cleanScript.match(sentenceRegex) || [cleanScript];
  const phrases: string[] = [];

  for (const rawSentence of rawSentences) {
    const trimmed = rawSentence.trim();
    if (!trimmed) continue;

    // Check if sentence has sub-clauses (commas, semicolons, dashes)
    const clauses = trimmed.split(/(?<=[,;:\—\-])\s+/);

    for (const clause of clauses) {
      const words = clause.trim().split(/\s+/).filter(Boolean);
      if (words.length <= 8) {
        phrases.push(clause.trim());
      } else {
        // Break into smaller 5-7 word chunks
        let currentChunk: string[] = [];
        for (const word of words) {
          currentChunk.push(word);
          if (currentChunk.length >= 6) {
            phrases.push(currentChunk.join(' '));
            currentChunk = [];
          }
        }
        if (currentChunk.length > 0) {
          phrases.push(currentChunk.join(' '));
        }
      }
    }
  }

  return phrases.filter(p => p.length > 0);
}

/**
 * Synchronizes subtitle phrases to audio duration by calculating word weights.
 */
export function generateSubtitleTimings(
  phrases: string[],
  totalAudioDuration: number
): SubtitleItem[] {
  if (phrases.length === 0) return [];

  // Calculate weight for each phrase based on word count + punctuation pause
  const weights = phrases.map(phrase => {
    const wordCount = phrase.split(/\s+/).length;
    const hasPunctuation = /[.!?]$/.test(phrase.trim());
    return wordCount + (hasPunctuation ? 1.5 : 0.5);
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  // Leave a brief 0.15s buffer at start and end
  const usableDuration = Math.max(1, totalAudioDuration - 0.2);
  let currentTime = 0.1;

  const items: SubtitleItem[] = [];

  for (let i = 0; i < phrases.length; i++) {
    const phrase = phrases[i];
    const phraseDuration = (weights[i] / totalWeight) * usableDuration;
    const startSeconds = currentTime;
    const endSeconds = Math.min(totalAudioDuration, currentTime + phraseDuration);

    items.push({
      id: i + 1,
      start: formatAssTime(startSeconds),
      end: formatAssTime(endSeconds),
      startSeconds: Number(startSeconds.toFixed(2)),
      endSeconds: Number(endSeconds.toFixed(2)),
      text: phrase,
    });

    currentTime = endSeconds;
  }

  return items;
}

/**
 * Creates an Advanced SubStation Alpha (.ass) subtitle file.
 * Handles the two distinct styles required:
 * - Style 1 (Classic): Centered white text, subtle shadow, bottom alignment.
 * - Style 2 (Highlight): 50% larger text, vibrant electric yellow (&H0000FFFF),
 *   high-contrast background bounding box (BorderStyle 3), positioned distinctly higher.
 */
export function generateAssFile(
  subtitles: SubtitleItem[],
  style: SubtitleStyle,
  outputDir: string
): { assPath: string; items: SubtitleItem[] } {
  const fileName = `subs_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.ass`;
  const assPath = path.join(outputDir, fileName);

  let styleDefinition = '';
  if (style === 'highlight') {
    // Style 2 - Highlight:
    // Font: DejaVu Sans, Size 64 (large), Bold=1
    // PrimaryColour=&H0000FFFF (Bright electric yellow in BGR hex: Blue=00, Green=FF, Red=FF)
    // BackColour=&HBF111111 (Dark contrast backing box)
    // BorderStyle=3 (Opaque solid highlight background box)
    // MarginV=250 (Raised up noticeably towards screen center)
    styleDefinition =
      'Style: Highlight,DejaVu Sans,64,&H0000FFFF,&H000000FF,&H00000000,&HBF111111,1,0,0,0,100,100,1,0,3,6,0,2,40,40,250,1';
  } else {
    // Style 1 - Classic:
    // Font: DejaVu Sans, Size 42 (clean readable), Bold=0
    // PrimaryColour=&H00FFFFFF (Clean white)
    // OutlineColour=&H00000000, BorderStyle=1 (Outline + shadow)
    // MarginV=90 (Standard bottom centered position)
    styleDefinition =
      'Style: Classic,DejaVu Sans,42,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2.5,1.5,2,40,40,90,1';
  }

  const activeStyleName = style === 'highlight' ? 'Highlight' : 'Classic';

  let assContent = `[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
${styleDefinition}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  for (const item of subtitles) {
    // Format text: Highlight style uses bold uppercase for maximum visual distinction
    let displayText = item.text.replace(/[\r\n]+/g, ' ').trim();
    if (style === 'highlight') {
      displayText = displayText.toUpperCase();
    }

    // Escape any curly brackets or backslashes for ASS format safety
    displayText = displayText.replace(/{/g, '(').replace(/}/g, ')').replace(/\\/g, '/');

    assContent += `Dialogue: 0,${item.start},${item.end},${activeStyleName},,0,0,0,,${displayText}\n`;
  }

  fs.writeFileSync(assPath, assContent, 'utf-8');
  return { assPath, items: subtitles };
}
