import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../middleware/auth.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Create Supabase client with user's token
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

// Get all decks for user
router.get('/', requireAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const supabase = getUserSupabaseClient(token);
    
    const { data, error } = await supabase
      .from('decks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({ decks: data });
  } catch (error) {
    console.error('Get decks error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single deck with cards
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const supabase = getUserSupabaseClient(token);
    
    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (deckError) throw deckError;
    
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .eq('deck_id', req.params.id)
      .order('created_at', { ascending: true });
    
    if (cardsError) throw cardsError;
    
    res.json({ deck, cards });
  } catch (error) {
    console.error('Get deck error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create deck with cards
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, description, cards } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const supabase = getUserSupabaseClient(token);
    
    console.log('📝 Creating deck...');
    console.log('📚 Deck name:', name);
    
    // Get the authenticated user from the token
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ User not authenticated:', userError);
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    console.log('👤 Authenticated user:', user.id);
    
    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .insert({ 
        name, 
        description,
        user_id: user.id
      })
      .select()
      .single();
    
    if (deckError) {
      console.error('❌ Deck creation error:', deckError);
      throw deckError;
    }
    
    console.log('✅ Deck created successfully:', deck.id);
    
    if (cards && cards.length > 0) {
      const cardsToInsert = cards.map(card => ({
        deck_id: deck.id,
        question: card.question,
        answer: card.answer
      }));
      
      const { data: insertedCards, error: cardsError } = await supabase
        .from('cards')
        .insert(cardsToInsert)
        .select();
      
      if (cardsError) {
        console.error('❌ Cards error:', cardsError);
        throw cardsError;
      }
      
      console.log('✅ Cards inserted successfully');
      res.json({ deck, cards: insertedCards });
    } else {
      res.json({ deck, cards: [] });
    }
  } catch (error) {
    console.error('❌ Create deck error:', error);
    res.status(500).json({ error: error.message });
  }
});

export { router as default };
