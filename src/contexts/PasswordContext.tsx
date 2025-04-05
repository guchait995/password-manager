import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { db, PasswordEntry } from "../db/database";
import { useAuth } from "./AuthContext";

interface PasswordContextType {
  passwords: PasswordEntry[];
  loading: boolean;
  addPassword: (
    password: Omit<PasswordEntry, "id" | "dateCreated" | "dateModified">
  ) => Promise<number>;
  updatePassword: (
    id: number,
    password: Omit<PasswordEntry, "id" | "dateCreated" | "dateModified">
  ) => Promise<number>;
  deletePassword: (id: number) => Promise<void>;
  clearAllPasswords: () => Promise<void>;
  exportPasswords: () => Promise<string>;
  importPasswords: (jsonData: string) => Promise<void>;
}

const PasswordContext = createContext<PasswordContextType | undefined>(
  undefined
);

export const usePasswords = () => {
  const context = useContext(PasswordContext);
  if (!context) {
    throw new Error("usePasswords must be used within a PasswordProvider");
  }
  return context;
};

interface PasswordProviderProps {
  children: ReactNode;
}

export const PasswordProvider: React.FC<PasswordProviderProps> = ({
  children,
}) => {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { masterKey, isAuthenticated } = useAuth();

  // Load passwords when authenticated
  useEffect(() => {
    async function loadPasswords() {
      if (isAuthenticated && masterKey) {
        setLoading(true);
        try {
          const entries = await db.getAllPasswords(masterKey);
          setPasswords(entries);
        } catch (error) {
          console.error("Error loading passwords:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setPasswords([]);
      }
    }

    loadPasswords();
  }, [isAuthenticated, masterKey]);

  const addPassword = async (
    password: Omit<PasswordEntry, "id" | "dateCreated" | "dateModified">
  ) => {
    if (!masterKey) throw new Error("Not authenticated");

    const now = new Date();
    const newEntry: PasswordEntry = {
      ...password,
      dateCreated: now,
      dateModified: now,
    };

    const id = await db.addPassword(newEntry, masterKey);

    // Refresh the password list
    const entries = await db.getAllPasswords(masterKey);
    setPasswords(entries);

    return id;
  };

  const updatePassword = async (
    id: number,
    password: Omit<PasswordEntry, "id" | "dateCreated" | "dateModified">
  ) => {
    if (!masterKey) throw new Error("Not authenticated");

    // Get the current entry to preserve dateCreated
    const currentEntry = await db.getPassword(id, masterKey);
    if (!currentEntry) throw new Error("Password not found");

    const updatedEntry: PasswordEntry = {
      ...password,
      id,
      dateCreated: currentEntry.dateCreated,
      dateModified: new Date(),
    };

    const updated = await db.updatePassword(id, updatedEntry, masterKey);

    // Refresh the password list
    const entries = await db.getAllPasswords(masterKey);
    setPasswords(entries);

    return updated;
  };

  const deletePassword = async (id: number) => {
    if (!masterKey) throw new Error("Not authenticated");

    await db.deletePassword(id);

    // Refresh the password list
    const entries = await db.getAllPasswords(masterKey);
    setPasswords(entries);
  };

  const clearAllPasswords = async () => {
    await db.clearAllPasswords();
    setPasswords([]);
  };

  const exportPasswords = async () => {
    if (!masterKey) throw new Error("Not authenticated");
    return await db.exportData(masterKey);
  };

  const importPasswords = async (jsonData: string) => {
    if (!masterKey) throw new Error("Not authenticated");
    await db.importData(jsonData, masterKey);

    // Refresh the password list
    const entries = await db.getAllPasswords(masterKey);
    setPasswords(entries);
  };

  const value = {
    passwords,
    loading,
    addPassword,
    updatePassword,
    deletePassword,
    clearAllPasswords,
    exportPasswords,
    importPasswords,
  };

  return (
    <PasswordContext.Provider value={value}>
      {children}
    </PasswordContext.Provider>
  );
};
