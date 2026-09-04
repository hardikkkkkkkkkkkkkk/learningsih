import { checkHealth } from '../../server/geminiCore.js';

export const handler = async (event) => {
  // Prefer a key supplied by the app, then fall back to the secure Netlify env var.
  // This lets the UI's API-key test the exact key that chat will use.
  const headers = event.headers || {};
  const apiKey = headers['x-api-key'] || headers['X-API-Key'] || process.env.GEMINI_API_KEY;

  try {
    const result = await checkHealth(apiKey);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        geminiConfigured: !!apiKey,
        connection: 'error',
        errorCode: error.code || 'SERVER_ERROR',
        errorMessage: error.message || 'Unknown Gemini error',
      }),
    };
  }
};
