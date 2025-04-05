import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Basic validation
    if (!username.trim()) {
      setError("Username is required");
      setIsLoading(false);
      return;
    }

    if (pin.length < 4) {
      setError("PIN must be at least 4 digits");
      setIsLoading(false);
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match");
      setIsLoading(false);
      return;
    }

    try {
      register(username, pin);
      // The register function will auto-login the user
    } catch (error) {
      setError("Registration failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Welcome!</h1>
        <p className="login-subtitle">
          Set up your account to start using Password Manager
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="label">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="pin" className="label">
              Master PIN
            </label>
            <div className="password-input-wrapper">
              <input
                type="password"
                id="pin"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Create a master PIN (min 4 digits)"
                className="input"
                required
                minLength={4}
                pattern="[0-9]*"
                inputMode="numeric"
              />
            </div>
            <small className="form-text">
              This PIN will be used to access all your passwords. Make sure it's
              secure and memorable.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPin" className="label">
              Confirm Master PIN
            </label>
            <div className="password-input-wrapper">
              <input
                type="password"
                id="confirmPin"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Confirm your master PIN"
                className="input"
                required
                minLength={4}
                pattern="[0-9]*"
                inputMode="numeric"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`login-button ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "Setting up..." : "Create Account"}
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

export default Register;
