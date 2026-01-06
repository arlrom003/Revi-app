import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";

import AppShell from "./layout/AppShell.jsx";

import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DeckDetail from "./pages/DeckDetail.jsx";
import ReviewSession from "./pages/ReviewSession.jsx";
import History from "./pages/History.jsx";
import Profile from "./pages/Profile.jsx";
import NewDeck from "./pages/NewDeck.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function Layout({ children }) {
  const location = useLocation();

  // No layout wrapper on login page
  if (location.pathname === "/login") {
    return children;
  }

  // Just provide a neutral background and full height;
  // AppShell handles the actual header and inner layout.
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected + AppShell */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell>
              <Home />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppShell>
              <Dashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/new-deck"
        element={
          <ProtectedRoute>
            <AppShell>
              <NewDeck />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/decks/:deckId"
        element={
          <ProtectedRoute>
            <AppShell>
              <DeckDetail />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/review/:deckId"
        element={
          <ProtectedRoute>
            <AppShell>
              <ReviewSession />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <AppShell>
              <History />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppShell>
              <Profile />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <AppRoutes />
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
