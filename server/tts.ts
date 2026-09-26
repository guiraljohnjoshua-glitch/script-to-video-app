import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { GoogleGenAI } from '@google/genai';

const execAsync = promisify(exec);

export interface TTSResult {
  audioPath: string;
  duration: number;
  engine: 'gemini' | 'flite';
}

/**
 * Probes the exact duration of an audio file using ffprobe.
 */
export async function getAudioDuration(filePath: string): Promise<number> {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
    );
    const duration = parseFloat(stdout.trim());
    if (!isNaN(duration) && duration > 0) {
      return duration;
    }
  } catch (err) {
    console.warn('[TTS] ffprobe duration check warning:', err);
  }
  // Fallback: estimate from file size if needed (e.g. 16-bit 24kHz mono is 48000 bytes/sec)
  const stats = fs.statSync(filePath);
  return Math.max(2, stats.size / 48000);
}

/**
 * Generates an AI voiceover from text.
 * 1. Primary: Google Gemini TTS model ('gemini-3.8-flash-lite-tts') via @google/genai.
 * 2. Fallback: FFmpeg built-in offline libflite speech synthesizer.
 */
export async function generateVoiceover(
  text: string,
  outputDir: string,
  voiceName: string = 'Kore'
): Promise<TTSResult> {
  const apiKey = process.env.TTS_API_KEY || process.env.GEMINI_API_KEY;
  const audioFileName = `voice_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.wav`;
  const audioPath = path.join(outputDir, audioFileName);

  // Attempt 1: Gemini TTS
  if (apiKey) {
    try {
      console.log(`[TTS] Attempting Gemini TTS generation with voice: ${voiceName}...`);
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text,
                speechMetadata: {
                  style: 'Clear, engaging, and professional narration',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                // Puck, Kore, Fenrir, Zephyr, Charon
                voiceName: voiceName || 'Kore',
              },
            },
          },
        },
      });

      const inlineAudio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (inlineAudio?.data) {
        const audioBuffer = Buffer.from(inlineAudio.data, 'base64');
        fs.writeFileSync(audioPath, audioBuffer);
        const duration = await getAudioDuration(audioPath);
        console.log(`[TTS] Gemini TTS successfully generated audio: ${duration.toFixed(2)}s`);
        return { audioPath, duration, engine: 'gemini' };
      }
    } catch (err: any) {
      console.warn('[TTS] Gemini TTS call failed or timed out. Falling back to local offline TTS:', err?.message || err);
    }
  } else {
    console.log('[TTS] No Gemini/TTS API key provided; using local offline TTS.');
  }

  // Attempt 2: Built-in local offline TTS via FFmpeg flite filter
  try {
    console.log('[TTS] Generating speech with FFmpeg flite engine...');
    const tempTextFile = path.join(outputDir, `text_${Date.now()}.txt`);
    fs.writeFileSync(tempTextFile, text, 'utf-8');

    // Run ffmpeg with flite filter reading from text file
    await execAsync(
      `ffmpeg -y -f lavfi -i "flite=textfile='${tempTextFile}'" -ar 24000 -ac 1 "${audioPath}"`
    );

    // Clean up temporary text file
    try {
      fs.unlinkSync(tempTextFile);
    } catch {}

    const duration = await getAudioDuration(audioPath);
    console.log(`[TTS] Flite TTS successfully generated audio: ${duration.toFixed(2)}s`);
    return { audioPath, duration, engine: 'flite' };
  } catch (fliteErr: any) {
    console.error('[TTS] Flite TTS failed:', fliteErr);
    throw new Error(`Failed to generate voiceover: ${fliteErr?.message || 'TTS failure'}`);
  }
}
