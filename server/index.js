import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getCollection, connectToDatabase } from './db.js';

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await connectToDatabase();
    res.json({ ok: true, database: 'connected' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database unavailable';
    res.status(500).json({ ok: false, database: 'disconnected', error: message });
  }
});

app.get('/api/reviews', async (_req, res) => {
  try {
    const reviews = await getCollection('reviews')
      .find({}, { projection: { code: 0 } })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    res.json({ ok: true, data: reviews });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch reviews';
    res.status(500).json({ ok: false, error: message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { language, focusAreas, code, summary } = req.body || {};

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ ok: false, error: 'code is required' });
    }

    const document = {
      language: typeof language === 'string' ? language : 'unknown',
      focusAreas: Array.isArray(focusAreas) ? focusAreas : [],
      summary: typeof summary === 'string' ? summary : '',
      code,
      createdAt: new Date(),
    };

    const result = await (await getCollection('reviews')).insertOne(document);
    return res.status(201).json({ ok: true, id: result.insertedId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save review';
    return res.status(500).json({ ok: false, error: message });
  }
});

app.listen(port, () => {
  console.log(`Mongo API server running on http://localhost:${port}`);
});
