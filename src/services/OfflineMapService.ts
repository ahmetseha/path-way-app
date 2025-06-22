import * as FileSystem from "expo-file-system";
import { OfflineMap } from "../types";

class OfflineMapService {
  private baseDir = `${FileSystem.documentDirectory}offline_maps/`;

  async initOfflineMaps(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.baseDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.baseDir, {
          intermediates: true,
        });
      }
    } catch (error) {
      console.error("Error initializing offline maps directory:", error);
    }
  }

  async downloadMapRegion(
    region: {
      latitude: number;
      longitude: number;
      latitudeDelta: number;
      longitudeDelta: number;
    },
    name: string,
    zoomLevel: number = 12
  ): Promise<string> {
    try {
      await this.initOfflineMaps();

      const mapId = `map_${Date.now()}`;
      const mapDir = `${this.baseDir}${mapId}/`;
      await FileSystem.makeDirectoryAsync(mapDir, { intermediates: true });

      // Simulate download progress
      console.log(`Starting download for: ${name}`);

      // Create a simple mock tile file for testing
      const mockTileContent = `Mock tile data for ${name}`;
      const tilePath = `${mapDir}mock_tile.png`;
      await FileSystem.writeAsStringAsync(tilePath, mockTileContent);

      // Simulate download delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Save map metadata
      const metadata: OfflineMap = {
        id: mapId,
        name,
        region,
        downloadedAt: new Date().toISOString(),
        fileSize: mockTileContent.length, // Mock file size
      };

      const metadataPath = `${mapDir}metadata.json`;
      await FileSystem.writeAsStringAsync(
        metadataPath,
        JSON.stringify(metadata)
      );

      console.log(`Download completed for: ${name}`);
      return mapId;
    } catch (error) {
      console.error("Error downloading map region:", error);
      throw error;
    }
  }

  async getOfflineMaps(): Promise<OfflineMap[]> {
    try {
      await this.initOfflineMaps();
      const maps: OfflineMap[] = [];

      const mapDirs = await FileSystem.readDirectoryAsync(this.baseDir);

      for (const mapDir of mapDirs) {
        try {
          const metadataPath = `${this.baseDir}${mapDir}/metadata.json`;
          const metadataContent = await FileSystem.readAsStringAsync(
            metadataPath
          );
          const metadata = JSON.parse(metadataContent) as OfflineMap;
          maps.push(metadata);
        } catch (error) {
          console.error(`Error reading metadata for ${mapDir}:`, error);
        }
      }

      return maps;
    } catch (error) {
      console.error("Error getting offline maps:", error);
      return [];
    }
  }

  async deleteOfflineMap(mapId: string): Promise<void> {
    try {
      const mapDir = `${this.baseDir}${mapId}/`;
      const dirInfo = await FileSystem.getInfoAsync(mapDir);

      if (dirInfo.exists) {
        await FileSystem.deleteAsync(mapDir);
      }
    } catch (error) {
      console.error("Error deleting offline map:", error);
      throw error;
    }
  }

  async getMapTileUrl(
    mapId: string,
    x: number,
    y: number,
    zoom: number
  ): Promise<string | null> {
    try {
      const tilePath = `${this.baseDir}${mapId}/mock_tile.png`;
      const tileInfo = await FileSystem.getInfoAsync(tilePath);

      if (tileInfo.exists) {
        return `file://${tilePath}`;
      }

      return null;
    } catch (error) {
      console.error("Error getting map tile URL:", error);
      return null;
    }
  }

  // Helper method to check if offline maps are available
  async hasOfflineMaps(): Promise<boolean> {
    try {
      const maps = await this.getOfflineMaps();
      return maps.length > 0;
    } catch (error) {
      return false;
    }
  }

  // Helper method to get total storage used
  async getTotalStorageUsed(): Promise<number> {
    try {
      const maps = await this.getOfflineMaps();
      return maps.reduce((total, map) => total + map.fileSize, 0);
    } catch (error) {
      return 0;
    }
  }

  // Get list of downloaded map names
  async getDownloadedMaps(): Promise<string[]> {
    try {
      const maps = await this.getOfflineMaps();
      return maps.map((map) => map.name);
    } catch (error) {
      console.error("Error getting downloaded maps:", error);
      return [];
    }
  }

  // Download a map with a simple name
  async downloadMap(mapName: string): Promise<string> {
    try {
      const region = {
        latitude: 41.0082, // Istanbul
        longitude: 28.9784,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

      return await this.downloadMapRegion(region, mapName);
    } catch (error) {
      console.error("Error downloading map:", error);
      throw error;
    }
  }

  // Delete a map by name
  async deleteMap(mapName: string): Promise<void> {
    try {
      const maps = await this.getOfflineMaps();
      const mapToDelete = maps.find((map) => map.name === mapName);

      if (mapToDelete) {
        await this.deleteOfflineMap(mapToDelete.id);
      } else {
        throw new Error(`Map with name "${mapName}" not found`);
      }
    } catch (error) {
      console.error("Error deleting map:", error);
      throw error;
    }
  }

  // Clear all downloaded maps
  async clearAllMaps(): Promise<void> {
    try {
      const maps = await this.getOfflineMaps();

      for (const map of maps) {
        await this.deleteOfflineMap(map.id);
      }
    } catch (error) {
      console.error("Error clearing all maps:", error);
      throw error;
    }
  }
}

export const offlineMapService = new OfflineMapService();
