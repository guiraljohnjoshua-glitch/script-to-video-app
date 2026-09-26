import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

export interface RenderVideoParams {
  audioPath: string;
  assPath: string;
  outputDir: string;
  videoId: string;
}

export interface RenderVideoResult {
  videoPath: string;
  videoFileName: string;
  fileSizeBytes: number;
}

/**
 * Escapes characters for FFmpeg filter arguments (colons, backslashes, quotes).
 */
function escapeFilterArg(str: string): string {
  return str.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "'\\''");
}

/**
 * Renders a full 1080p MP4 video with black background, voiceover audio,
 * and burned-in subtitles using FFmpeg libass filter.
 *
 * Technical details:
 * - Canvas: 1920x1080 30fps black canvas (-f lavfi -i color=c=black:s=1920x1080:r=30)
 * - Subtitles: Burned directly into the video stream via libass (-vf "ass=...")
 * - Video Codec: H.264 (libx264) with yuv420p pixel format for universal web browser compatibility
 * - Audio Codec: AAC at 192kbps, 44.1kHz (-c:a aac -b:a 192k)
 * - Synchronization: -shortest ensures the video finishes precisely when the voiceover finishes
 */
export async function renderFinalVideo({
  audioPath,
  assPath,
  outputDir,
  videoId,
}: RenderVideoParams): Promise<RenderVideoResult> {
  const videoFileName = `${videoId}.mp4`;
  const videoPath = path.join(outputDir, videoFileName);

  const escapedAssPath = escapeFilterArg(assPath);

  // Command explanation:
  // -y : Overwrite output file if exists
  // -f lavfi -i color=c=black:s=1920x1080:r=30 : Generates a continuous black 1080p video background at 30 fps
  // -i [audioPath] : Source voiceover audio track
  // -vf "ass=[escapedAssPath]" : Burns ASS subtitles directly onto the video frames
  // -c:v libx264 : High quality H.264 encoder
  // -preset ultrafast : Fast rendering speed for interactive web apps
  // -tune stillimage : Optimizes compression for stationary black canvas with moving text
  // -pix_fmt yuv420p : Universal color format supported by all HTML5 video players
  // -c:a aac -b:a 192k : Crisp audio compression
  // -shortest : Truncates video stream to match exact duration of the audio input
  // -movflags +faststart : Relocates MP4 moov atom to the front for instant streaming playback
  const command = `ffmpeg -y -f lavfi -i color=c=black:s=1920x1080:r=30 -i "${audioPath}" -vf "ass=${escapedAssPath}" -c:v libx264 -preset ultrafast -tune stillimage -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "${videoPath}"`;

  console.log(`[Video] Starting FFmpeg rendering for ${videoFileName}...`);
  const startTime = Date.now();

  try {
    const { stderr } = await execAsync(command, { maxBuffer: 10 * 1024 * 1024 });
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    const stats = fs.statSync(videoPath);

    console.log(
      `[Video] FFmpeg render complete in ${elapsed}s. Output size: ${(stats.size / 1024).toFixed(1)} KB`
    );

    return {
      videoPath,
      videoFileName,
      fileSizeBytes: stats.size,
    };
  } catch (err: any) {
    console.error('[Video] FFmpeg render error:', err);
    throw new Error(`Video rendering failed: ${err?.message || 'FFmpeg process failed'}`);
  }
}
