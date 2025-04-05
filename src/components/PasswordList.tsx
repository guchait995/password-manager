import React, { useState, useEffect, useRef } from "react";
import { usePasswords } from "../contexts/PasswordContext";
import { PasswordEntry } from "../db/database";
import { useAuth } from "../contexts/AuthContext";

interface PasswordListProps {
  onAddNew?: () => void;
}

// Add SVG icon components for edit, delete and close
const PencilIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </svg>
);

const BinIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
  </svg>
);

const PasswordList: React.FC<PasswordListProps> = ({ onAddNew }) => {
  const { passwords, updatePassword, deletePassword } = usePasswords();
  const { masterKey } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPasswords, setFilteredPasswords] = useState<PasswordEntry[]>(
    []
  );
  const [selectedPassword, setSelectedPassword] =
    useState<PasswordEntry | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSelectedPassword, setShowSelectedPassword] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: string;
  } | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    website: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  // Add state for view-only modal
  const [viewPasswordDetails, setViewPasswordDetails] = useState({
    website: "",
    username: "",
    password: "",
  });
  const [showViewModal, setShowViewModal] = useState(false);
  const [showViewPassword, setShowViewPassword] = useState(false);

  useEffect(() => {
    setFilteredPasswords(
      passwords.filter(
        (pass) =>
          (pass.website || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          pass.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    // Update suggestions based on search term and existing passwords
    if (searchTerm.length > 0) {
      // Get unique website titles from user's passwords
      const uniqueWebsites = [
        ...new Set(passwords.map((pass) => pass.website || "").filter(Boolean)),
      ];

      // Filter websites that match the search term
      const matchingSuggestions = uniqueWebsites
        .filter((site) => site.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 8); // Limit to 8 suggestions

      setSuggestions(matchingSuggestions);
      setShowSuggestions(matchingSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [passwords, searchTerm]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectSuggestion = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const openEditModal = (password: PasswordEntry) => {
    setSelectedPassword(password);
    setEditForm({
      website: password.website || "",
      username: password.username,
      password: password.password,
      confirmPassword: password.password,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPassword || typeof selectedPassword.id !== "number") return;

    // Validate password match
    if (editForm.password !== editForm.confirmPassword) {
      showNotification("Passwords do not match", "error");
      return;
    }

    setIsLoading(true);

    try {
      updatePassword(selectedPassword.id, {
        username: editForm.username,
        password: editForm.password,
        website: editForm.website,
      });

      setShowEditModal(false);
      showNotification("Password updated successfully", "success");
    } catch (error) {
      showNotification("Failed to update password", "error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPassword || typeof selectedPassword.id !== "number") return;

    if (window.confirm("Are you sure you want to delete this password?")) {
      try {
        deletePassword(selectedPassword.id);
        setShowEditModal(false);
        showNotification("Password deleted successfully", "success");
      } catch (error) {
        showNotification("Failed to delete password", "error");
        console.error(error);
      }
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        showNotification(`${label} copied to clipboard`, "success");
      },
      () => {
        showNotification("Failed to copy to clipboard", "error");
      }
    );
  };

  const showNotification = (message: string, type: string) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // New function to handle row click for view-only modal
  const handleRowClick = (password: PasswordEntry) => {
    setViewPasswordDetails({
      website: password.website || "",
      username: password.username,
      password: password.password,
    });
    setShowViewPassword(false);
    setShowViewModal(true);
  };

  return (
    <div className="password-list-container">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="search-box">
        <div className="search-input-wrapper" ref={searchInputRef}>
          <span className="search-icon">&#128269;</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search passwords..."
            className="search-input"
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}

          {/* Autocomplete suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="autocomplete-suggestions">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => selectSuggestion(suggestion)}
                  className="suggestion-item"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="search-options">
          <div className="toggle-container">
            <span className="toggle-label">Show passwords</span>
            <button
              type="button"
              className="toggle-password dashboard-toggle"
              data-active={showPassword ? "true" : "false"}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide passwords" : "Show passwords"}
            />
          </div>

          {filteredPasswords.length > 0 && (
            <div className="password-count">
              {filteredPasswords.length} passwords
            </div>
          )}
        </div>
      </div>

      {filteredPasswords.length === 0 ? (
        <div className="no-passwords">
          {searchTerm ? (
            "No matching passwords found"
          ) : (
            <>
              <p>No passwords yet. Add your first one!</p>
              {onAddNew && (
                <button
                  onClick={onAddNew}
                  className="button button-primary mt-3"
                >
                  Add Password
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="password-table">
            <thead>
              <tr>
                <th>Website</th>
                <th>Username</th>
                <th>Password</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPasswords.map((pass) => (
                <tr
                  key={pass.id}
                  onClick={() => handleRowClick(pass)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{pass.website || ""}</td>
                  <td>
                    <div className="copy-wrapper">
                      <span className="text-cell">{pass.username}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          copyToClipboard(pass.username, "Username");
                        }}
                        className="copy-button"
                        aria-label="Copy username"
                      >
                        <CopyIcon />
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="copy-wrapper">
                      <div className="password-cell text-cell">
                        {showPassword ? pass.password : "••••••••"}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          copyToClipboard(pass.password, "Password");
                        }}
                        className="copy-button"
                        aria-label="Copy password"
                      >
                        <CopyIcon />
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          openEditModal(pass);
                        }}
                        className="button button-small button-secondary"
                        aria-label="Edit password"
                      >
                        <PencilIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPassword && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Password</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="modal-close"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditSubmit}>
                <div className="form-group">
                  <label htmlFor="website" className="label">
                    Website
                  </label>
                  <input
                    type="text"
                    id="website"
                    className="input"
                    value={editForm.website}
                    onChange={(e) =>
                      setEditForm({ ...editForm, website: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="username" className="label">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    className="input"
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm({ ...editForm, username: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password" className="label">
                    Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showSelectedPassword ? "text" : "password"}
                      id="password"
                      className="input"
                      value={editForm.password}
                      onChange={(e) =>
                        setEditForm({ ...editForm, password: e.target.value })
                      }
                      required
                    />
                    <button
                      type="button"
                      className="eye-toggle"
                      onClick={() =>
                        setShowSelectedPassword(!showSelectedPassword)
                      }
                      aria-label={
                        showSelectedPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showSelectedPassword ? (
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
                    Confirm Password
                  </label>
                  <input
                    type={showSelectedPassword ? "text" : "password"}
                    id="confirmPassword"
                    className="input"
                    value={editForm.confirmPassword}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="button button-danger"
                    onClick={handleDelete}
                    aria-label="Delete password"
                  >
                    <BinIcon />
                  </button>
                  <div className="spacer"></div>
                  <button
                    type="submit"
                    className="button button-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View-only modal */}
      {showViewModal && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{viewPasswordDetails.website}</h3>
              <button
                className="modal-close"
                onClick={() => setShowViewModal(false)}
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  className="input"
                  value={viewPasswordDetails.username}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showViewPassword ? "text" : "password"}
                    className="input"
                    value={viewPasswordDetails.password}
                    readOnly
                  />
                  <button
                    type="button"
                    className="eye-toggle"
                    onClick={() => setShowViewPassword(!showViewPassword)}
                    aria-label={
                      showViewPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showViewPassword ? (
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordList;
