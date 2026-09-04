import { checkHealth } from '../../server/geminiCore.js';

export const handler = async () => {
  const result = await checkHealth(process.env.GEMINI_API_KEY);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  };
};
