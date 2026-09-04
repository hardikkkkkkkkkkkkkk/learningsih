export const MODEL_NAME = 'gemini-3.5-flash-lite';

export const buildSystemPrompt = (language) => `You are NHAA's calm, emotionally intelligent, trauma-informed support assistant for India. You are not a doctor or therapist. Listen first, validate without pretending to feel, never diagnose, never force positivity, and ask only one useful question at a time. Match the user's tone, including Hinglish and informal messages. If there is immediate danger, self-harm, or active violence, switch to safety-focused guidance and recommend human intervention such as 112, 1091, 181, or iCall 9152987821. Never claim you called anyone. Give the user control over whether to talk, plan next steps, or pause. Reply primarily in ${language === 'hi' ? 'Hindi/Hinglish' : 'English'} and sound natural, warm, and human. Return ONLY valid JSON with this exact shape: {"message":"...","intent":"support|clarify|safety_check|practical_help|escalation","emotionSignals":{"fear":0,"anxiety":0,"distress":0,"sadness":0},"safety":{"level":"none|elevated|urgent|critical","immediateDanger":false,"humanReviewRecommended":false}}. No markdown and no extra text.`;

function classifyError(error) {
  const status = Number(error?.status || error?.statusCode || 0);
  const code = String(error?.code || '').toLowerCase();
  const message = String(error?.message || error || '').toLowerCase();
  if (status === 401 || status === 403 || code.includes('auth') || message.includes('api key') || message.includes('permission_denied') || message.includes('unauthenticated')) return 'AUTHENTICATION_ERROR';
  if (status === 429 || code.includes('quota') || message.includes('resource_exhausted') || message.includes('quota') || message.includes('rate limit')) return 'QUOTA_EXCEEDED';
  if (status === 400 || code.includes('invalid') || message.includes('invalid argument') || message.includes('invalid_argument')) return 'INVALID_REQUEST';
  if (status === 404 || code.includes('not_found') || message.includes('not found')) return 'MODEL_NOT_FOUND';
  if (status === 503 || code.includes('unavailable') || message.includes('overloaded')) return 'OVERLOADED';
  if (message.includes('timeout') || message.includes('timed out') || code === 'timeout') return 'TIMEOUT';
  return 'SERVER_ERROR';
}

function safeErrorDetails(error) {
  return String(error?.message || error || 'Unknown Gemini error').replace(/AIza[\\w-]+/g, '[REDACTED_KEY]').slice(0, 500);
}

async function geminiRequest(apiKey, contents, systemInstruction) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7500);
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: { maxOutputTokens: 500 }
      }),
      signal: controller.signal
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err = new Error(data?.error?.message || `Gemini HTTP ${response.status}`);
      err.status = response.status;
      err.code = data?.error?.status || data?.error?.code;
      throw err;
    }
    return data;
  } catch (error) {
    if (error?.name === 'AbortError') {
      const err = new Error('Gemini request timed out');
      err.code = 'TIMEOUT';
      throw err;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function checkHealth(apiKey) {
  if (!apiKey) return { geminiConfigured: false, connection: 'error', errorCode: 'AUTHENTICATION_ERROR', errorMessage: 'No Gemini API key was supplied.' };
  try {
    await geminiRequest(apiKey, [{ role: 'user', parts: [{ text: 'Reply with OK.' }] }], 'Reply briefly with OK.');
    return { geminiConfigured: true, model: MODEL_NAME, connection: 'ok' };
  } catch (error) {
    return { geminiConfigured: true, model: MODEL_NAME, connection: 'error', errorCode: classifyError(error), errorMessage: safeErrorDetails(error) };
  }
}

function parseModelJson(text) {
  const cleaned = String(text || '').trim().replace(/^```json\\s*/i, '').replace(/^```\\s*/i, '').replace(/\\s*```$/i, '').trim();
  try { return JSON.parse(cleaned); } catch {}
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try { return JSON.parse(cleaned.slice(start, end + 1)); } catch {}
  }
  throw Object.assign(new Error('MALFORMED_RESPONSE'), { code: 'MALFORMED_RESPONSE' });
}

function validateResult(parsed) {
  if (!parsed || typeof parsed.message !== 'string' || !parsed.message.trim()) throw Object.assign(new Error('EMPTY_RESPONSE'), { code: 'EMPTY_RESPONSE' });
  if (!parsed.intent) parsed.intent = 'support';
  if (!parsed.emotionSignals) parsed.emotionSignals = { fear: 0, anxiety: 0, distress: 0, sadness: 0 };
  if (!parsed.safety) parsed.safety = { level: 'none', immediateDanger: false, humanReviewRecommended: false };
  return parsed;
}

export async function runChat({ apiKey, history, language }) {
  if (!apiKey) {
    const err = new Error('API Key missing. Add GEMINI_API_KEY in Netlify or enter a key in the app.');
    err.status = 401;
    err.code = 'AUTHENTICATION_ERROR';
    throw err;
  }

  const formattedHistory = history
    .filter(msg => msg && typeof msg.parts?.[0]?.text === 'string' && msg.parts[0].text.trim())
    .map(msg => ({ role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.parts[0].text }] }));

  try {
    const data = await geminiRequest(apiKey, formattedHistory, buildSystemPrompt(language || 'en'));
    const text = data?.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('').trim();
    return validateResult(parseModelJson(text));
  } catch (error) {
    const code = ['EMPTY_RESPONSE', 'MALFORMED_RESPONSE'].includes(error?.code) ? error.code : classifyError(error);
    const err = new Error(safeErrorDetails(error));
    err.code = code;
    err.status = error?.status || (code === 'AUTHENTICATION_ERROR' ? 401 : code === 'QUOTA_EXCEEDED' ? 429 : code === 'INVALID_REQUEST' ? 400 : 500);
    throw err;
  }
}
