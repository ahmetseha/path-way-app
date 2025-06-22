import * as SQLite from "expo-sqlite";
import { Trip, Location, Route } from "../types";

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  async initDatabase(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.db = await SQLite.openDatabaseAsync("pathway.db");
      await this.createTables();
      this.isInitialized = true;
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Database initialization error:", error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS trips (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        tripId TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        address TEXT,
        visitDate TEXT,
        notes TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (tripId) REFERENCES trips (id) ON DELETE CASCADE
      );
    `);

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS routes (
        id TEXT PRIMARY KEY,
        tripId TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (tripId) REFERENCES trips (id) ON DELETE CASCADE
      );
    `);
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initDatabase();
    }
  }

  // Trip operations
  async createTrip(
    trip: Omit<Trip, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Database not initialized");

    const id = Date.now().toString();
    const now = new Date().toISOString();

    await this.db.runAsync(
      "INSERT INTO trips (id, title, description, startDate, endDate, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        trip.title,
        trip.description || null,
        trip.startDate,
        trip.endDate,
        now,
        now,
      ]
    );

    return id;
  }

  async getTrips(): Promise<Trip[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getAllAsync(
      "SELECT * FROM trips ORDER BY createdAt DESC"
    );
    return result as Trip[];
  }

  async getTrip(id: string): Promise<Trip | null> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getFirstAsync(
      "SELECT * FROM trips WHERE id = ?",
      [id]
    );
    return result as Trip | null;
  }

  async updateTrip(id: string, updates: Partial<Trip>): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Database not initialized");

    const now = new Date().toISOString();
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updates).map((val) =>
      val === undefined ? null : val
    );
    values.push(now, id);

    await this.db.runAsync(
      `UPDATE trips SET ${fields}, updatedAt = ? WHERE id = ?`,
      values
    );
  }

  async deleteTrip(id: string): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Database not initialized");

    await this.db.runAsync("DELETE FROM trips WHERE id = ?", [id]);
  }

  // Location operations
  async createLocation(
    location: Omit<Location, "id" | "createdAt">
  ): Promise<string> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Database not initialized");

    const id = Date.now().toString();
    const now = new Date().toISOString();

    await this.db.runAsync(
      "INSERT INTO locations (id, tripId, name, description, latitude, longitude, address, visitDate, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        location.tripId,
        location.name,
        location.description || null,
        location.latitude,
        location.longitude,
        location.address || null,
        location.visitDate || null,
        location.notes || null,
        now,
      ]
    );

    return id;
  }

  async getLocationsByTrip(tripId: string): Promise<Location[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getAllAsync(
      "SELECT * FROM locations WHERE tripId = ? ORDER BY createdAt",
      [tripId]
    );
    return result as Location[];
  }

  async updateLocation(id: string, updates: Partial<Location>): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Database not initialized");

    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updates).map((val) =>
      val === undefined ? null : val
    );
    values.push(id);

    await this.db.runAsync(
      `UPDATE locations SET ${fields} WHERE id = ?`,
      values
    );
  }

  async deleteLocation(id: string): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error("Database not initialized");

    await this.db.runAsync("DELETE FROM locations WHERE id = ?", [id]);
  }
}

export const databaseService = new DatabaseService();
