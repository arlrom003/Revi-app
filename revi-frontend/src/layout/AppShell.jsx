// src/layout/AppShell.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";

const TITLES = {
  "/dashboard": "Dashboard",
  "/": "My decks",
  "/home": "My decks",
  "/history": "History",
  "/profile": "Profile",
  "/new-deck": "New deck",
};

export default function AppShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const path = location.pathname;
  let title = "Revi";

  if (path.startsWith("/decks/")) {
    title = "Deck";
  } else if (path.startsWith("/review/")) {
    title = "Review";
  } else {
    title = TITLES[path] || "Revi";
  }

  const handleNav = (to) => {
    setMenuOpen(false);
    navigate(to);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top app bar */}
      <header className="h-14 px-4 flex items-center justify-between bg-white shadow-sm relative z-20">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:bg-gray-200"
        >
          <span className="sr-only">Back</span>
          <svg
            className="w-5 h-5 text-gray-700"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <h1 className="text-base font-semibold text-gray-900 truncate">
          {title}
        </h1>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="p-2 -mr-2 rounded-full hover:bg-gray-100 active:bg-gray-200"
        >
          <span className="sr-only">Menu</span>
          <svg
            className="w-5 h-5 text-gray-700"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="bg-white border-b border-gray-200 shadow-sm z-10">
          <div className="max-w-3xl mx-auto px-4 py-2 space-y-1 text-sm">
            <button
              type="button"
              onClick={() => handleNav("/dashboard")}
              className="block w-full text-left px-2 py-1 rounded-md hover:bg-gray-50"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => handleNav("/new-deck")}
              className="block w-full text-left px-2 py-1 rounded-md hover:bg-gray-50"
            >
              New deck
            </button>
            <button
              type="button"
              onClick={() => handleNav("/history")}
              className="block w-full text-left px-2 py-1 rounded-md hover:bg-gray-50"
            >
              History
            </button>
            <button
              type="button"
              onClick={() => handleNav("/profile")}
              className="block w-full text-left px-2 py-1 rounded-md hover:bg-gray-50"
            >
              Profile
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-4">{children}</div>
      </main>
    </div>
  );
}
