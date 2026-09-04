/**
 * Gemini AI Client — NHAA SIH26093
 *
 * Production client for the Netlify Functions backend.
 * The API key is sent only to the backend and is never bundled by Vite.
 */

export function validateKeyFormat(key) {
  if (!key) return { valid: false, error: 'empty' };
  if (key.startsWith('AIzaSy') && key.length > 30) return { valid: true };
  if (key.startsWith('AQ.') && key.length > 30) return { valid: true };
  return { valid: false, error: 'format' };
}

export async function callGeminiAI(messages, language, apiKey, assessment) {
  const history = messages
    .filter(m => m.id !== 'init' && !m.id.startsWith('sys-err'))
    .map(m => ({
      role: m.sender === 'victim' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

  if (history.length === 0 || history[history.length - 1].role !== 'user') return null;

  if (assessment?.svi > 15) {
    const indicators = assessment.detectedIndicators?.map(i => i.name).join(', ') || 'none';
    const lastUser = [...history].reverse().find(m => m.role === 'user');
    if (lastUser) {
      lastUser.parts[0].text =
        `[OPERATOR NOTE - do not mention to complainant: SVI=${assessment.svi}/100, Risk=${assessment.riskLevel}, Signals: ${indicators}]\n\n${lastUser.parts[0].text}`;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9500);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'x-api-key': apiKey } : {})
      },
      body: JSON.stringify({ history, language }),
      signal: controller.signal
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const error = new Error(data.error || 'SERVER_ERROR');
      error.code = data.error || 'SERVER_ERROR';
      error.details = data.message || '';
      throw error;
    }

    if (!data.message || data.message.trim() === '') {
      throw Object.assign(new Error('EMPTY_RESPONSE'), { code: 'EMPTY_RESPONSE' });
    }

    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw Object.assign(new Error('TIMEOUT'), { code: 'TIMEOUT' });
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function checkGeminiHealth(apiKey = '') {
  try {
    const res = await fetch('/api/gemini-health', {
      headers: apiKey ? { 'x-api-key': apiKey } : {}
    });
    return await res.json();
  } catch {
    return { geminiConfigured: false, connection: 'network_error' };
  }
}
