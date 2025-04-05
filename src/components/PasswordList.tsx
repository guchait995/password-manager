import React, { useState, useEffect, useRef } from "react";
import { usePasswords } from "../contexts/PasswordContext";
import { PasswordEntry } from "../db/database";

interface PasswordListProps {
  onAddNew?: () => void;
}

const PasswordList: React.FC<PasswordListProps> = ({ onAddNew }) => {
  const { passwords, updatePassword, deletePassword } = usePasswords();
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
    title: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setFilteredPasswords(
      passwords.filter(
        (pass) =>
          pass.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pass.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    // Update suggestions based on search term and existing passwords
    if (searchTerm.length > 0) {
      // Get unique website titles from user's passwords
      const uniqueWebsites = [...new Set(passwords.map((pass) => pass.title))];

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
      title: password.title,
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
        title: editForm.title,
        username: editForm.username,
        password: editForm.password,
        website: editForm.title, // Use title as website
        category: selectedPassword.category || "",
        notes: selectedPassword.notes || "",
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
                <tr key={pass.id}>
                  <td>{pass.title}</td>
                  <td>
                    <div className="copy-wrapper">
                      <span className="text-cell">{pass.username}</span>
                      <button
                        onClick={() =>
                          copyToClipboard(pass.username, "Username")
                        }
                        className="copy-button"
                        aria-label="Copy username"
                      >
                        📋
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="copy-wrapper">
                      <div className="password-cell">
                        {showPassword ? pass.password : "••••••••"}
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(pass.password, "Password")
                        }
                        className="copy-button"
                        aria-label="Copy password"
                      >
                        📋
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => openEditModal(pass)}
                        className="button button-small button-secondary"
                        aria-label="Edit password"
                      >
                        Edit
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
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditSubmit}>
                <div className="form-group">
                  <label htmlFor="title" className="label">
                    Website
                  </label>
                  <input
                    type="text"
                    id="title"
                    className="input"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    required
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
                  <div className="input-group">
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
                      className="button button-secondary"
                      onClick={() =>
                        setShowSelectedPassword(!showSelectedPassword)
                      }
                    >
                      {showSelectedPassword ? "Hide" : "Show"}
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
                  >
                    Delete
                  </button>
                  <div className="spacer"></div>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="button button-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordList;
