import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { runChat, checkHealth } from './geminiCore.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '..', 'dist');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/api/gemini-health', async (req, res) => {
  const result = await checkHealth(process.env.GEMINI_API_KEY);
  res.json(result);
});

app.post('/api/chat', async (req, res) => {
  const { history, language } = req.body;

  if (!history || !Array.isArray(history)) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Invalid history payload' });
  }

  // Allow frontend to provide their own key, fallback to server env
  const dynamicApiKey = req.headers['x-api-key'] || process.env.GEMINI_API_KEY;

  try {
    const result = await runChat({ apiKey: dynamicApiKey, history, language });
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.code || 'SERVER_ERROR', message: error.message });
  }
});

// Serve the built React app (npm run build -> dist/) so this one service can
// host both the API and the frontend (used for Render/Railway-style deploys;
// Netlify instead uses netlify/functions + netlify.toml — see DEPLOYMENT.md).
app.use(express.static(distPath));

app.get(/^(?!\/api).*/, (req, res, next) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`[NHAA Server] API running on http://localhost:${PORT}`);
});
