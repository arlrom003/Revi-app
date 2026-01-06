// backend/routes/cards.js
import express from "express";
import { supabase } from "../config/supabase.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// POST /api/cards - Add card to deck
router.post("/cards", requireAuth, async (req, res) => {
  try {
    const { deckId, deck_id, question, answer } = req.body;

    // Support both camelCase and snake_case from frontend
    const finalDeckId = deckId || deck_id;

    if (!finalDeckId || !question || !answer) {
      return res.status(400).json({
        error: "deckId/deck_id, question, and answer are required",
      });
    }

    const userId = req.user.id;

    console.log("Creating card:", {
      deck_id: finalDeckId,
      user_id: userId,
      question,
      answer,
    });

    const { data, error } = await supabase
      .from("cards")
      .insert({
        deck_id: finalDeckId, // matches schema
        question,
        answer,
        user_id: userId, // required for RLS
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error creating card:", error);
      throw error;
    }

    console.log("✅ Card created successfully:", data.id);
    return res.json({ card: data });
  } catch (error) {
    console.error("Create card error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/cards/:id - Update card
router.put("/cards/:id", requireAuth, async (req, res) => {
  try {
    const { question, answer } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("cards")
      .update({
        question,
        answer,
        updated_at: new Date(),
      })
      .eq("id", req.params.id)
      .eq("user_id", userId) // only own cards
      .select()
      .single();

    if (error) throw error;

    return res.json({ card: data });
  } catch (error) {
    console.error("Update card error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/cards/:id - Delete card
router.delete("/cards/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const { error } = await supabase
      .from("cards")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", userId); // only own cards

    if (error) throw error;

    return res.json({ success: true });
  } catch (error) {
    console.error("Delete card error:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
