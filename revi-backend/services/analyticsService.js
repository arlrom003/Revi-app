const supabase = require('../config/supabase');

class AnalyticsService {
  // Get user study statistics
  async getUserStats(userId) {
    try {
      // Get total cards studied
      const { data: totalCards, error: cardsError } = await supabase
        .from('study_sessions')
        .select('card_id')
        .eq('user_id', userId);

      if (cardsError) throw cardsError;

      // Get study streak
      const { data: sessions, error: sessionsError } = await supabase
        .from('study_sessions')
        .select('studied_at')
        .eq('user_id', userId)
        .order('studied_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      const streak = this.calculateStreak(sessions);

      // Get mastery distribution
      const { data: masteryData, error: masteryError } = await supabase
        .from('cards')
        .select('mastery_level')
        .eq('user_id', userId);

      if (masteryError) throw masteryError;

      const masteryDistribution = this.calculateMasteryDistribution(masteryData);

      return {
        totalCardsStudied: totalCards?.length || 0,
        studyStreak: streak,
        masteryDistribution
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  // Calculate study streak
  calculateStreak(sessions) {
    if (!sessions || sessions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sessions.length; i++) {
      const sessionDate = new Date(sessions[i].studied_at);
      sessionDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((today - sessionDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  }

  // Calculate mastery distribution
  calculateMasteryDistribution(cards) {
    const distribution = {
      learning: 0,
      reviewing: 0,
      mastered: 0
    };

    if (!cards) return distribution;

    cards.forEach(card => {
      if (card.mastery_level >= 0 && card.mastery_level <= 2) {
        distribution.learning++;
      } else if (card.mastery_level >= 3 && card.mastery_level <= 4) {
        distribution.reviewing++;
      } else if (card.mastery_level === 5) {
        distribution.mastered++;
      }
    });

    return distribution;
  }

  // Get study activity for a date range
  async getStudyActivity(userId, startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('studied_at, result')
        .eq('user_id', userId)
        .gte('studied_at', startDate)
        .lte('studied_at', endDate)
        .order('studied_at', { ascending: true });

      if (error) throw error;

      return this.aggregateActivityByDate(data);
    } catch (error) {
      console.error('Error fetching study activity:', error);
      throw error;
    }
  }

  // Aggregate activity by date
  aggregateActivityByDate(sessions) {
    const activityMap = {};

    sessions.forEach(session => {
      const date = new Date(session.studied_at).toISOString().split('T')[0];
      
      if (!activityMap[date]) {
        activityMap[date] = {
          date,
          cardsStudied: 0,
          correctAnswers: 0,
          incorrectAnswers: 0
        };
      }

      activityMap[date].cardsStudied++;
      
      if (session.result === 'correct') {
        activityMap[date].correctAnswers++;
      } else {
        activityMap[date].incorrectAnswers++;
      }
    });

    return Object.values(activityMap);
  }

  // Get deck performance
  async getDeckPerformance(userId, deckId) {
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('result')
        .eq('user_id', userId)
        .eq('deck_id', deckId);

      if (error) throw error;

      const totalSessions = data.length;
      const correctSessions = data.filter(s => s.result === 'correct').length;
      const accuracy = totalSessions > 0 ? (correctSessions / totalSessions) * 100 : 0;

      return {
        deckId,
        totalSessions,
        accuracy: Math.round(accuracy)
      };
    } catch (error) {
      console.error('Error fetching deck performance:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
