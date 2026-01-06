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

// GET /api/decks - list all decks
router.get('/', requireAuth, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
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

// GET /api/decks/:id - single deck with cards
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === 'new') {
      return res.status(400).json({ error: 'Invalid deck id' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    const supabase = getUserSupabaseClient(token);
    
    // Get deck
    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (deckError) throw deckError;
    
    // Get cards
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .eq('deck_id', id)
      .order('created_at', { ascending: true });
    
    if (cardsError) throw cardsError;
    
    res.json({ deck, cards: cards || [] });
  } catch (error) {
    console.error('Get deck error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/decks - create deck
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Deck name is required' });
    }

    const supabase = getUserSupabaseClient(token);
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    console.log('Creating deck...');
    console.log('User ID:', user.id);
    console.log('Deck name:', name);
    
    // Insert deck with user_id
    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .insert({
        name,
        description: description || '',
        user_id: user.id  // CRITICAL: Set user_id for RLS
      })
      .select()
      .single();
    
    if (deckError) {
      console.error('Deck creation error:', deckError);
      throw deckError;
    }
    
    console.log('Deck created successfully:', deck.id);
    res.json({ deck });
  } catch (error) {
    console.error('Create deck error:', error);
    res.status(500).json({ error: error.message || 'Failed to create deck' });
  }
});

// DELETE /api/decks/:id - delete deck and cards
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    const supabase = getUserSupabaseClient(token);
    
    // Delete cards first (CASCADE might handle this, but be explicit)
    await supabase.from('cards').delete().eq('deck_id', id);
    
    // Delete deck
    const { error } = await supabase.from('decks').delete().eq('id', id);
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete deck error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
