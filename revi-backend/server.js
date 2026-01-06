import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import uploadRoutes from './routes/upload.js';
import deckRoutes from './routes/decks.js';
import cardRoutes from './routes/cards.js';
import reviewRoutes from './routes/reviews.js';
import analyticsRoutes from './routes/analytics.js';
// ✅ REMOVED: import authJs from './routes/auth.js'; (file is empty)

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ MIDDLEWARE FIRST (correct order)
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://10.0.2.2:5173',    // Android emulator
    'http://10.0.2.2:3000',    // Android emulator
    'https://revi-app.onrender.com' // Production (if deployed)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ HEALTH CHECK
app.get('/', (req, res) => {
  res.json({ message: '🚂 Revi API is running!' });
});

// ✅ ROUTES (only once each)
app.use('/api', uploadRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api', cardRoutes);
app.use('/api', reviewRoutes);
app.use('/api', analyticsRoutes);

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ✅ ERROR HANDLER (last)
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Accessible from Android emulator at http://10.0.2.2:${PORT}`);
});
