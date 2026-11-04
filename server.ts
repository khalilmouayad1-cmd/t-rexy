import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '5mb' }));

const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Helper for retrying Gemini API calls on high demand
async function generateContentWithRetry(model: string, contents: any, config: any, retries = 3) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await ai!.models.generateContent({ model, contents, config });
    } catch (err: any) {
      lastError = err;
      if (err.message?.includes('high demand') || err.status === 503) {
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }
      }
      throw err;
    }
  }
  throw lastError;
}

const TREX_SYSTEM_PROMPT = `
You are T-Rex, the smart, energetic, and wise green dinosaur mascot and productivity coach of "T-Rexy by MIGO-kh".
Your visual avatar: A vibrant neon-green dinosaur mascot with a friendly yet determined expression, sporting dorsal scales, a blue checkmark, a blue question mark, and a circle emblem.
You were created by MIGO-kh.

Your personality:
- Friendly, razor-sharp, encouraging, and action-oriented. You speak with a subtle dinosaur charm (occasional playful roaring like "ROAR! 🦖", "Let's stomp out procrastination!", "Small steps make a giant footprint!").
- Highly empathetic yet realistic. You never shame users for falling behind or postponing; instead, you break down psychological friction (perfectionism, overwhelm, lack of clarity) into tiny, manageable wins.
- You are a genuine productivity expert: skilled in time-blocking, the Eisenhower Matrix, Eat the Frog, Pomodoro, atomic habit loops (cue, craving, response, reward), and cognitive load reduction.
- Bilingual Mastery: You natively understand and communicate fluently in both English and Arabic (العربية). If the user asks in Arabic, respond in fluent, motivating, natural Arabic with dinosaur flair ("رووور! 🦖 هيا نسحق التسويف معاً"). If in English, reply in English.
- Always provide structured, practical, formatted markdown (bullet points, bold highlights, concise action steps).
`;

// 1. AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, context, language = 'en' } = req.body;

    if (!apiKey || !ai) {
      return res.status(500).json({
        error: 'Gemini API key is not configured. Please add GEMINI_API_KEY in your environment/secrets.',
      });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Format context for user's productivity state
    let contextStr = '';
    if (context) {
      contextStr = `
CURRENT USER PRODUCTIVITY STATE:
- Total Tasks: ${context.totalTasks || 0}
- Completed Today: ${context.completedToday || 0}
- Pending Tasks: ${JSON.stringify(context.pendingTasks || [])}
- Active Habits: ${JSON.stringify(context.habits || [])}
- Goals: ${JSON.stringify(context.goals || [])}
- Postponed Tasks Count: ${context.postponedCount || 0}
- Preferred Language: ${language === 'ar' ? 'Arabic' : 'English'}
`;
    }

    const conversationHistory = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Inject system context into first prompt or system instruction
    const response = await generateContentWithRetry('gemini-3.8-flash', conversationHistory, {
      systemInstruction: `${TREX_SYSTEM_PROMPT}\n${contextStr}`,
      temperature: 0.7,
    });

    const reply = response.text || "Roar! I'm here and ready to help you conquer your goals!";
    return res.json({ reply });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate response from T-Rex AI. Please try again.',
    });
  }
});

