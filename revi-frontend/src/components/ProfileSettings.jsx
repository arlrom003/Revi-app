// src/components/ProfileSettings.jsx
import { useState } from "react";
import { changePassword, deleteAccount } from "../services/api";
import { supabase } from "../lib/supabase";

export default function ProfileSettings() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmDelete, setConfirmDelete] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    setBusy(true);
    try {
      if (!newPassword || newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }
      await changePassword(newPassword);
      setNewPassword("");
      setMsg("Password updated.");
    } catch (error) {
      setErr(error.message || "Failed to change password.");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    setMsg("");
    setErr("");
    setBusy(true);
    try {
      if (confirmDelete !== "DELETE") {
        throw new Error('Type DELETE to confirm account deletion.');
      }
      await deleteAccount(confirmDelete);
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch (error) {
      setErr(error.message || "Failed to delete account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-6">
      <h2 className="text-xl font-semibold">Profile Settings</h2>

      <form onSubmit={handleChangePassword} className="space-y-3">
        <h3 className="font-semibold">Change password</h3>
        <input
          type="password"
          className="w-full border rounded-lg p-2"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
        >
          Update password
        </button>
      </form>

      <div className="border-t pt-6 space-y-3">
        <h3 className="font-semibold text-red-700">Delete account</h3>
        <p className="text-sm text-gray-600">
          This will permanently delete your account. Type <b>DELETE</b> to
          confirm.
        </p>
        <input
          className="w-full border rounded-lg p-2"
          placeholder='Type "DELETE"'
          value={confirmDelete}
          onChange={(e) => setConfirmDelete(e.target.value)}
          disabled={busy}
        />
        <button
          onClick={handleDeleteAccount}
          disabled={busy}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-60"
        >
          Delete account
        </button>
      </div>

      {msg && <p className="text-green-700 text-sm">{msg}</p>}
      {err && <p className="text-red-600 text-sm">{err}</p>}
    </div>
  );
}
