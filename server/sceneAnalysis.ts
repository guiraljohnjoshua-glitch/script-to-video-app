import { GoogleGenAI, Type } from '@google/genai';
import { SceneSuggestion } from './types.js';

/**
 * Formats seconds into MM:SS format (e.g. 65 -> "01:05")
 */
function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * Intelligent semantic fallback scene builder based on script text and duration.
 */
function generateFallbackScenes(script: string, totalDuration: number): SceneSuggestion[] {
  const cleanScript = script.trim();
  const sentences = cleanScript.split(/(?<=[.!?])\s+/).filter(Boolean);
  const count = Math.min(4, Math.max(3, sentences.length));

  const lower = cleanScript.toLowerCase();
  const isBusiness = /automat|business|work|lead|custom|market|sale|process|manage/i.test(lower);
  const isTech = /code|software|ai|computer|app|data|tech|digital/i.test(lower);
  const isCreative = /art|design|video|music|story|create|photo/i.test(lower);

  const scenes: SceneSuggestion[] = [];
  const stepDuration = totalDuration / count;

  for (let i = 0; i < count; i++) {
    const startSec = Math.round(i * stepDuration);
    const endSec = i === count - 1 ? Math.round(totalDuration) : Math.round((i + 1) * stepDuration);
    const timeRange = `${formatTimestamp(startSec)} — ${formatTimestamp(endSec)}`;

    let title = '';
    let description = '';
    let suggestedBroll = '';

    if (i === 0) {
      title = 'Introduction';
      description = sentences[0] ? sentences[0].slice(0, 90) : 'Hook and topic introduction';
      if (isBusiness || isTech) {
        suggestedBroll = 'Person working focused on a laptop in a modern brightly lit office';
      } else if (isCreative) {
        suggestedBroll = 'Close-up of hands sketching ideas and digital creative workspace';
      } else {
        suggestedBroll = 'Engaging speaker addressing camera or lifestyle context shot';
      }
    } else if (i === 1) {
      title = count === 3 ? 'Core Value & Workflow' : 'Problem / Key Challenge';
      description = sentences[1] ? sentences[1].slice(0, 90) : 'Explaining repetitive tasks and current bottlenecks';
      if (isBusiness) {
        suggestedBroll = 'Business workflow or automation screen showing time saved and task flows';
      } else if (isTech) {
        suggestedBroll = 'Code editor, cloud dashboard, and automated pipeline visualization';
      } else {
        suggestedBroll = 'Split screen showing disorganized tasks transitioning to structured flow';
      }
    } else if (i === 2 && count > 3) {
      title = 'Solution & Automation Tools';
      description = sentences[2] ? sentences[2].slice(0, 90) : 'Highlighting tools that automate customer communications';
      suggestedBroll = 'Customer communication dashboard with automated notifications and charts';
    } else {
      title = 'Conclusion & Strategic Impact';
      description = sentences[sentences.length - 1] ? sentences[sentences.length - 1].slice(0, 90) : 'Summary of long-term business and workflow benefits';
      if (isBusiness) {
        suggestedBroll = 'Business owner or successful team collaborating enthusiastically';
      } else {
        suggestedBroll = 'Confident professional smiling with positive outcome graphs';
      }
    }

    scenes.push({
      id: i + 1,
      timeRange,
      startTime: startSec,
      endTime: endSec,
      title,
      description,
      suggestedBroll,
    });
  }

  return scenes;
}

/**
 * Analyzes the script and generates contextual Scene and B-roll suggestions.
 * Uses Gemini API if available, with intelligent fallback.
 */
export async function analyzeScenes(
  script: string,
  totalDuration: number
): Promise<SceneSuggestion[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `Analyze this video script and segment it into 3 to 4 sequential visual scenes covering the full duration of ${totalDuration.toFixed(1)} seconds.
For each scene, output:
- startTime: number in seconds (starting from 0, ending at ${Math.round(totalDuration)})
- endTime: number in seconds
- title: concise 2-4 word scene title (e.g., "Introduction", "Workflow Challenges", "Automation Solution", "Conclusion")
- description: brief summary of what happens or is said
- suggestedBroll: clear, actionable visual suggestion for complementary B-roll footage (e.g., "Person working on a laptop", "Business workflow screen", "Successful business team")

Script:
"${script}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                startTime: { type: Type.NUMBER },
                endTime: { type: Type.NUMBER },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                suggestedBroll: { type: Type.STRING },
              },
              required: ['startTime', 'endTime', 'title', 'description', 'suggestedBroll'],
            },
          },
        },
      });

      const parsed = JSON.parse(response.text || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item, idx) => ({
          id: idx + 1,
          timeRange: `${formatTimestamp(item.startTime)} — ${formatTimestamp(item.endTime)}`,
          startTime: Number(item.startTime),
          endTime: Number(item.endTime),
          title: item.title,
          description: item.description,
          suggestedBroll: item.suggestedBroll,
        }));
      }
    } catch (err: any) {
      console.warn('[SceneAnalysis] Gemini scene analysis unavailable or timed out; using semantic fallback:', err?.message || err);
    }
  }

  // Fallback to high-quality heuristic scene generation
  return generateFallbackScenes(script, totalDuration);
}
