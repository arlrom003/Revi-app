// backend/middleware/auth.js
import { supabase } from "../config/supabase.js";

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No authorization token provided" });
    }

    const token = authHeader.split(" ")[1];

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    console.log("Auth check - Header present:", !!authHeader);
    console.log("Token received, length:", token?.length || 0);
    console.log("Authenticated user:", user?.id);

    if (error || !user) {
      console.error("Auth error:", error);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Attach full user object; cards.js uses req.user.id
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
}
