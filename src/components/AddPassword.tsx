import React, { useState } from "react";
import { usePasswords } from "../contexts/PasswordContext";

interface AddPasswordProps {
  onSaved?: () => void;
}

const AddPassword: React.FC<AddPasswordProps> = ({ onSaved }) => {
  const { addPassword } = usePasswords();
  const [website, setWebsite] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate password fields only
    if (!password) {
      setError("Password is required");
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      addPassword({
        title: website || "Unnamed Entry", // Use default if empty
        username: username || "", // Allow empty username
        password,
        website: website || "", // Allow empty website
        category: "",
        notes: "",
      });

      // Reset form
      setWebsite("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");

      setSuccess("Password added successfully!");

      // Call the onSaved callback after a short delay to allow the user to see the success message
      if (onSaved) {
        setTimeout(() => {
          onSaved();
        }, 1500);
      }
    } catch (error) {
      setError("Failed to add password");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-password-container">
      <h2 className="form-title">Add New Password</h2>
      <div className="divider"></div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="website" className="label">
            Website/App
          </label>
          <input
            id="website"
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="input"
            placeholder="Enter website name (optional)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="username" className="label">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input"
            placeholder="Username or email (optional)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="label">
            Password <span className="required">*</span>
          </label>
          <div className="password-input-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Enter password"
              required
            />
            <button
              type="button"
              className="eye-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
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

        <div className="form-group">
          <label htmlFor="confirmPassword" className="label">
            Confirm Password <span className="required">*</span>
          </label>
          <div className="password-input-wrapper">
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              placeholder="Confirm password"
              required
            />
            <button
              type="button"
              className="eye-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
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
          className="button button-primary"
          disabled={isLoading}
        >
          {isLoading ? "Adding..." : "Save Password"}
        </button>
      </form>
    </div>
  );
};

export default AddPassword;
