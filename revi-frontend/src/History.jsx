import { useEffect, useState } from "react";
import { getHistory } from "./services/api";

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getHistory();
        setSessions(data.sessions || []);
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
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading history...</div>
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">Study History</h1>
        <p className="text-gray-600 mb-4">
          Review your past study sessions and track improvement.
        </p>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-gray-700 mb-2">No study sessions yet.</p>
          <p className="text-gray-500 text-sm">
            Complete a review session to see your history here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Study History</h1>
        <p className="text-gray-600">
          Review your past study sessions and track improvement.
        </p>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">
                {session.deck_name || "Deck"}
              </p>
              <p className="text-sm text-gray-500">
                {formatDate(session.started_at)} ·{" "}
                {formatDuration(session.duration_seconds || 0)}
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="text-green-600">
                Easy: {session.easy_count ?? 0}
              </p>
              <p className="text-yellow-600">
                Medium: {session.medium_count ?? 0}
              </p>
              <p className="text-red-600">
                Hard: {session.hard_count ?? 0}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
