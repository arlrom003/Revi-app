// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDecks } from "../services/api";

export default function Home() {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadDecks = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getDecks();
        const list = Array.isArray(data.decks) ? data.decks : [];
        setDecks(list);
      } catch (err) {
        console.error("Error loading decks", err);
        setError("Failed to load decks.");
        setDecks([]);
      } finally {
        setLoading(false);
      }
    };

    loadDecks();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-indigo-500 text-lg font-medium">
          Loading your decks…
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My decks</h1>
          <p className="text-gray-600 text-sm">
            Welcome back. Continue where you left off or create something new.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/new-deck")}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
        >
          + New deck
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {decks.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 p-8 text-center space-y-3">
          <div className="text-4xl">📚</div>
          <p className="text-gray-800 font-medium">
            You don’t have any decks yet.
          </p>
          <p className="text-gray-500 text-sm">
            Create your first deck to start studying with Revi.
          </p>
          <button
            type="button"
            onClick={() => navigate("/new-deck")}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            Create a deck
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {decks.map((deck) => (
            <button
              key={deck.id}
              type="button"
              onClick={() => navigate(`/decks/${deck.id}`)}
              className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-indigo-200 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {deck.name}
                  </h2>
                  {deck.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {deck.description}
                    </p>
                  )}
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-xs font-medium text-indigo-700">
                  {(deck.cardCount ?? deck.cardsCount ?? 0) + " cards"}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