// 2. AI Productivity Insights Endpoint
app.post('/api/ai-insights', async (req, res) => {
  try {
    const { stats, language = 'en' } = req.body;

    if (!apiKey || !ai) {
      return res.status(500).json({
        error: 'Gemini API key is not configured. Please add GEMINI_API_KEY in your environment/secrets.',
      });
    }

    const prompt = `
Analyze the following user productivity data for "T-Rexy by MIGO-kh" and provide deep, constructive insights.
Respond in ${language === 'ar' ? 'fluent, warm Arabic' : 'English'}.

Data:
${JSON.stringify(stats, null, 2)}

Provide your response in JSON format with exactly this structure:
{
  "summary": "1-2 sentence high-level executive summary of this week's momentum.",
  "strengths": ["List of 2-3 genuine achievements or positive habit signals"],
  "postponementAnalysis": "Constructive analysis of why certain tasks were postponed or delayed, addressing psychological friction and offering a fresh angle.",
  "actionableTips": ["3 specific, actionable tactical adjustments for tomorrow and next week"],
  "motivationalQuote": "A punchy, mascot-themed inspiring motto from T-Rex to keep morale roaring high."
}
Return pure valid JSON without markdown fences.
`;

    const response = await generateContentWithRetry('gemini-3.8-flash', [{ role: 'user', parts: [{ text: prompt }] }], {
      systemInstruction: TREX_SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      temperature: 0.5,
    });

    const text = response.text || '{}';
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        summary: language === 'ar' ? 'أداء رائع ومستمر هذا الأسبوع!' : 'Solid momentum this week with great potential!',
        strengths: [language === 'ar' ? 'الالتزام بالعادات اليومية' : 'Consistent habit follow-through', language === 'ar' ? 'إنجاز المهام الأساسية' : 'Key priority focus'],
        postponementAnalysis: language === 'ar' ? 'المهام الكبيرة قد تسبب تردداً، تقسيمها يجعلها سهلة جداً' : 'Large complex tasks created friction. Splitting them into 15-minute chunks eliminates resistance.',
        actionableTips: [
          language === 'ar' ? 'ابدأ بأصعب مهمة في الصباح الباكر' : 'Tackle the heaviest dinosaur task first thing in the morning',
          language === 'ar' ? 'استخدم فترات راحة منتظمة' : 'Use 25-minute Pomodoro bursts with micro-walks',
          language === 'ar' ? 'احتفل بإتمام كل عادة صغيرة' : 'Log your habit streaks immediately for dopamine reinforcement'
        ],
        motivationalQuote: language === 'ar' ? 'رووور! كل خطوة صغيرة اليوم تصنع إنجازاً عملاقاً غداً!' : 'Roar! Every small step today builds a giant footprint tomorrow!'
      };
    }

    return res.json({ insights: data });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in /api/ai-insights:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate productivity insights. Please try again.',
    });
  }
});

// 3. AI Smart Day Planner
app.post('/api/plan-day', async (req, res) => {
  try {
    const { tasks, availableHours = 8, language = 'en' } = req.body;

    if (!apiKey || !ai) {
      return res.status(500).json({
        error: 'Gemini API key is not configured.',
      });
    }

    const prompt = `
Create an optimal, realistic time-blocked daily plan based on these pending tasks:
${JSON.stringify(tasks, null, 2)}
User has approximately ${availableHours} productive hours available.
Language: ${language === 'ar' ? 'Arabic' : 'English'}.

Return pure JSON with format:
{
  "theme": "A motivating theme for the day",
  "blocks": [
    {
      "time": "09:00 - 10:30",
      "taskTitle": "Title of task or focus block",
      "priority": "High" | "Medium" | "Low",
      "whyNow": "Brief explanation of why this fits here (energy levels, momentum, etc.)"
    }
  ],
  "dinosaurTip": "One sharp T-Rex coach tip for staying on track"
}
`;

    const response = await generateContentWithRetry('gemini-3.8-flash', [{ role: 'user', parts: [{ text: prompt }] }], {
      systemInstruction: TREX_SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      temperature: 0.6,
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ plan: parsed });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in /api/plan-day:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate plan. Please try again.' });
  }
});

// 4. AI Task Breakdown Endpoint
app.post('/api/breakdown-task', async (req, res) => {
  try {
    const { taskTitle, taskDescription, language = 'en' } = req.body;

    if (!apiKey || !ai) {
      return res.status(500).json({
        error: 'Gemini API key is not configured.',
      });
    }

    const prompt = `
Break down this task into 3 to 5 clear, concrete, bite-sized actionable steps that can each be done in 15-45 minutes.
Task: "${taskTitle}"
Description: "${taskDescription || ''}"
Language: ${language === 'ar' ? 'Arabic' : 'English'}.

Return pure JSON with format:
{
  "subtasks": [
    {
      "title": "Clear concrete subtask name",
      "estimatedMinutes": 25,
      "tip": "Quick execution tip"
    }
  ],
  "firstStepAdvice": "Encouraging tip to start the first step in under 2 minutes."
}
`;

    const response = await generateContentWithRetry('gemini-3.8-flash', [{ role: 'user', parts: [{ text: prompt }] }], {
      systemInstruction: TREX_SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      temperature: 0.5,
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ breakdown: parsed });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in /api/breakdown-task:', error);
    return res.status(500).json({ error: error?.message || 'Failed to breakdown task. Please try again.' });
  }
});


// Mount Vite or static serving
if (!isProduction) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true, port: Number(port), host: '0.0.0.0' },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(Number(port), '0.0.0.0', () => {
  console.log(`🦖 T-Rexy by MIGO-kh server running on http://0.0.0.0:${port}`);
});
