// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { getAnalyticsOverview } from "../services/api";

export default function Profile() {
  const { user, signOut } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [deleteText, setDeleteText] = useState("");
  const [busy, setBusy] = useState(false);

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
          firstSessionAt: overview.firstSessionAt ?? null,
          lastSessionAt: overview.lastSessionAt ?? null,
        });
      } catch (err) {
        console.error("Error loading profile analytics", err);
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

  const formatMinutes = (minutes) => {
    const hours = Math.floor((minutes ?? 0) / 60);
    const mins = (minutes ?? 0) % 60;
    if (hours === 0) return `${mins} min`;
    return `${hours}h ${mins}m`;
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim()) return;
    try {
      setBusy(true);
      // Wire this to Supabase or your auth provider later.
      alert("Password updated (demo only – hook to Supabase here).");
      setNewPassword("");
      setChangingPassword(false);
    } catch (err) {
      console.error("Change password error", err);
      alert("Failed to change password.");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteText !== "DELETE") {
      alert('Type "DELETE" in the box to confirm.');
      return;
    }
    const ok = window.confirm(
      "Are you sure? This will sign you out and your data may be removed."
    );
    if (!ok) return;

    try {
      setBusy(true);
      await signOut();
      window.location.href = "/login";
    } catch (err) {
      console.error("Delete account/sign out error", err);
      alert("Failed to delete account.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-indigo-500 text-lg font-medium">
          Loading profile…
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-red-500 text-sm">{error || "Unable to load analytics."}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 text-sm">
            Your study statistics and profile settings.
          </p>
        </div>
        {user && (
          <div className="flex flex-col items-start sm:items-end gap-1">
            <span className="text-xs uppercase tracking-wide text-gray-500">
              Signed in as
            </span>
            <span className="text-sm font-medium text-gray-800 bg-indigo-50 px-3 py-1 rounded-full">
              {user.email}
            </span>
            <button
              type="button"
              onClick={signOut}
              className="mt-1 inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
            >
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Study summary */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Study summary
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl bg-indigo-50 px-4 py-3">
                <p className="text-xs font-medium text-indigo-500 uppercase">
                  Total decks
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {analytics.totalDecks}
                </p>
              </div>

              <div className="rounded-xl bg-sky-50 px-4 py-3">
                <p className="text-xs font-medium text-sky-500 uppercase">
                  Total cards
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {analytics.totalCards}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 px-4 py-3">
                <p className="text-xs font-medium text-emerald-500 uppercase">
                  Study sessions
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {analytics.totalSessions}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 px-4 py-3">
                <p className="text-xs font-medium text-amber-500 uppercase">
                  Total study time
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {formatMinutes(analytics.totalStudyMinutes)}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-gray-500">First session</span>
                <span className="font-medium">{formatDate(analytics.firstSessionAt)}</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-gray-500">Last session</span>
                <span className="font-medium">{formatDate(analytics.lastSessionAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account settings */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Account settings
            </h2>

            {/* Change password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-800">
                  Change password
                </span>
                <button
                  type="button"
                  onClick={() => setChangingPassword((v) => !v)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  {changingPassword ? "Cancel" : "Update password"}
                </button>
              </div>

              {changingPassword && (
                <div className="space-y-2">
                  <input
                    type="password"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleChangePassword}
                    className="w-full inline-flex justify-center items-center px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
                  >
                    Save new password
                  </button>
                </div>
              )}
            </div>

            {/* Delete account */}
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <span className="text-sm font-medium text-gray-800">
                Delete account
              </span>
              <p className="text-xs text-gray-500">
                This will permanently delete your account. Type{" "}
                <span className="font-semibold text-red-600">DELETE</span> to
                confirm.
              </p>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder='Type "DELETE"'
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
              />
              <button
                type="button"
                disabled={busy || deleteText !== "DELETE"}
                onClick={handleDeleteAccount}
                className="w-full inline-flex justify-center items-center px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60"
              >
                Delete account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
