import React, { useState, useRef } from "react";
import { usePasswords } from "../contexts/PasswordContext";

interface ImportExportProps {
  onClose?: () => void;
}

const ImportExport: React.FC<ImportExportProps> = ({ onClose }) => {
  const { exportPasswords, importPasswords } = usePasswords();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: string;
  } | null>(null);
  const [importConfirmVisible, setImportConfirmVisible] = useState(false);
  const [importData, setImportData] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const jsonData = await exportPasswords();

      // Create a download link
      const dataStr =
        "data:text/json;charset=utf-8," + encodeURIComponent(jsonData);
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute(
        "download",
        `password_export_${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();

      showNotification("Passwords exported successfully", "success");

      // Close after a delay
      if (onClose) {
        setTimeout(onClose, 1500);
      }
    } catch (error) {
      showNotification("Failed to export passwords", "error");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonData = event.target?.result as string;
        // Parse to validate JSON structure
        JSON.parse(jsonData);

        setImportData(jsonData);
        setImportConfirmVisible(true);
      } catch (error) {
        showNotification("Invalid JSON file", "error");
        console.error(error);
      }
    };
    reader.readAsText(file);

    // Reset the file input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const confirmImport = async () => {
    if (!importData) return;

    setIsImporting(true);
    try {
      await importPasswords(importData);
      setImportConfirmVisible(false);
      setImportData(null);
      showNotification("Passwords imported successfully", "success");

      // Close after a delay
      if (onClose) {
        setTimeout(onClose, 1500);
      }
    } catch (error) {
      showNotification("Failed to import passwords", "error");
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  const cancelImport = () => {
    setImportConfirmVisible(false);
    setImportData(null);
  };

  const showNotification = (message: string, type: string) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  return (
    <div className="import-export-container">
      {notification && (
        <div className={`notification modal-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="modal-body">
        <div className="section">
          <h3 className="section-title">Export Passwords</h3>
          <p className="section-description">
            Export all your passwords as a JSON file. Keep this file secure as
            it contains all your password information.
          </p>
          <button
            className={`button button-primary ${isExporting ? "loading" : ""}`}
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? "Exporting..." : "Export Passwords"}
          </button>
        </div>

        <div className="section">
          <h3 className="section-title">Import Passwords</h3>
          <p className="section-description">
            Import passwords from a JSON file. The file should match the format
            of an exported file.
          </p>
          <input
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            ref={fileInputRef}
            style={{ display: "none" }}
          />
          <button
            className={`button button-primary ${isImporting ? "loading" : ""}`}
            onClick={handleImportClick}
            disabled={isImporting || importConfirmVisible}
          >
            Select File to Import
          </button>
        </div>
      </div>

      {/* Import Confirmation Modal */}
      {importConfirmVisible && (
        <div className="nested-modal">
          <div className="nested-modal-content">
            <div className="nested-modal-header">
              <h3>Confirm Import</h3>
            </div>
            <div className="nested-modal-body">
              <p>
                Are you sure you want to import these passwords? This action
                cannot be undone.
              </p>
              <p>Existing passwords with the same details may be duplicated.</p>
            </div>
            <div className="nested-modal-actions">
              <button
                onClick={cancelImport}
                className="button"
                disabled={isImporting}
              >
                Cancel
              </button>
              <button
                onClick={confirmImport}
                className={`button button-primary ${
                  isImporting ? "loading" : ""
                }`}
                disabled={isImporting}
              >
                {isImporting ? "Importing..." : "Confirm Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportExport;
