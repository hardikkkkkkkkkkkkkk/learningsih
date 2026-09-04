/**
 * Gemini AI Client — NHAA SIH26093
 *
 * Migrated to backend processing via /api/chat
 * No API key logic exists here anymore.
 */

export function validateKeyFormat(key) {
  if (!key) return { valid: false, error: 'empty' };
  if (key.startsWith('AIzaSy') && key.length > 30) return { valid: true };
  if (key.startsWith('AQ.') && key.length > 30) return { valid: true };
  return { valid: false, error: 'format' };
}

export async function callGeminiAI(messages, language, apiKey, assessment) {
  // Build conversation history
  const history = messages
    .filter(m => m.id !== 'init' && !m.id.startsWith('sys-err'))
    .map(m => ({
      role: m.sender === 'victim' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

  if (history.length === 0 || history[history.length - 1].role !== 'user') return null;

  // Silently inject triage context into the last user turn so Gemini has memory of the current state
  if (assessment?.svi > 15) {
    const indicators = assessment.detectedIndicators?.map(i => i.name).join(', ') || 'none';
    const lastUser = [...history].reverse().find(m => m.role === 'user');
    if (lastUser) {
      lastUser.parts[0].text =
        `[OPERATOR NOTE - do not mention to complainant: SVI=${assessment.svi}/100, Risk=${assessment.riskLevel}, Signals: ${indicators}]\n\n${lastUser.parts[0].text}`;
    }
  }

  // Use AbortController for fetch timeout (prevent infinite loading on the frontend)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 16000); // 16s frontend timeout (backend has 15s)

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': apiKey || ''
      },
      body: JSON.stringify({
        history,
        language
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'SERVER_ERROR');
    }

    if (!data.message || data.message.trim() === '') {
      throw new Error('EMPTY_RESPONSE');
    }

    // Return the full structured payload
    return data; 
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('TIMEOUT');
    }
    throw err;
  }
}

export async function checkGeminiHealth() {
  try {
    const res = await fetch('/api/gemini-health');
    const data = await res.json();
    return data;
  } catch (err) {
    return { geminiConfigured: false, connection: 'network_error' };
  }
}
