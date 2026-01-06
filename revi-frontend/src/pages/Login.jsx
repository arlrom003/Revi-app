// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useAuth } from "../AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, setUser } = useAuth() ?? {};

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (signInError) throw signInError;
      if (!data.session || !data.user) {
        throw new Error("Login failed. No session returned.");
      }

      if (setUser) setUser(data.user);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error", err);
      setError(err.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("Sign up failed.");

      setError("Check your email for a confirmation link.");
    } catch (err) {
      console.error("Sign up error", err);
      setError(err.message || "Failed to sign up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-indigo-50 px-6 py-7 space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-3xl font-bold text-indigo-700">Revi</h1>
          <p className="text-sm text-gray-600">
            Sign in or create an account to start studying.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-800">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-800">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex justify-center items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={handleSignUp}
            disabled={loading}
            className="w-full inline-flex justify-center items-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </div>
      </div>
    </div>
  );
}
