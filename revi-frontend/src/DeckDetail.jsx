import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDeck } from "./services/api";

export default function DeckDetail() {
  const { deckId } = useParams();
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadDeck = async () => {
      try {
        setLoading(true);
        setError("");

        // Don’t fetch when navigating to /decks/new
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

        const data = await getDeck(deckId); // expects { deck, cards } from backend
        if (!data || !data.deck) {
          setError("Deck not found");
          setDeck(null);
          setCards([]);
          return;
        }

        setDeck(data.deck);
        setCards(Array.isArray(data.cards) ? data.cards : []);
      } catch (err) {
        console.error("Error loading deck", err);
        setError("Failed to load deck");
        setDeck(null);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    loadDeck();
  }, [deckId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading deck...</div>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-blue-600 mb-4"
        >
          Back
        </button>
        <h1 className="text-2xl font-bold mb-2">Deck</h1>
        <p className="text-red-500">{error || "This deck could not be loaded."}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-blue-600 mb-2"
      >
        Back
      </button>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">{deck.name}</h1>
            <p className="text-gray-600">{deck.description}</p>
          </div>
        </div>

        <div className="mt-4 mb-6 border-t pt-4">
          <h2 className="text-xl font-semibold mb-2">Cards</h2>
          {cards.length === 0 ? (
            <p className="text-gray-500">
              No cards in this deck yet. Use the review or edit flows you already set up.
            </p>
          ) : (
            <div className="space-y-3">
              {cards.map((card, idx) => (
                <div
                  key={card.id ?? idx}
                  className="border rounded-lg p-3 bg-gray-50 flex flex-col gap-1"
                >
                  <div className="font-semibold text-gray-800">
                    Q{idx + 1}. {card.question}
                  </div>
                  <div className="text-gray-700">A. {card.answer}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
