// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import uploadRoutes from "./routes/upload.js";
import deckRoutes from "./routes/decks.js";
import cardRoutes from "./routes/cards.js";
import reviewRoutes from "./routes/reviews.js";
import analyticsRoutes from "./routes/analytics.js";
import accountRoutes from "./routes/account.js";



dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://10.0.2.2:5173",
      "http://10.0.2.2:3000",
      "https://revi-app.onrender.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-User-Id"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Revi API is running!" });
});

// ROUTES
app.use("/api", uploadRoutes);      // /api/upload-file, /api/generate-flashcards
app.use("/api/decks", deckRoutes);  // /api/decks/*
app.use("/api", cardRoutes);        // /api/cards
app.use("/api", reviewRoutes);      // /api/review-sessions
app.use("/api", analyticsRoutes);   // /api/analytics/*
app.use("/api", accountRoutes); // DELETE /api/account


// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found", path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ error: err.message || "Something went wrong!" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
