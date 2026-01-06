// revi-backend/routes/account.js
import express from "express";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "../middleware/auth.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Admin Supabase client using service role key
const adminSupabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// DELETE /api/account - delete current user (requires DELETE confirmation)
router.delete("/account", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { confirmText } = req.body || {};
    if (confirmText !== "DELETE") {
      return res.status(400).json({ error: 'Confirmation text must be "DELETE"' });
    }

    const { error } = await adminSupabase.auth.admin.deleteUser(userId);
    if (error) {
      console.error("Delete user error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Delete account error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Failed to delete account" });
  }
});

export default router;
