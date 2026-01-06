import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from './AuthContext';

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
  const { user, signOut } = useAuth();

  const isActive = (path) =>
    location.pathname === path ||
    (path !== "/" && location.pathname.startsWith(path));

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  // No layout on login page
  if (location.pathname === "/login") {
    return children;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top nav */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-xl font-bold text-blue-600 hover:text-blue-700"
            >
              Revi
            </Link>
            {user && (
              <nav className="hidden md:flex items-center gap-3 text-sm">
                <NavLink to="/dashboard" active={isActive("/dashboard")}>
                  Dashboard
                </NavLink>
                <NavLink to="/new-deck" active={isActive("/new-deck")}>
                  New deck
                </NavLink>
                <NavLink to="/history" active={isActive("/history")}>
                  History
                </NavLink>
                <NavLink to="/profile" active={isActive("/profile")}>
                  Profile
                </NavLink>
              </nav>
            )}
          </div>

          {user && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-600 truncate max-w-[160px]">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="border border-gray-300 px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={
        "px-3 py-1.5 rounded-lg transition-colors " +
        (active
          ? "bg-blue-100 text-blue-700"
          : "text-gray-600 hover:bg-gray-100")
      }
    >
      {children}
    </Link>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/new-deck"
        element={
          <ProtectedRoute>
            <NewDeck />
          </ProtectedRoute>
        }
      />
      <Route
        path="/decks/:deckId"
        element={
          <ProtectedRoute>
            <DeckDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/review/:deckId"
        element={
          <ProtectedRoute>
            <ReviewSession />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
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
