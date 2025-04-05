import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const Login: React.FC = () => {
  const { isRegistered, savedUsername, login } = useAuth();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-populate username field if registered
  useEffect(() => {
    if (isRegistered && savedUsername) {
      setUsername(savedUsername);
    }
  }, [isRegistered, savedUsername]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = login(username, pin);

      if (!success) {
        setError(isRegistered ? "Invalid PIN" : "Invalid username or PIN");
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Password Manager</h1>
        <p className="login-subtitle">
          Securely store all your passwords in one place
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegistered && savedUsername ? (
            <div className="form-group">
              <label className="label">Username</label>
              <div className="user-display">
                <span className="username-pill">{savedUsername}</span>
              </div>
              <input
                type="hidden"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="username" className="label">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="input"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="pin" className="label">
              Master PIN
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPin ? "text" : "password"}
                id="pin"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter your PIN"
                className="input"
                required
                pattern="[0-9]*"
                inputMode="numeric"
                autoFocus={!!(isRegistered && savedUsername)}
              />
              <button
                type="button"
                className="eye-toggle"
                onClick={() => setShowPin(!showPin)}
                aria-label={showPin ? "Hide PIN" : "Show PIN"}
              >
                {showPin ? (
                  <svg viewBox="0 0 24 24">
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                    <path d="M1 12s4-8 11-8c7 0 11 8 11 8-1.18 1.56-2.91 3.37-5 4.64"></path>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8c7 0 11 8 11 8-1.73 2.3-4.4 4.6-7 6-2.6-1.4-5.27-3.7-7-6z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`login-button ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>

      <div className="login-footer">
        <p>Your passwords are securely stored on your device</p>
        <p>Works offline - no internet connection required</p>
      </div>
    </div>
  );
};

export default Login;
