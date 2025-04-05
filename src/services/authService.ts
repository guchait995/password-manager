import CryptoJS from "crypto-js";

interface AuthData {
  username: string;
  passwordHash: string;
  salt: string;
  isRegistered: boolean;
}

class AuthService {
  private readonly AUTH_KEY = "password_manager_auth";

  // Initialize with default credentials or read from storage
  constructor() {
    // Create default credentials if none exist
    if (!this.getAuthData()) {
      this.setDefaultCredentials();
    }
  }

  // Set default credentials (initial setup)
  private setDefaultCredentials(): void {
    // This is only called once when the app is first installed
    // User should change this immediately
    const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
    const authData: AuthData = {
      username: "admin",
      passwordHash: this.hashPassword("admin", salt),
      salt,
      isRegistered: false, // Default is not registered
    };
    localStorage.setItem(this.AUTH_KEY, JSON.stringify(authData));
  }

  // Get auth data from storage
  private getAuthData(): AuthData | null {
    const authData = localStorage.getItem(this.AUTH_KEY);
    if (!authData) return null;
    return JSON.parse(authData);
  }

  // Hash password with salt
  private hashPassword(password: string, salt: string): string {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 1000,
    }).toString();
  }

  // Check if user has registered
  public isRegistered(): boolean {
    const authData = this.getAuthData();
    return authData ? authData.isRegistered : false;
  }

  // Get saved username
  public getSavedUsername(): string | null {
    const authData = this.getAuthData();
    return authData ? authData.username : null;
  }

  // Register new user
  public register(username: string, pin: string): void {
    const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
    const authData: AuthData = {
      username,
      passwordHash: this.hashPassword(pin, salt),
      salt,
      isRegistered: true,
    };
    localStorage.setItem(this.AUTH_KEY, JSON.stringify(authData));
  }

  // Verify login credentials
  public verifyCredentials(username: string, password: string): boolean {
    const authData = this.getAuthData();
    if (!authData) return false;

    const hashedPassword = this.hashPassword(password, authData.salt);
    return (
      username === authData.username && hashedPassword === authData.passwordHash
    );
  }

  // Change credentials (username and password)
  public changeCredentials(newUsername: string, newPassword: string): void {
    const authData = this.getAuthData();
    if (!authData) throw new Error("Authentication data not found");

    const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
    const newAuthData: AuthData = {
      username: newUsername,
      passwordHash: this.hashPassword(newPassword, salt),
      salt,
      isRegistered: authData.isRegistered,
    };
    localStorage.setItem(this.AUTH_KEY, JSON.stringify(newAuthData));
  }

  // Derive encryption key from password
  public deriveEncryptionKey(password: string): string {
    const authData = this.getAuthData();
    if (!authData) throw new Error("Authentication data not found");

    // Use a different derivation context for the encryption key
    return CryptoJS.PBKDF2(password, authData.salt + "encryption_context", {
      keySize: 256 / 32,
      iterations: 1000,
    }).toString();
  }

  // Delete user account
  public deleteAccount(): void {
    localStorage.removeItem(this.AUTH_KEY);
    // Also reset to default state
    this.setDefaultCredentials();
  }
}

export const authService = new AuthService();
