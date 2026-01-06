import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/overview - THIS IS THE KEY ROUTE FOR DASHBOARD
router.get('/overview', requireAuth, async (req, res) => {
  try {
    console.log('📊 Overview endpoint hit for user:', req.user.id);
    
    // DEBUG: See ALL decks in database
    const { data: allDecks, error: allDecksError } = await supabase
      .from('decks')
      .select('id, name, user_id')
      .limit(10);
    
    console.log('🔍 DEBUG - ALL decks in database:');
    allDecks?.forEach(d => {
      console.log(`   Deck: "${d.name}" | user_id: ${d.user_id}`);
    });
    console.log('🔍 Current logged-in user_id:', req.user.id);
    console.log('🔍 User IDs match?', allDecks?.some(d => d.user_id === req.user.id));
    
    // Get user's decks
    const { data: decks, error: decksError } = await supabase
      .from('decks')
      .select('id')
      .eq('user_id', req.user.id);

    if (decksError) {
      console.error('Decks error:', decksError);
      throw decksError;
    }

    console.log('📦 Found', decks?.length || 0, 'decks for this user');

    const deckIds = decks?.map(d => d.id) || [];

    // Get total cards count
    const { count: totalCards, error: cardsError } = await supabase
      .from('cards')
      .select('id', { count: 'exact', head: true })
      .in('deck_id', deckIds);

    if (cardsError) {
      console.error('Cards error:', cardsError);
      throw cardsError;
    }

    console.log('🃏 Found', totalCards || 0, 'cards');

    // Get review sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('review_sessions')
      .select('*')
      .eq('user_id', req.user.id);

    if (sessionsError) {
      console.error('Sessions error:', sessionsError);
      throw sessionsError;
    }

    console.log('📝 Found', sessions?.length || 0, 'sessions');

    const totalSessions = sessions?.length || 0;
    const totalStudyMinutes = Math.round(
      (sessions?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0) / 60
    );

    // Calculate ratings
    let totalEasy = 0, totalMedium = 0, totalHard = 0;
    sessions?.forEach(s => {
      totalEasy += s.easy_count || 0;
      totalMedium += s.medium_count || 0;
      totalHard += s.hard_count || 0;
    });

    const overallRatings = {
      easy: totalEasy,
      medium: totalMedium,
      hard: totalHard,
    };

    // Get last session
    const { data: lastSession } = await supabase
      .from('review_sessions')
      .select('ended_at')
      .eq('user_id', req.user.id)
      .order('ended_at', { ascending: false })
      .limit(1)
      .single();

    const result = {
      totalDecks: decks?.length || 0,
      totalCards: totalCards || 0,
      totalSessions,
      totalStudyMinutes,
      overallRatings,
      lastSessionAt: lastSession?.ended_at || null,
    };

    console.log('✅ Returning overview data:', result);
    res.json(result);
  } catch (error) {
    console.error('❌ Overview error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dashboard
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const { data: decks } = await supabase
      .from('decks')
      .select('id, name')
      .eq('user_id', req.user.id);

    const deckIds = decks?.map(d => d.id) || [];

    const { count: totalCards } = await supabase
      .from('cards')
      .select('id', { count: 'exact', head: true })
      .in('deck_id', deckIds);

    const { data: sessions } = await supabase
      .from('review_sessions')
      .select('*')
      .eq('user_id', req.user.id);

    const totalAttempts = sessions?.length || 0;
    const totalStudyTime = sessions?.reduce(
      (sum, s) => sum + (s.duration_seconds || 0),
      0
    ) || 0;

    let totalEasy = 0, totalMedium = 0, totalHard = 0;
    sessions?.forEach(s => {
      totalEasy += s.easy_count || 0;
      totalMedium += s.medium_count || 0;
      totalHard += s.hard_count || 0;
    });

    const totalRatings = totalEasy + totalMedium + totalHard;
    const overallRatings = {
      easy: totalRatings > 0 ? Math.round((totalEasy / totalRatings) * 100) : 0,
      medium: totalRatings > 0 ? Math.round((totalMedium / totalRatings) * 100) : 0,
      hard: totalRatings > 0 ? Math.round((totalHard / totalRatings) * 100) : 0,
    };

    const deckMastery = await Promise.all(
      (decks || []).map(async (deck) => {
        const { data: recentSessions } = await supabase
          .from('review_sessions')
          .select('easy_count, total_cards')
          .eq('deck_id', deck.id)
          .order('started_at', { ascending: false })
          .limit(3);

        if (!recentSessions || recentSessions.length === 0) {
          return { deck_id: deck.id, deck_name: deck.name, mastery: 0 };
        }

        const avgEasyPct =
          recentSessions.reduce((sum, s) => {
            return sum + (s.total_cards > 0 ? (s.easy_count / s.total_cards) * 100 : 0);
          }, 0) / recentSessions.length;

        return {
          deck_id: deck.id,
          deck_name: deck.name,
          mastery: Math.round(avgEasyPct),
        };
      })
    );

    res.json({
      totalDecks: decks?.length || 0,
      totalCards: totalCards || 0,
      totalAttempts,
      totalStudyTime,
      deckMastery,
      overallRatings,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/history
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

    res.json({ sessions: sessions || [] });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
