import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { usePasswords } from "../contexts/PasswordContext";
import AddPassword from "./AddPassword";
import PasswordList from "./PasswordList";
import ImportExport from "./ImportExport";

// SVG icon for more menu - resembling Chrome's three dots
const ThreeDotsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
  </svg>
);

const Dashboard: React.FC = () => {
  const { username, logout, deleteAccount } = useAuth();
  const { clearAllPasswords } = usePasswords();
  const [activeTab, setActiveTab] = useState("passwords");
  const [darkMode, setDarkMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  };

  const toggleMenu = () => {
    if (showMenu) {
      closeMenu();
    } else {
      setShowMenu(true);
      setIsMenuClosing(false);
    }
  };

  const closeMenu = () => {
    setIsMenuClosing(true);
    setTimeout(() => {
      setShowMenu(false);
      setIsMenuClosing(false);
    }, 150); // Match the animation duration
  };

  const closeModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setShowImportExport(false);
      setShowDeleteConfirm(false);
      setIsModalClosing(false);
    }, 200); // Match the animation duration
  };

  const handleAddNewClick = () => {
    setActiveTab("add");
    closeMenu();
  };

  const handleImportExportClick = () => {
    setShowImportExport(true);
    setIsModalClosing(false);
    closeMenu();
  };

  const handleDeleteAccountClick = () => {
    setShowDeleteConfirm(true);
    setIsModalClosing(false);
    closeMenu();
  };

  const confirmDeleteAccount = async () => {
    try {
      // First clear all stored passwords
      await clearAllPasswords();
      // Then delete the account (which also logs out)
      deleteAccount();
    } catch (error) {
      console.error("Error deleting account:", error);
    }
    closeModal();
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  // Prevent scrolling when menu is open on mobile
  useEffect(() => {
    if (showMenu && window.innerWidth <= 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showMenu]);

  return (
    <div className={`dashboard-container ${darkMode ? "dark-mode" : ""}`}>
      <div className="dashboard-header">
        <h1>Password Manager</h1>
        <div className="header-actions">
          <span className="welcome-text">Welcome, {username}</span>
          <button
            ref={buttonRef}
            onClick={toggleMenu}
            className="button button-icon"
            aria-label="Menu"
            title="Menu"
          >
            <ThreeDotsIcon />
          </button>
          {showMenu && (
            <>
              {/* Backdrop for mobile */}
              <div
                className={`menu-backdrop ${isMenuClosing ? "closing" : ""}`}
                onClick={closeMenu}
              ></div>
              <div
                className={`dropdown-menu ${isMenuClosing ? "closing" : ""}`}
                ref={menuRef}
              >
                <button onClick={handleAddNewClick} className="dropdown-item">
                  Add New Password
                </button>
                <button
                  onClick={handleImportExportClick}
                  className="dropdown-item"
                >
                  Import/Export
                </button>
                <button onClick={toggleDarkMode} className="dropdown-item">
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </button>
                <button
                  onClick={handleDeleteAccountClick}
                  className="dropdown-item danger-item"
                >
                  Delete Account
                </button>
                <button onClick={logout} className="dropdown-item">
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="main-content">
        {activeTab === "passwords" && (
          <PasswordList onAddNew={handleAddNewClick} />
        )}
        {activeTab === "add" && (
          <>
            <div className="back-button-container">
              <button
                onClick={() => setActiveTab("passwords")}
                className="button button-small"
              >
                ← Back to Passwords
              </button>
            </div>
            <AddPassword onSaved={() => setActiveTab("passwords")} />
          </>
        )}
      </div>

      {/* Import/Export Modal */}
      {(showImportExport || isModalClosing) && !showDeleteConfirm && (
        <div className={`modal-overlay ${isModalClosing ? "closing" : ""}`}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Import and Export</h3>
              <button onClick={closeModal} className="modal-close">
                ×
              </button>
            </div>
            <ImportExport onClose={closeModal} />
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {(showDeleteConfirm || (isModalClosing && showDeleteConfirm)) && (
        <div className={`modal-overlay ${isModalClosing ? "closing" : ""}`}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Delete Account</h3>
              <button onClick={closeModal} className="modal-close">
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete your account?</p>
              <p className="warning-text">
                This will permanently delete your account and all your saved
                passwords. This action cannot be undone.
              </p>
            </div>
            <div className="modal-actions">
              <button onClick={closeModal} className="button button-secondary">
                Cancel
              </button>
              <button
                onClick={confirmDeleteAccount}
                className="button button-danger"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="footer">
        <p className="footer-text">
          Your passwords are encrypted and stored locally in your browser.
        </p>
        <p className="footer-text">
          This app works offline. No data is sent to any server.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
