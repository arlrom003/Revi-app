// src/pages/DeckDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDeck, deleteDeck } from "../services/api";

export default function DeckDetail() {
  const { deckId } = useParams();
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDeck = async () => {
      try {
        setLoading(true);
        setError("");

        if (!deckId || deckId === "new") {
          setLoading(false);
          setError(
            deckId === "new"
              ? "This is a new deck. Use the New Deck page to create it."
              : "No deck id provided."
          );
          setDeck(null);
          setCards([]);
          return;
        }

        const data = await getDeck(deckId); // { deck, cards }
        if (!data || !data.deck) {
          setError("Deck not found.");
          setDeck(null);
          setCards([]);
          return;
        }

        setDeck(data.deck);
        setCards(Array.isArray(data.cards) ? data.cards : []);
      } catch (err) {
        console.error("Error loading deck", err);
        setError("Failed to load deck.");
        setDeck(null);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    loadDeck();
  }, [deckId]);

  const handleDeleteDeck = async () => {
    if (!deck) return;
    if (
      !window.confirm(
        `Delete "${deck.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      await deleteDeck(deckId);
      navigate("/dashboard");
    } catch (err) {
      console.error("Error deleting deck:", err);
      alert("Failed to delete deck. Please try again.");
      setDeleting(false);
    }
  };

  const handleStartReview = () => {
    if (cards.length === 0) {
      alert("This deck has no cards to review.");
      return;
    }
    navigate(`/review/${deckId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-indigo-500 text-lg font-medium">
          Loading deck…
        </div>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          ← Back
        </button>
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Deck not found
          </h1>
          <p className="text-sm text-red-600">
            {error || "This deck could not be loaded."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm text-indigo-600 hover:text-indigo-700"
      >
        ← Back
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{deck.name}</h1>
            {deck.description && (
              <p className="text-sm text-gray-600 mt-1">{deck.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {cards.length} card{cards.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleStartReview}
              disabled={cards.length === 0}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
            >
              Start review
            </button>
            <button
              type="button"
              onClick={handleDeleteDeck}
              disabled={deleting}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 disabled:opacity-60"
            >
              Delete deck
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Cards</h2>
          {cards.length === 0 ? (
            <p className="text-sm text-gray-600">
              No cards in this deck yet. Add cards, then start a review
              session.
            </p>
          ) : (
            <div className="space-y-2">
              {cards.map((card, idx) => (
                <div
                  key={card.id ?? idx}
                  className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 space-y-1"
                >
                  <p className="text-sm font-medium text-gray-900">
                    Q{idx + 1}. {card.question}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">A.</span> {card.answer}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
