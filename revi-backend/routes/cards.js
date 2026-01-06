import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Add card to deck
router.post('/cards', async (req, res) => {
  try {
    const { deck_id, question, answer } = req.body;
    
    const { data, error } = await supabase
      .from('cards')
      .insert({ deck_id, question, answer })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ card: data });
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update card
router.put('/cards/:id', requireAuth, async (req, res) => {
  try {
    const { question, answer } = req.body;
    
    const { data, error } = await supabase
      .from('cards')
      .update({ question, answer, updated_at: new Date() })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ card: data });
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete card
router.delete('/cards/:id', requireAuth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
