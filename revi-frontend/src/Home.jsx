import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDecks } from "./services/api";

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
        const data = await getDecks();          // backend returns { decks: [...] }
        const list = Array.isArray(data.decks) ? data.decks : [];
        setDecks(list);
      } catch (err) {
        console.error("Error loading decks", err);
        setError("Failed to load decks");
        setDecks([]);
      } finally {
        setLoading(false);
      }
    };

    loadDecks();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Home</h1>
        <p className="text-gray-600">
          Welcome back! Continue your studies.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">My Decks</h2>
          <button
            onClick={() => navigate("/decks/new")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create New
          </button>
        </div>

        {decks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              No decks yet. Create your first one!
            </p>
            <button
              onClick={() => navigate("/decks/new")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Create Your First Deck
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {decks.map((deck) => (
              <div
                key={deck.id}
                onClick={() => navigate(`/decks/${deck.id}`)}
                className="border-2 border-gray-200 rounded-xl p-5 cursor-pointer hover:border-blue-500 hover:shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {deck.name}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {deck.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
