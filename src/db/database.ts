import Dexie from "dexie";
import CryptoJS from "crypto-js";

export interface PasswordEntry {
  id?: number;
  username: string;
  password: string;
  website?: string;
  dateCreated: Date;
  dateModified: Date;
}

class PasswordDatabase extends Dexie {
  passwords: Dexie.Table<PasswordEntry, number>;

  constructor() {
    super("PasswordManagerDB");
    this.version(2).stores({
      passwords: "++id,username,website,dateCreated,dateModified",
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
    // Only export essential fields
    const simplifiedEntries = entries.map((entry) => ({
      username: entry.username,
      password: entry.password,
      website: entry.website || "",
    }));
    return JSON.stringify(simplifiedEntries);
  }

  // Import password data
  async importData(jsonData: string, masterKey: string): Promise<void> {
    try {
      const importedData = JSON.parse(jsonData);
      const now = new Date();

      // Handle data imports with the simplified format
      const entries: PasswordEntry[] = importedData.map((item: any) => ({
        username: item.username,
        password: item.password,
        website: item.website || "",
        dateCreated: item.dateCreated ? new Date(item.dateCreated) : now,
        dateModified: item.dateModified ? new Date(item.dateModified) : now,
      }));

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
