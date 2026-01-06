// src/pages/History.jsx
import { useEffect, useState } from "react";
import { getHistory } from "../services/api";

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getHistory(); // array from /api/history
        const list = Array.isArray(data) ? data : [];
        setSessions(list);
        if (list.length > 0) setSelected(list[0]);
      } catch (error) {
        console.error("Error loading history:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor((seconds ?? 0) / 60);
    const secs = (seconds ?? 0) % 60;
    return `${mins}m ${secs}s`;
  };

  const getTotals = (session) => {
    if (!session) return { easy: 0, medium: 0, hard: 0, total: 0 };
    const easy = session.easy_count ?? 0;
    const medium = session.medium_count ?? 0;
    const hard = session.hard_count ?? 0;
    const total = easy + medium + hard;
    return { easy, medium, hard, total };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-indigo-500 text-lg font-medium">
          Loading history…
        </div>
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Study history</h1>
          <p className="text-gray-600 text-sm">
            Review your past study sessions and track improvement over time.
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-2">
          <p className="text-gray-800 font-medium">
            No study sessions yet.
          </p>
          <p className="text-gray-500 text-sm">
            Complete a review session to see it appear here.
          </p>
        </div>
      </div>
    );
  }

  const { easy, medium, hard, total } = getTotals(selected);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Study history</h1>
          <p className="text-gray-600 text-sm">
            Tap a session to view its details and rating breakdown.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sessions list */}
        <div className="lg:col-span-2 space-y-3">
          {sessions.map((session) => {
            const isSelected = selected && selected.id === session.id;
            return (
              <button
                key={session.id}
                type="button"
                onClick={() => setSelected(session)}
                className={`w-full text-left flex justify-between items-center rounded-2xl border px-4 py-3 bg-white shadow-sm transition ${
                  isSelected
                    ? "border-indigo-500 ring-2 ring-indigo-100"
                    : "border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/40"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {session.deck_name || "Deck"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(session.started_at)} ·{" "}
                    {formatDuration(session.duration_seconds || 0)}
                  </p>
                </div>
                <div className="text-right text-xs space-y-0.5">
                  <p className="text-emerald-600">
                    Easy: {session.easy_count ?? 0}
                  </p>
                  <p className="text-amber-600">
                    Medium: {session.medium_count ?? 0}
                  </p>
                  <p className="text-rose-600">
                    Hard: {session.hard_count ?? 0}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected session details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Session details
          </h2>

          {selected ? (
            <>
              <div>
                <p className="font-semibold text-gray-900">
                  {selected.deck_name || "Deck"}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(selected.started_at)} ·{" "}
                  {formatDuration(selected.duration_seconds || 0)}
                </p>
              </div>

              {/* Simple stats “chart” */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="inline-block w-3 h-3 rounded-full bg-emerald-500" />
                  <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-2 bg-emerald-500"
                      style={{
                        width: `${
                          total ? Math.round((easy / total) * 100) : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-700 w-16 text-right">
                    {easy} ({total ? Math.round((easy / total) * 100) : 0}%)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-block w-3 h-3 rounded-full bg-amber-500" />
                  <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-2 bg-amber-500"
                      style={{
                        width: `${
                          total ? Math.round((medium / total) * 100) : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-700 w-16 text-right">
                    {medium} ({total ? Math.round((medium / total) * 100) : 0}
                    %)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-block w-3 h-3 rounded-full bg-rose-500" />
                  <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-2 bg-rose-500"
                      style={{
                        width: `${
                          total ? Math.round((hard / total) * 100) : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-700 w-16 text-right">
                    {hard} ({total ? Math.round((hard / total) * 100) : 0}%)
                  </span>
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  Total attempts this session: {total}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">
              Select a session from the list to view details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
