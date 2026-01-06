// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDecks,
  getAnalyticsOverview,
  bulkDeleteDecks,
} from "../services/api";

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
    const mins = Math.floor(minutes ?? 0);
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

  const getRatingPct = (counts) => {
    const e = counts?.easy ?? 0;
    const m = counts?.medium ?? 0;
    const h = counts?.hard ?? 0;
    const total = e + m + h;
    if (total === 0) {
      return { total: 0, easyPct: 0, medPct: 0, hardPct: 0 };
    }
    return {
      total,
      easyPct: Math.round((e / total) * 100),
      medPct: Math.round((m / total) * 100),
      hardPct: Math.round((h / total) * 100),
    };
  };

  const handleSelectDeck = (deckId) => {
    const next = new Set(selectedDecks);
    if (next.has(deckId)) next.delete(deckId);
    else next.add(deckId);
    setSelectedDecks(next);
  };

  const handleSelectAll = () => {
    if (selectedDecks.size === decks.length) {
      setSelectedDecks(new Set());
    } else {
      setSelectedDecks(new Set(decks.map((d) => d.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDecks.size === 0) return;

    const deckNames = decks
      .filter((d) => selectedDecks.has(d.id))
      .map((d) => d.name)
      .join(", ");

    if (
      !window.confirm(
        `Delete ${selectedDecks.size} deck(s)?\n\n${deckNames}\n\nThis cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      await bulkDeleteDecks(Array.from(selectedDecks));
      setDecks(decks.filter((d) => !selectedDecks.has(d.id)));
      setSelectedDecks(new Set());

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

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-indigo-500 text-lg font-medium">
          Loading dashboard…
        </div>
      </div>
    );
  }

  const pct = getRatingPct(analytics.overallRatings);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-sm">
            Track your study progress and jump back into your decks.
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

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border-l-4 border-indigo-500 p-5">
          <p className="text-xs text-gray-500 uppercase">Decks</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {analytics.totalDecks}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border-l-4 border-sky-500 p-5">
          <p className="text-xs text-gray-500 uppercase">Cards</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {analytics.totalCards}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border-l-4 border-emerald-500 p-5">
          <p className="text-xs text-gray-500 uppercase">Sessions</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {analytics.totalSessions}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border-l-4 border-amber-500 p-5">
          <p className="text-xs text-gray-500 uppercase">Study time</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {formatTime(analytics.totalStudyMinutes)}
          </p>
        </div>
      </div>

      {/* Ratings + last session */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">
              Overall ratings
            </h2>
            <p className="text-sm text-gray-600">
              How often you mark cards as easy, medium, or hard.
            </p>

            <div className="mt-4 space-y-3">
              {/* Easy */}
              <div className="flex items-center gap-3">
                <div className="w-20 text-sm text-emerald-700">Easy</div>
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-3 bg-emerald-500"
                    style={{ width: `${pct.easyPct}%` }}
                  />
                </div>
                <div className="w-12 text-right text-sm text-gray-700">
                  {pct.easyPct}%
                </div>
              </div>
              {/* Medium */}
              <div className="flex items-center gap-3">
                <div className="w-20 text-sm text-amber-700">Medium</div>
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-3 bg-amber-500"
                    style={{ width: `${pct.medPct}%` }}
                  />
                </div>
                <div className="w-12 text-right text-sm text-gray-700">
                  {pct.medPct}%
                </div>
              </div>
              {/* Hard */}
              <div className="flex items-center gap-3">
                <div className="w-20 text-sm text-rose-700">Hard</div>
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-3 bg-rose-500"
                    style={{ width: `${pct.hardPct}%` }}
                  />
                </div>
                <div className="w-12 text-right text-sm text-gray-700">
                  {pct.hardPct}%
                </div>
              </div>

              {pct.total === 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  No ratings yet. Start a review session to see your
                  performance.
                </p>
              )}
            </div>
          </div>

          <div className="w-full md:w-56 bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase mb-1">
              Last session
            </p>
            <p className="text-sm font-medium text-gray-800">
              {formatDateTime(analytics.lastSessionAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Deck list with bulk delete */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Your decks</h2>
          {decks.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                {selectedDecks.size === decks.length
                  ? "Clear selection"
                  : "Select all"}
              </button>
              <button
                type="button"
                disabled={selectedDecks.size === 0 || deleting}
                onClick={handleBulkDelete}
                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 disabled:opacity-60"
              >
                Delete selected
              </button>
            </div>
          )}
        </div>

        {decks.length === 0 ? (
          <p className="text-sm text-gray-600">
            No decks yet. Create your first one from the button above.
          </p>
        ) : (
          <div className="space-y-2">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                  checked={selectedDecks.has(deck.id)}
                  onChange={() => handleSelectDeck(deck.id)}
                />
                <button
                  type="button"
                  onClick={() => navigate(`/decks/${deck.id}`)}
                  className="flex-1 text-left"
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {deck.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(deck.cardCount ?? deck.cardsCount ?? 0) + " cards"}
                  </p>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
