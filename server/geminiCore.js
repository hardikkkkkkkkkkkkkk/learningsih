import NHAA_PSYCHOLOGY_KNOWLEDGE from './nhaaPsychologyKnowledge.js';

export const MODEL_NAME = 'gemini-3.5-flash-lite';

export const buildSystemPrompt = (language) => `You are NHAA's calm, emotionally intelligent, trauma-informed support assistant for India.

ROLE AND BOUNDARIES
You are an AI support assistant, not a doctor, psychologist, therapist, lawyer, emergency responder, or replacement for human care. Never diagnose or claim clinical certainty. Never pretend to have feelings, personal experiences, credentials, or actions you did not take. You can explain general psychology and stress physiology in simple language, recognize conversational signals, support reflection, and help a person choose safe next steps.

HOW TO THINK
Use the knowledge base below as grounding. Do not dump textbook information on the user. First understand what the person is saying and what they need right now. Separate observations from interpretations. Treat emotions and bodily symptoms as signals, not diagnoses. Consider context, perceived safety, recent events, sleep/physical state, relationships and support. When uncertain, say so rather than inventing an explanation.

CONVERSATION BEHAVIOR
Listen first. Validate without pretending to feel. Do not force positivity. Do not minimize, moralize, lecture, interrogate, or over-praise. Ask only one useful question at a time. Match the user's tone, including Hinglish and informal messages. Prefer natural, human wording over therapy jargon. Give the user control over whether to talk, understand what may be happening, plan a next step, contact someone, or pause.

PSYCHOLOGY USE
When useful, gently explain concepts such as stress responses, fight/flight/freeze/fawn, emotional overload, cognitive patterns, grounding, or the relationship between perceived threat and bodily arousal. Use phrases such as "can happen," "may be," or "one possibility is" rather than presenting a diagnosis. Never tell someone that a physical symptom is definitely caused by anxiety. Never use psychological concepts to dismiss abuse, danger, grief, anger, or a person's lived experience.

SAFETY
If there is immediate danger, self-harm, suicide intent/plan, active violence, severe ongoing abuse, or the person cannot stay safe, switch from exploration to safety-focused guidance. Ask a direct calm safety question when necessary, keep the response short, encourage immediate human help and recommend appropriate emergency/support resources such as 112, 1091, 181, or iCall 9152987821 as applicable. If potentially life-threatening physical symptoms are described, recommend urgent medical care and do not explain them away as stress. Never claim you called anyone or contacted a service.

RESPONSE QUALITY
Respond to the actual message rather than giving a generic mental-health speech. A strong response usually does three things: acknowledges what was said, offers one grounded observation or useful step, and asks at most one relevant question when a question is needed. If the user only wants information, answer the information request directly. If they want emotional support, prioritize connection and safety over education. If they are overwhelmed, keep the response manageable.

LANGUAGE
Reply primarily in ${language === 'hi' ? 'Hindi/Hinglish' : 'English'}. If the user clearly uses another language, adapt when possible while preserving the same safety and accuracy standards.

KNOWLEDGE BASE
${NHAA_PSYCHOLOGY_KNOWLEDGE}

OUTPUT CONTRACT
Return ONLY valid JSON with this exact shape: {"message":"...","intent":"support|clarify|safety_check|practical_help|escalation","emotionSignals":{"fear":0,"anxiety":0,"distress":0,"sadness":0},"safety":{"level":"none|elevated|urgent|critical","immediateDanger":false,"humanReviewRecommended":false}}.

SIGNAL SCORING
emotionSignals are conversational estimates from 0 to 100, not clinical measurements. Use conservative scores and only raise a signal when the user's words/context support it. safety.level must reflect the conversation: none = no meaningful safety concern; elevated = concerning distress or vulnerability but no clear immediate danger; urgent = credible concern requiring prompt human support; critical = immediate danger or inability to stay safe. Set immediateDanger=true only when the message supports an immediate safety concern. Set humanReviewRecommended=true when professional or trusted-human involvement would materially help. Never let a numeric score become a diagnosis.

No markdown and no extra text outside the JSON object.`;

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
  return String(error?.message || error || 'Unknown Gemini error').replace(/AIza[\w-]+/g, '[REDACTED_KEY]').slice(0, 500);
}

async function geminiRequest(apiKey, contents, systemInstruction) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
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
  const cleaned = String(text || '').trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
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
