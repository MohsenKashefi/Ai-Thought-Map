import type { MindMap } from "../types/mindmap";

export interface SavedMindMap {
  id: string;
  mindMap: MindMap;
  userInput: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "ai-thought-maps";

/**
 * Storage service for managing saved mind maps in localStorage
 */
export class MindMapStorage {
  /**
   * Get all saved mind maps
   */
  static getAll(): SavedMindMap[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error("Error loading saved mind maps:", error);
      return [];
    }
  }

  /**
   * Save a new mind map
   */
  static save(mindMap: MindMap, userInput: string): SavedMindMap {
    const saved: SavedMindMap = {
      id: this.generateId(),
      mindMap,
      userInput,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const all = this.getAll();
    all.unshift(saved); // Add to beginning of array

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      return saved;
    } catch (error) {
      console.error("Error saving mind map:", error);
      throw new Error("Failed to save mind map. Storage might be full.");
    }
  }

  /**
   * Update an existing mind map
   */
  static update(id: string, mindMap: MindMap, userInput: string): SavedMindMap | null {
    const all = this.getAll();
    const index = all.findIndex((item) => item.id === id);

    if (index === -1) return null;

    all[index] = {
      ...all[index],
      mindMap,
      userInput,
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      return all[index];
    } catch (error) {
      console.error("Error updating mind map:", error);
      throw new Error("Failed to update mind map.");
    }
  }

  /**
   * Get a single mind map by ID
   */
  static getById(id: string): SavedMindMap | null {
    const all = this.getAll();
    return all.find((item) => item.id === id) || null;
  }

  /**
   * Delete a mind map
   */
  static delete(id: string): boolean {
    const all = this.getAll();
    const filtered = all.filter((item) => item.id !== id);

    if (filtered.length === all.length) {
      return false; // ID not found
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error("Error deleting mind map:", error);
      throw new Error("Failed to delete mind map.");
    }
  }

  /**
   * Delete all saved mind maps
   */
  static deleteAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing all mind maps:", error);
      throw new Error("Failed to clear all mind maps.");
    }
  }

  /**
   * Export all mind maps as JSON
   */
  static exportAsJSON(): string {
    const all = this.getAll();
    return JSON.stringify(all, null, 2);
  }

  /**
   * Import mind maps from JSON
   */
  static importFromJSON(jsonString: string): number {
    try {
      const imported: SavedMindMap[] = JSON.parse(jsonString);

      if (!Array.isArray(imported)) {
        throw new Error("Invalid format: expected an array");
      }

      const existing = this.getAll();
      const merged = [...existing];

      // Add imported items that don't already exist
      let addedCount = 0;
      for (const item of imported) {
        if (!existing.some((e) => e.id === item.id)) {
          merged.push(item);
          addedCount++;
        }
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return addedCount;
    } catch (error) {
      console.error("Error importing mind maps:", error);
      throw new Error("Failed to import mind maps. Invalid JSON format.");
    }
  }

  /**
   * Generate a unique ID
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get storage usage info
   */
  static getStorageInfo(): { count: number; sizeKB: number } {
    const all = this.getAll();
    const data = localStorage.getItem(STORAGE_KEY) || "";
    const sizeKB = Math.round((new Blob([data]).size) / 1024);

    return {
      count: all.length,
      sizeKB,
    };
  }
}
