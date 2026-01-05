import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../middleware/auth.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const getUserSupabaseClient = (token) => {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );
};

router.post('/review-sessions', requireAuth, async (req, res) => {
  try {
    const { deck_id, started_at, ended_at, card_ratings } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const supabase = getUserSupabaseClient(token);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    console.log('Saving review session...');
    
    const totalCards = card_ratings.length;
    const easyCount = card_ratings.filter(r => r.rating === 'easy').length;
    const mediumCount = card_ratings.filter(r => r.rating === 'medium').length;
    const hardCount = card_ratings.filter(r => r.rating === 'hard').length;
    
    const { data: session, error: sessionError } = await supabase
      .from('review_sessions')
      .insert({
        user_id: user.id,
        deck_id,
        started_at,
        ended_at,
        duration_seconds: Math.floor((new Date(ended_at) - new Date(started_at)) / 1000),
        total_cards: totalCards,
        easy_count: easyCount,
        medium_count: mediumCount,
        hard_count: hardCount
      })
      .select()
      .single();
    
    if (sessionError) throw sessionError;
    
    if (card_ratings && card_ratings.length > 0) {
      const attempts = card_ratings.map(rating => ({
        session_id: session.id,
        card_id: rating.card_id,
        rating: rating.rating
      }));
      
      const { error: attemptsError } = await supabase
        .from('card_reviews')
        .insert(attempts);
      
      if (attemptsError) throw attemptsError;
    }
    
    const { data: previousSession } = await supabase
      .from('review_sessions')
      .select('*')
      .eq('deck_id', deck_id)
      .eq('user_id', user.id)
      .neq('id', session.id)
      .order('started_at', { ascending: false })
      .limit(1)
      .single();
    
    let improvement = null;
    
    if (previousSession) {
      const currentRatings = {
        easy: Math.round((easyCount / totalCards) * 100),
        medium: Math.round((mediumCount / totalCards) * 100),
        hard: Math.round((hardCount / totalCards) * 100)
      };
      
      const prevTotal = previousSession.total_cards;
      const previousRatings = {
        easy: Math.round((previousSession.easy_count / prevTotal) * 100),
        medium: Math.round((previousSession.medium_count / prevTotal) * 100),
        hard: Math.round((previousSession.hard_count / prevTotal) * 100)
      };
      
      improvement = {
        current: currentRatings,
        previous: previousRatings,
        change: {
          easy: currentRatings.easy - previousRatings.easy,
          medium: currentRatings.medium - previousRatings.medium,
          hard: currentRatings.hard - previousRatings.hard
        }
      };
    } else {
      improvement = {
        current: {
          easy: Math.round((easyCount / totalCards) * 100),
          medium: Math.round((mediumCount / totalCards) * 100),
          hard: Math.round((hardCount / totalCards) * 100)
        },
        previous: null,
        change: null
      };
    }
    
    console.log('Review session saved successfully');
    res.json({ session, improvement });
    
  } catch (error) {
    console.error('Save review error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/history', requireAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const supabase = getUserSupabaseClient(token);
    
    const { data: sessions, error } = await supabase
      .from('review_sessions')
      .select('*, decks(name)')
      .order('started_at', { ascending: false });  // ← Changed from 'created_at'
    
    if (error) throw error;
    
    res.json({ sessions });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: error.message });
  }
});


export default router;
