import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import uploadRoutes from './routes/upload.js';
import deckRoutes from './routes/decks.js';
import cardRoutes from './routes/cards.js';
import reviewRoutes from './routes/reviews.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: '🚂 Revi API is running!' });
});

app.use('/api', uploadRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api', cardRoutes);
app.use('/api', reviewRoutes);
app.use('/api', analyticsRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
