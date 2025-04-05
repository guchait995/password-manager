import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { authService } from "../services/authService";

interface AuthContextType {
  isAuthenticated: boolean;
  isRegistered: boolean;
  username: string | null;
  masterKey: string | null;
  savedUsername: string | null;
  login: (username: string, password: string) => boolean;
  register: (username: string, pin: string) => void;
  logout: () => void;
  deleteAccount: () => void;
  changeCredentials: (newUsername: string, newPassword: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [masterKey, setMasterKey] = useState<string | null>(null);

  // Check if session exists
  useEffect(() => {
    const storedSession = sessionStorage.getItem("password_manager_session");
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        setIsAuthenticated(true);
        setUsername(session.username);
        setMasterKey(session.masterKey);
      } catch (error) {
        console.error("Failed to restore session:", error);
        sessionStorage.removeItem("password_manager_session");
      }
    }
  }, []);

  // Check if the user has registered
  const isRegistered = authService.isRegistered();

  // Get the saved username
  const savedUsername = authService.getSavedUsername();

  const register = (username: string, pin: string): void => {
    authService.register(username, pin);

    // Auto login after registration
    login(username, pin);
  };

  const login = (username: string, password: string): boolean => {
    const isValid = authService.verifyCredentials(username, password);

    if (isValid) {
      setIsAuthenticated(true);
      setUsername(username);

      // Derive encryption key from password
      const key = authService.deriveEncryptionKey(password);
      setMasterKey(key);

      // Store session in sessionStorage (will be cleared when tab is closed)
      sessionStorage.setItem(
        "password_manager_session",
        JSON.stringify({
          username,
          masterKey: key,
        })
      );
    }

    return isValid;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUsername(null);
    setMasterKey(null);
    sessionStorage.removeItem("password_manager_session");
  };

  const deleteAccount = () => {
    // Delete account from storage
    authService.deleteAccount();

    // Logout user
    logout();
  };

  const changeCredentials = (newUsername: string, newPassword: string) => {
    authService.changeCredentials(newUsername, newPassword);

    // Re-login with new credentials
    login(newUsername, newPassword);
  };

  const value = {
    isAuthenticated,
    isRegistered,
    username,
    masterKey,
    savedUsername,
    login,
    register,
    logout,
    deleteAccount,
    changeCredentials,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
