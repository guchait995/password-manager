import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { PasswordProvider } from "./contexts/PasswordContext";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import "./App.css";

// For PWA functionality
const registerSW = () => {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").then(
        (registration) => {
          console.log(
            "ServiceWorker registration successful with scope: ",
            registration.scope
          );
        },
        (err) => {
          console.log("ServiceWorker registration failed: ", err);
        }
      );
    });
  }
};

// Register service worker
registerSW();

function AppContent() {
  const { isAuthenticated, isRegistered, masterKey } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a small delay to check authentication
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  // Determine which component to render based on authentication state
  if (isAuthenticated && masterKey) {
    return <Dashboard />;
  }

  // If user is not registered, show registration page
  if (!isRegistered) {
    return <Register />;
  }

  // Otherwise show login page for returning users
  return <Login />;
}

function App() {
  return (
    <AuthProvider>
      <PasswordProvider>
        <div className="app-container">
          <AppContent />
        </div>
      </PasswordProvider>
    </AuthProvider>
  );
}

export default App;
