import { checkHealth } from '../../server/geminiCore.js';

export const handler = async (event) => {
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
