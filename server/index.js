import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToDatabase, getDatabaseStatus } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    if (!getDatabaseStatus().connected) {
      await connectToDatabase();
    }

    return res.status(200).json({
      ok: true,
      service: 'api',
      database: getDatabaseStatus(),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : 'Database connection failed',
      database: getDatabaseStatus(),
    });
  }
});

app.listen(port, async () => {
  try {
    await connectToDatabase();
    console.log(`API server running on http://localhost:${port}`);
    console.log('MySQL connected');
  } catch (error) {
    console.error('MySQL initial connection failed:', error instanceof Error ? error.message : error);
    console.log(`API server running on http://localhost:${port} (database not connected)`);
  }
});
