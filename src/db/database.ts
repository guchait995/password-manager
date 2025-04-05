import Dexie from "dexie";
import CryptoJS from "crypto-js";

export interface PasswordEntry {
  id?: number;
  title: string;
  username: string;
  password: string;
  website?: string;
  notes?: string;
  category?: string;
  dateCreated: Date;
  dateModified: Date;
}

class PasswordDatabase extends Dexie {
  passwords: Dexie.Table<PasswordEntry, number>;

  constructor() {
    super("PasswordManagerDB");
    this.version(1).stores({
      passwords: "++id,title,username,category,dateCreated,dateModified",
    });
    this.passwords = this.table("passwords");
  }

  // Encrypt password before storing
  async addPassword(entry: PasswordEntry, masterKey: string): Promise<number> {
    const encryptedEntry = this.encryptEntry(entry, masterKey);
    return await this.passwords.add(encryptedEntry);
  }

  // Decrypt password when retrieving
  async getPassword(
    id: number,
    masterKey: string
  ): Promise<PasswordEntry | undefined> {
    const entry = await this.passwords.get(id);
    if (!entry) return undefined;
    return this.decryptEntry(entry, masterKey);
  }

  // Get all passwords
  async getAllPasswords(masterKey: string): Promise<PasswordEntry[]> {
    const entries = await this.passwords.toArray();
    return entries.map((entry) => this.decryptEntry(entry, masterKey));
  }

  // Update password
  async updatePassword(
    id: number,
    entry: PasswordEntry,
    masterKey: string
  ): Promise<number> {
    const encryptedEntry = this.encryptEntry(
      { ...entry, dateModified: new Date() },
      masterKey
    );
    return await this.passwords.update(id, encryptedEntry);
  }

  // Delete password
  async deletePassword(id: number): Promise<void> {
    await this.passwords.delete(id);
  }

  // Clear all passwords (used when deleting account)
  async clearAllPasswords(): Promise<void> {
    await this.passwords.clear();
  }

  // Export all password data
  async exportData(masterKey: string): Promise<string> {
    const entries = await this.getAllPasswords(masterKey);
    return JSON.stringify(entries);
  }

  // Import password data
  async importData(jsonData: string, masterKey: string): Promise<void> {
    try {
      const entries: PasswordEntry[] = JSON.parse(jsonData);
      await this.transaction("rw", this.passwords, async () => {
        for (const entry of entries) {
          const encryptedEntry = this.encryptEntry(entry, masterKey);
          await this.passwords.add(encryptedEntry);
        }
      });
    } catch (error) {
      console.error("Error importing data:", error);
      throw error;
    }
  }

  // Encryption and decryption methods
  private encryptEntry(entry: PasswordEntry, masterKey: string): PasswordEntry {
    return {
      ...entry,
      password: CryptoJS.AES.encrypt(entry.password, masterKey).toString(),
    };
  }

  private decryptEntry(entry: PasswordEntry, masterKey: string): PasswordEntry {
    try {
      const decryptedPassword = CryptoJS.AES.decrypt(
        entry.password,
        masterKey
      ).toString(CryptoJS.enc.Utf8);
      return {
        ...entry,
        password: decryptedPassword,
      };
    } catch (error) {
      console.error("Decryption error:", error);
      return entry; // Return encrypted version if decryption fails
    }
  }
}

export const db = new PasswordDatabase();
