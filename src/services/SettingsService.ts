import AsyncStorage from "@react-native-async-storage/async-storage";

interface AppSettings {
  useOfflineMode: boolean;
  autoDownloadMaps: boolean;
  lastDownloadedRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

class SettingsService {
  private readonly SETTINGS_KEY = "pathway_settings";

  async getSettings(): Promise<AppSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(this.SETTINGS_KEY);
      if (settingsJson) {
        return JSON.parse(settingsJson);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }

    // Default settings
    return {
      useOfflineMode: false,
      autoDownloadMaps: false,
    };
  }

  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem(
        this.SETTINGS_KEY,
        JSON.stringify(newSettings)
      );
    } catch (error) {
      console.error("Error saving settings:", error);
      throw error;
    }
  }

  async updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      currentSettings[key] = value;
      await AsyncStorage.setItem(
        this.SETTINGS_KEY,
        JSON.stringify(currentSettings)
      );
    } catch (error) {
      console.error("Error updating setting:", error);
      throw error;
    }
  }

  async getOfflineMode(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.useOfflineMode;
  }

  async setOfflineMode(enabled: boolean): Promise<void> {
    await this.updateSetting("useOfflineMode", enabled);
  }

  async getAutoDownloadMaps(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.autoDownloadMaps;
  }

  async setAutoDownloadMaps(enabled: boolean): Promise<void> {
    await this.updateSetting("autoDownloadMaps", enabled);
  }

  async getLastDownloadedRegion() {
    const settings = await this.getSettings();
    return settings.lastDownloadedRegion;
  }

  async setLastDownloadedRegion(region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }): Promise<void> {
    await this.updateSetting("lastDownloadedRegion", region);
  }
}

export const settingsService = new SettingsService();
