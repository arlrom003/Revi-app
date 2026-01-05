import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    // Get all user's decks
    const { data: decks } = await supabase
      .from('decks')
      .select('id, name')
      .eq('user_id', req.user.id);
    
    const deckIds = decks.map(d => d.id);
    
    // Count total cards
    const { count: totalCards } = await supabase
      .from('cards')
      .select('id', { count: 'exact', head: true })
      .in('deck_id', deckIds);
    
    // Get all sessions
    const { data: sessions } = await supabase
      .from('review_sessions')
      .select('*')
      .eq('user_id', req.user.id);
    
    const totalAttempts = sessions.length;
    const totalStudyTime = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
    
    // Overall ratings
    let totalEasy = 0, totalMedium = 0, totalHard = 0;
    sessions.forEach(s => {
      totalEasy += s.easy_count;
      totalMedium += s.medium_count;
      totalHard += s.hard_count;
    });
    
    const totalRatings = totalEasy + totalMedium + totalHard;
    const overallRatings = {
      easy: totalRatings > 0 ? Math.round((totalEasy / totalRatings) * 100) : 0,
      medium: totalRatings > 0 ? Math.round((totalMedium / totalRatings) * 100) : 0,
      hard: totalRatings > 0 ? Math.round((totalHard / totalRatings) * 100) : 0
    };
    
    // Mastery per deck
    const deckMastery = await Promise.all(
      decks.map(async (deck) => {
        const { data: recentSessions } = await supabase
          .from('review_sessions')
          .select('easy_count, total_cards')
          .eq('deck_id', deck.id)
          .order('started_at', { ascending: false })
          .limit(3);
        
        if (recentSessions.length === 0) {
          return { deck_id: deck.id, deck_name: deck.name, mastery: 0 };
        }
        
        const avgEasyPct = recentSessions.reduce((sum, s) => {
          return sum + (s.total_cards > 0 ? (s.easy_count / s.total_cards) * 100 : 0);
        }, 0) / recentSessions.length;
        
        return {
          deck_id: deck.id,
          deck_name: deck.name,
          mastery: Math.round(avgEasyPct)
        };
      })
    );
    
    res.json({
      totalDecks: decks.length,
      totalCards,
      totalAttempts,
      totalStudyTime,
      deckMastery,
      overallRatings
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/history', requireAuth, async (req, res) => {
  try {
    const { data: sessions } = await supabase
      .from('review_sessions')
      .select(`
        *,
        decks (name)
      `)
      .eq('user_id', req.user.id)
      .order('started_at', { ascending: false });
    
    res.json({ sessions });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
