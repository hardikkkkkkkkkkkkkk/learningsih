import { GoogleGenAI, Type } from '@google/genai';

// Stable GA model designed for fast, high-volume requests.
export const MODEL_NAME = 'gemini-3.5-flash-lite';

export const buildSystemPrompt = (language) => `You are NHAA's calm, emotionally intelligent, trauma-informed support assistant for India. You are not a doctor or therapist. Listen first, validate without pretending to feel, never diagnose, never force positivity, and ask only one useful question at a time. Match the user's tone, including Hinglish and informal messages. If there is immediate danger, self-harm, or active violence, switch to safety-focused guidance and recommend human intervention such as 112, 1091, 181, or iCall 9152987821. Never claim you called anyone. Give the user control over whether to talk, plan next steps, or pause. Reply primarily in ${language === 'hi' ? 'Hindi/Hinglish' : 'English'} and sound natural, warm, and human. Return the requested structured response.`;

export const responseSchema = {
  type: Type.OBJECT,
  properties: {
    message: { type: Type.STRING },
    intent: { type: Type.STRING, enum: ['support','clarify','safety_check','practical_help','escalation'] },
    emotionSignals: {
      type: Type.OBJECT,
      properties: {
        fear: { type: Type.INTEGER }, anxiety: { type: Type.INTEGER },
        distress: { type: Type.INTEGER }, sadness: { type: Type.INTEGER }
      },
      required: ['fear','anxiety','distress','sadness']
    },
    safety: {
      type: Type.OBJECT,
      properties: {
        level: { type: Type.STRING, enum: ['none','elevated','urgent','critical'] },
        immediateDanger: { type: Type.BOOLEAN },
        humanReviewRecommended: { type: Type.BOOLEAN }
      },
      required: ['level','immediateDanger','humanReviewRecommended']
    }
  },
  required: ['message','intent','emotionSignals','safety']
};

function classifyError(error) {
  const status = Number(error?.status || 0);
  const message = String(error?.message || error || '').toLowerCase();
  if (status === 401 || status === 403 || message.includes('api key') || message.includes('permission_denied') || message.includes('unauthenticated')) return 'AUTHENTICATION_ERROR';
  if (status === 429 || message.includes('resource_exhausted') || message.includes('quota') || message.includes('rate limit')) return 'QUOTA_EXCEEDED';
  if (status === 400 || message.includes('invalid argument') || message.includes('invalid_argument')) return 'INVALID_REQUEST';
  if (status === 404 || message.includes('not found')) return 'MODEL_NOT_FOUND';
  if (status === 503 || message.includes('overloaded')) return 'OVERLOADED';
  if (message.includes('timeout') || message.includes('timed out')) return 'TIMEOUT';
  return 'SERVER_ERROR';
}

const timeout = (promise, ms) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(Object.assign(new Error('Gemini request timed out'), { code: 'TIMEOUT' })), ms))
]);

export async function checkHealth(apiKey) {
  if (!apiKey) return { geminiConfigured: false, connection: 'error', errorCode: 'AUTHENTICATION_ERROR', errorMessage: 'No Gemini API key was supplied.' };
  const ai = new GoogleGenAI({ apiKey });
  try {
    await timeout(ai.models.generateContent({ model: MODEL_NAME, contents: 'Reply with OK.' }), 4500);
    return { geminiConfigured: true, model: MODEL_NAME, connection: 'ok' };
  } catch (error) {
    return { geminiConfigured: true, model: MODEL_NAME, connection: 'error', errorCode: classifyError(error), errorMessage: error.message };
  }
}

export async function runChat({ apiKey, history, language, maxRetries = 1 }) {
  if (!apiKey) {
    const err = new Error('API Key missing. Add GEMINI_API_KEY in Netlify or enter a key in the app.');
    err.status = 401; err.code = 'AUTHENTICATION_ERROR'; throw err;
  }

  const ai = new GoogleGenAI({ apiKey });
  const formattedHistory = history.map(msg => ({ role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.parts?.[0]?.text || '' }] }));

  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const response = await timeout(ai.models.generateContent({
        model: MODEL_NAME,
        contents: formattedHistory,
        config: {
          systemInstruction: buildSystemPrompt(language || 'en'),
          maxOutputTokens: 500,
          responseMimeType: 'application/json',
          responseSchema
        }
      }), 4200);

      const text = response.text?.trim();
      if (!text) throw new Error('EMPTY_RESPONSE');
      const parsed = JSON.parse(text);
      if (!parsed.message?.trim()) throw new Error('EMPTY_RESPONSE');
      return parsed;
    } catch (error) {
      const code = classifyError(error);
      const transient = ['SERVER_ERROR','OVERLOADED','TIMEOUT'].includes(code) || ['EMPTY_RESPONSE','MALFORMED_RESPONSE'].includes(error.message);
      if (transient && attempt < maxRetries) { attempt++; await new Promise(r => setTimeout(r, 200)); continue; }
      const finalCode = ['EMPTY_RESPONSE','MALFORMED_RESPONSE'].includes(error.message) ? error.message : code;
      const err = new Error(error.message || finalCode);
      err.code = finalCode;
      err.status = error.status || (finalCode === 'AUTHENTICATION_ERROR' ? 401 : finalCode === 'QUOTA_EXCEEDED' ? 429 : finalCode === 'INVALID_REQUEST' ? 400 : 500);
      throw err;
    }
  }
}
