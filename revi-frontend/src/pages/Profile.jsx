// src/Profile.jsx
import { useEffect, useState } from "react";
import { getAnalyticsOverview } from "../services/api";

export default function Profile() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const overview = await getAnalyticsOverview();
        setAnalytics({
          totalDecks: overview.totalDecks ?? 0,
          totalCards: overview.totalCards ?? 0,
          totalSessions: overview.totalSessions ?? 0,
          totalStudyMinutes: overview.totalStudyMinutes ?? 0,
          firstSessionAt: overview.firstSessionAt || null,
          lastSessionAt: overview.lastSessionAt || null,
        });
      } catch (err) {
        console.error("Error loading profile analytics:", err);
        setError("Unable to load analytics.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const formatDate = (iso) => {
    if (!iso) return "N/A";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Profile</h1>
        <p className="text-red-500">
          {error || "Unable to load analytics."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-gray-600">
          Your study statistics and learning streak.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold mb-2">Study summary</h2>

        <div className="space-y-3">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Total decks</span>
            <span className="font-bold">{analytics.totalDecks}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Total cards</span>
            <span className="font-bold">{analytics.totalCards}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Study sessions</span>
            <span className="font-bold">{analytics.totalSessions}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Total study time</span>
            <span className="font-bold">
              {analytics.totalStudyMinutes} min
            </span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">First session</span>
            <span className="font-bold">
              {formatDate(analytics.firstSessionAt)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last session</span>
            <span className="font-bold">
              {formatDate(analytics.lastSessionAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
