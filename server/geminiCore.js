import { GoogleGenAI, Type } from '@google/genai';

export const MODEL_NAME = 'gemini-3.5-flash';

export const buildSystemPrompt = (language) => `
ROLE:
You are an emotionally intelligent, highly calm, and trauma-informed support assistant for NHAA (National Helpline Against Atrocities – 14566), India. You are NOT a doctor, therapist, or a generic AI chatbot. You act as a grounded human support officer.

GOALS:
1. Listen carefully and validate feelings first.
2. Identify safety concerns immediately.
3. Provide practical, grounded next steps when appropriate.
4. Assist human operators by providing internal safety and emotion signals.

LIMITS & RULES:
- NEVER diagnose. Use phrases like "signs of elevated distress" instead of clinical labels (e.g., PTSD, anxiety disorder, depression).
- NEVER pretend to have human feelings ("I know how you feel"). Instead say: "I can hear how painful this is."
- NEVER force positivity ("Stay positive!", "Everything happens for a reason"). Acknowledge reality: "That sounds genuinely difficult."
- NEVER invent memories. Rely strictly on the conversation history.
- Do NOT interrogate. Ask one useful, open question at a time.
- Match response length to the user. Keep it brief if they are overwhelmed.
- Support natural language, Hinglish, informal spelling, and messy messages (e.g., "bhai dimag kharab ho raha hai").
- If the user indicates immediate danger, self-harm, or active violence, STOP normal conversation. Switch to calm safety-focused response and recommend human intervention (e.g., 112, 1091, 181, iCall 9152987821). Never claim you called the police yourself.
- Give the user control: "We can talk about what happened, work out what to do next, or just stay with what's bothering you for a bit."
- Do NOT be robotic. Vary your responses. Don't always start with "I understand" or "I'm sorry".

RESPONSE PIPELINE:
Internally analyze the user's emotion, meaning, and safety BEFORE generating your response message. Fill out the structured JSON object accordingly.

LANGUAGE:
You must reply primarily in ${language === 'hi' ? 'Hindi/Hinglish' : 'English'}, matching the user's tone.
`;

export const responseSchema = {
  type: Type.OBJECT,
  properties: {
    message: {
      type: Type.STRING,
      description: "The actual conversational response shown to the user. Must be empathetic, non-diagnostic, and helpful."
    },
    intent: {
      type: Type.STRING,
      enum: ["support", "clarify", "safety_check", "practical_help", "escalation"],
      description: "The primary conversational intent of your message."
    },
    emotionSignals: {
      type: Type.OBJECT,
      properties: {
        fear: { type: Type.INTEGER, description: "0-10 scale" },
        anxiety: { type: Type.INTEGER, description: "0-10 scale" },
        distress: { type: Type.INTEGER, description: "0-10 scale" },
        sadness: { type: Type.INTEGER, description: "0-10 scale" }
      }
    },
    safety: {
      type: Type.OBJECT,
      properties: {
        level: { type: Type.STRING, enum: ["none", "elevated", "urgent", "critical"] },
        immediateDanger: { type: Type.BOOLEAN },
        humanReviewRecommended: { type: Type.BOOLEAN }
      }
    }
  },
  required: ["message", "intent", "emotionSignals", "safety"]
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function classifyError(error) {
  if (error.status === 401 || error.status === 403) return 'AUTHENTICATION_ERROR';
  if (error.status === 429) return 'QUOTA_EXCEEDED';
  if (error.status === 404) return 'MODEL_NOT_FOUND';
  if (error.status === 503) return 'OVERLOADED';
  return 'SERVER_ERROR';
}

export async function checkHealth(apiKey) {
  if (!apiKey) {
    return { geminiConfigured: false, error: 'GEMINI_API_KEY not found in server environment', connection: 'error' };
  }
  const ai = new GoogleGenAI({ apiKey });
  try {
    await ai.models.generateContent({
      model: MODEL_NAME,
      contents: "Respond with exactly: OK",
    });
    return { geminiConfigured: true, model: MODEL_NAME, connection: 'ok' };
  } catch (error) {
    return {
      geminiConfigured: true,
      model: MODEL_NAME,
      connection: 'error',
      errorCode: classifyError(error),
      errorMessage: error.message,
    };
  }
}

/**
 * Runs one chat turn against Gemini, with a small retry budget.
 * maxRetries/perAttemptTimeoutMs are tunable because Netlify's free-tier
 * synchronous functions hard-kill at 10s — we want to fail fast there,
 * whereas a normal long-lived Node server (Render/Railway/local) can afford
 * the original, more patient retry budget.
 */
export async function runChat({ apiKey, history, language, maxRetries = 2, perAttemptTimeoutMs = 15000 }) {
  if (!apiKey) {
    const err = new Error('API Key missing.');
    err.status = 401;
    err.code = 'AUTHENTICATION_ERROR';
    throw err;
  }

  const ai = new GoogleGenAI({ apiKey });
  const formattedHistory = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.parts[0].text }]
  }));

  let attempt = 0;
  let lastError = null;

  while (attempt <= maxRetries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), perAttemptTimeoutMs);

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: formattedHistory,
        config: {
          systemInstruction: buildSystemPrompt(language || 'en'),
          temperature: 0.75,
          topP: 0.9,
          maxOutputTokens: 800,
          responseMimeType: "application/json",
          responseSchema,
        },
      });

      clearTimeout(timeoutId);

      const text = response.text;
      if (!text || text.trim() === '') throw new Error('EMPTY_RESPONSE');

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        throw new Error('MALFORMED_RESPONSE');
      }

      if (!parsed.message || parsed.message.trim() === '') throw new Error('EMPTY_RESPONSE');

      return {
        message: parsed.message.trim(),
        intent: parsed.intent,
        emotionSignals: parsed.emotionSignals,
        safety: parsed.safety,
      };
    } catch (error) {
      lastError = error;
      const isTimeout = error.name === 'AbortError' || (error.message && error.message.includes('timeout'));
      const isOverloaded = error.status === 503 || error.status === 500;
      const isEmpty = error.message === 'EMPTY_RESPONSE' || error.message === 'MALFORMED_RESPONSE';

      if ((isTimeout || isOverloaded || isEmpty) && attempt < maxRetries) {
        attempt++;
        await delay(attempt * 800);
        continue;
      }

      const code = isTimeout ? 'TIMEOUT' : isEmpty ? error.message : classifyError(error);
      const err = new Error(error.message || code);
      err.status = error.status || 500;
      err.code = code;
      throw err;
    }
  }

  throw lastError;
}
