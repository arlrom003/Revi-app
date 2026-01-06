// routes/reviews.js
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../middleware/auth.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const getUserSupabaseClient = (token) => {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.replace('Bearer ', '').trim();
};

// POST /api/review-sessions
// Body shape expected from frontend:
// {
//   deck_id: 'uuid',
//   started_at: 'ISO string',
//   ended_at: 'ISO string',
//   card_ratings: [
//     { card_id: 'uuid', rating: 'easy' | 'medium' | 'hard' },
//     ...
//   ]
// }
router.post('/review-sessions', requireAuth, async (req, res) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const supabase = getUserSupabaseClient(token);

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'No user id in request' });
    }

    const { deck_id, started_at, ended_at, card_ratings } = req.body;

    if (!deck_id) {
      return res.status(400).json({ error: 'deck_id is required' });
    }

    const ratings = Array.isArray(card_ratings) ? card_ratings : [];

    const totalCards = ratings.length;
    const easyCount = ratings.filter((r) => r.rating === 'easy').length;
    const mediumCount = ratings.filter((r) => r.rating === 'medium').length;
    const hardCount = ratings.filter((r) => r.rating === 'hard').length;

    const durationSeconds =
      started_at && ended_at
        ? Math.floor(
            (new Date(ended_at).getTime() - new Date(started_at).getTime()) / 1000
          )
        : 0;

    console.log(
      'Saving review session for user',
      userId,
      'deck',
      deck_id
    );

    // Insert into review_sessions (matches your schema exactly)
    const { data: session, error: sessionError } = await supabase
      .from('review_sessions')
      .insert({
        deck_id,
        user_id: userId,
        started_at,
        ended_at,
        duration_seconds: durationSeconds,
        total_cards: totalCards,
        easy_count: easyCount,
        medium_count: mediumCount,
        hard_count: hardCount,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Insert review_session error:', sessionError);
      return res.status(500).json({
        error: sessionError.message || 'Failed to save review session',
      });
    }

    // Insert card_reviews (NOTE: this table has NO user_id)
    if (ratings.length > 0) {
      const cardReviewRows = ratings.map((r) => ({
        session_id: session.id,
        card_id: r.card_id,
        rating: r.rating,
        reviewed_at: new Date().toISOString(),
      }));

      const { error: cardReviewsError } = await supabase
        .from('card_reviews')
        .insert(cardReviewRows);

      if (cardReviewsError) {
        console.error('Insert card_reviews error:', cardReviewsError);
        // Do not fail the whole request; session itself is already saved
      }
    }

    return res.json({ success: true, session_id: session.id });
  } catch (error) {
    console.error('Save review error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to save review session',
    });
  }
});

// OPTIONAL: GET /api/history
// Returns recent review_sessions joined with decks.name for current user.
router.get('/history', requireAuth, async (req, res) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }
    const supabase = getUserSupabaseClient(token);

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'No user id in request' });
    }

    const { data, error } = await supabase
      .from('review_sessions')
      .select(
        `
        id,
        deck_id,
        user_id,
        started_at,
        ended_at,
        duration_seconds,
        total_cards,
        easy_count,
        medium_count,
        hard_count,
        decks ( name )
      `
      )
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('History error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.json(data || []);
  } catch (error) {
    console.error('History error:', error);
    return res.status(500).json({ error: error.message || 'Failed to load history' });
  }
});

export default router;
