import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { generateVoiceover } from './server/tts.js';
import { generateSubtitleTimings, generateAssFile, segmentScriptIntoPhrases } from './server/subtitles.js';
import { analyzeScenes } from './server/sceneAnalysis.js';
import { renderFinalVideo } from './server/video.js';
import { GenerateVideoRequest, GenerateVideoResponse } from './server/types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(path.join(__dirname, 'dist', 'index.html'));

// Ensure storage directories exist
const OUTPUT_DIR = path.join(__dirname, 'data', 'videos');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

app.use(express.json({ limit: '10mb' }));

// Enable CORS for cross-origin frontend (e.g. Vercel)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Range');
  res.header('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

/**
 * Health check endpoint
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/**
 * POST /api/generate-video
 *
 * Full pipeline:
 * 1. Validate script & options
 * 2. Generate AI Voiceover (Gemini TTS with fallback)
 * 3. Segment script and generate ASS subtitles (Classic or Highlight)
 * 4. Generate Scene / B-roll suggestions (Gemini with semantic fallback)
 * 5. Render final MP4 using FFmpeg (black canvas + voiceover + burned subtitles)
 * 6. Return single unified MP4 video URL and scene list
 */
app.post('/api/generate-video', async (req: Request, res: Response) => {
  try {
    const { script, subtitleStyle = 'classic', voiceName = 'Kore' } = req.body as GenerateVideoRequest;

    if (!script || !script.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please enter or paste a script before generating video.',
      });
    }

    const trimmedScript = script.trim();
    const style = subtitleStyle === 'highlight' ? 'highlight' : 'classic';
    const videoId = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    console.log(`\n========================================`);
    console.log(`[Pipeline] Generating video: ${videoId}`);
    console.log(`[Pipeline] Style: ${style}, Voice: ${voiceName}`);
    console.log(`[Pipeline] Script length: ${trimmedScript.length} chars`);
    console.log(`========================================\n`);

    // Step 1: Voiceover Generation
    console.log('[Pipeline Step 1/4] Generating AI voiceover audio...');
    const ttsResult = await generateVoiceover(trimmedScript, OUTPUT_DIR, voiceName);
    const { audioPath, duration, engine } = ttsResult;

    // Step 2: Subtitle Generation & Timing
    console.log('[Pipeline Step 2/4] Generating subtitle timings and ASS file...');
    const phrases = segmentScriptIntoPhrases(trimmedScript);
    const subtitleItems = generateSubtitleTimings(phrases, duration);
    const { assPath } = generateAssFile(subtitleItems, style, OUTPUT_DIR);

    // Step 3: Scene / B-roll Analysis
    console.log('[Pipeline Step 3/4] Generating Scene & B-roll suggestions...');
    const scenes = await analyzeScenes(trimmedScript, duration);

    // Step 4: FFmpeg Video Rendering (Single Unified MP4)
    console.log('[Pipeline Step 4/4] Rendering black background MP4 with audio & burned-in subtitles...');
    const renderResult = await renderFinalVideo({
      audioPath,
      assPath,
      outputDir: OUTPUT_DIR,
      videoId,
    });

    // Cleanup intermediate audio and ass files
    try {
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      if (fs.existsSync(assPath)) fs.unlinkSync(assPath);
    } catch (cleanupErr) {
      console.warn('[Pipeline] Warning cleaning intermediate files:', cleanupErr);
    }

    const responsePayload: GenerateVideoResponse = {
      success: true,
      videoId,
      videoUrl: `/api/videos/${renderResult.videoFileName}`,
      downloadUrl: `/api/videos/${renderResult.videoFileName}?download=1`,
      duration: Number(duration.toFixed(2)),
      subtitleStyle: style,
      ttsEngine: engine === 'gemini' ? 'Google Gemini AI Voice' : 'Built-in Speech Synthesizer',
      scenes,
      subtitles: subtitleItems,
    };

    console.log(`[Pipeline] Success! Video ready: ${renderResult.videoFileName} (${(renderResult.fileSizeBytes / 1024).toFixed(1)} KB)`);
    return res.json(responsePayload);
  } catch (err: any) {
    console.error('[Pipeline Error]:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to generate video. Please try again.',
    });
  }
});

/**
 * GET /api/videos/:fileName
 * Streams the generated MP4 file with HTTP 206 Partial Content (Range) support.
 * This guarantees seamless playback, pausing, seeking, and scrubbing in HTML5 video players.
 */
app.get('/api/videos/:fileName', (req: Request, res: Response) => {
  const fileName = path.basename(req.params.fileName);
  const filePath = path.join(OUTPUT_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Video file not found' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (req.query.download === '1') {
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  }

  if (range) {
    // Parse Range header e.g. "bytes=0-1024"
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;

    const fileStream = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, head);
    fileStream.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// Mount Vite or static server
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
