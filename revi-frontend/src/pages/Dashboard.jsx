// src/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDecks, getAnalyticsOverview, bulkDeleteDecks } from "../services/api";

export default function Dashboard() {
  const [decks, setDecks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDecks, setSelectedDecks] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [decksData, overview] = await Promise.all([
          getDecks(),
          getAnalyticsOverview(),
        ]);

        setDecks(decksData.decks || []);
        setAnalytics({
          totalDecks: overview.totalDecks ?? 0,
          totalCards: overview.totalCards ?? 0,
          totalSessions: overview.totalSessions ?? 0,
          totalStudyMinutes: overview.totalStudyMinutes ?? 0,
          overallRatings: overview.overallRatings || {
            easy: 0,
            medium: 0,
            hard: 0,
          },
          lastSessionAt: overview.lastSessionAt || null,
        });
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatTime = (minutes) => {
    const mins = Math.floor(minutes);
    const hours = Math.floor(mins / 60);
    const rem = mins % 60;
    if (hours > 0) return `${hours}h ${rem}m`;
    return `${rem}m`;
  };

  const formatDateTime = (iso) => {
    if (!iso) return "No sessions yet";
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSelectDeck = (deckId) => {
    const newSelected = new Set(selectedDecks);
    if (newSelected.has(deckId)) {
      newSelected.delete(deckId);
    } else {
      newSelected.add(deckId);
    }
    setSelectedDecks(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedDecks.size === decks.length) {
      setSelectedDecks(new Set());
    } else {
      setSelectedDecks(new Set(decks.map(d => d.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDecks.size === 0) return;

    const deckNames = decks
      .filter(d => selectedDecks.has(d.id))
      .map(d => d.name)
      .join(", ");

    if (!window.confirm(
      `Are you sure you want to delete ${selectedDecks.size} deck(s)?\n\n${deckNames}\n\nThis action cannot be undone.`
    )) {
      return;
    }

    try {
      setDeleting(true);
      await bulkDeleteDecks(Array.from(selectedDecks));
      
      // Remove deleted decks from state
      setDecks(decks.filter(d => !selectedDecks.has(d.id)));
      setSelectedDecks(new Set());
      
      // Reload analytics
      const overview = await getAnalyticsOverview();
      setAnalytics({
        totalDecks: overview.totalDecks ?? 0,
        totalCards: overview.totalCards ?? 0,
        totalSessions: overview.totalSessions ?? 0,
        totalStudyMinutes: overview.totalStudyMinutes ?? 0,
        overallRatings: overview.overallRatings || {
          easy: 0,
          medium: 0,
          hard: 0,
        },
        lastSessionAt: overview.lastSessionAt || null,
      });
    } catch (err) {
      console.error("Error deleting decks:", err);
      alert("Failed to delete decks. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
          <p className="text-gray-600">
            Track your study progress and jump back into your decks.
          </p>
        </div>
        <button
          onClick={() => navigate("/new-deck")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + New Deck
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      {analytics && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-sm text-gray-500">Decks</p>
              <p className="text-2xl font-bold">{analytics.totalDecks}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-sm text-gray-500">Cards</p>
              <p className="text-2xl font-bold">{analytics.totalCards}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-sm text-gray-500">Study sessions</p>
              <p className="text-2xl font-bold">{analytics.totalSessions}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-sm text-gray-500">Study time</p>
              <p className="text-2xl font-bold">
                {formatTime(analytics.totalStudyMinutes)}
              </p>
            </div>
          </div>

          {/* Ratings + last session */}
          <div className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Overall ratings</p>
              <p className="text-gray-700 text-sm">
                How often you mark cards as easy, medium, or hard.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="text-green-600">
                Easy: {analytics.overallRatings.easy ?? 0}
              </span>
              <span className="text-yellow-600">
                Medium: {analytics.overallRatings.medium ?? 0}
              </span>
              <span className="text-red-600">
                Hard: {analytics.overallRatings.hard ?? 0}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Last session: {formatDateTime(analytics.lastSessionAt)}
            </div>
          </div>
        </>
      )}

      {/* Deck list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your decks</h2>
          {decks.length > 0 && (
            <div className="flex gap-2 items-center">
              {selectedDecks.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {deleting ? "Deleting..." : `Delete ${selectedDecks.size} deck(s)`}
                </button>
              )}
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
              >
                {selectedDecks.size === decks.length ? "Deselect All" : "Select All"}
              </button>
            </div>
          )}
        </div>

        {decks.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-700 mb-2">No decks yet.</p>
            <p className="text-gray-500 text-sm">
              Create your first one to start studying.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className={`flex items-center gap-3 bg-white rounded-xl shadow p-4 hover:bg-gray-50 ${
                  selectedDecks.has(deck.id) ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedDecks.has(deck.id)}
                  onChange={() => handleSelectDeck(deck.id)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={() => navigate(`/decks/${deck.id}`)}
                  className="flex-1 text-left"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{deck.name}</p>
                      {deck.description && (
                        <p className="text-sm text-gray-500">
                          {deck.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{deck.card_count ?? deck.cards_count ?? 0} cards</p>
                      {deck.last_reviewed_at && (
                        <p className="text-xs">
                          Last studied:{" "}
                          {new Date(
                            deck.last_reviewed_at
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
