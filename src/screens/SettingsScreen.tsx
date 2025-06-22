import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { settingsService } from "../services/SettingsService";
import { offlineMapService } from "../services/OfflineMapService";

interface SettingsScreenProps {
  navigation: any;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [offlineMode, setOfflineMode] = useState(false);
  const [autoDownloadMaps, setAutoDownloadMaps] = useState(false);
  const [downloadedMaps, setDownloadedMaps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [offline, autoDownload, maps] = await Promise.all([
        settingsService.getOfflineMode(),
        settingsService.getAutoDownloadMaps(),
        offlineMapService.getDownloadedMaps(),
      ]);
      setOfflineMode(offline);
      setAutoDownloadMaps(autoDownload);
      setDownloadedMaps(maps);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const handleOfflineModeToggle = async (value: boolean) => {
    try {
      await settingsService.setOfflineMode(value);
      setOfflineMode(value);
    } catch (error) {
      console.error("Error updating offline mode:", error);
      Alert.alert("Hata", "Ayar guncellendiginde bir hata olustu.");
    }
  };

  const handleAutoDownloadToggle = async (value: boolean) => {
    try {
      await settingsService.setAutoDownloadMaps(value);
      setAutoDownloadMaps(value);
    } catch (error) {
      console.error("Error updating auto download:", error);
      Alert.alert("Hata", "Ayar guncellendiginde bir hata olustu.");
    }
  };

  const handleDownloadMap = async () => {
    setIsLoading(true);
    try {
      const mapName = `Istanbul_${Date.now()}`;
      await offlineMapService.downloadMap(mapName);
      await loadSettings();
      Alert.alert("Basarili", "Harita basariyla indirildi!");
    } catch (error) {
      console.error("Error downloading map:", error);
      Alert.alert("Hata", "Harita indirilirken bir hata olustu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMap = async (mapName: string) => {
    Alert.alert(
      "Haritayi Sil",
      `"${mapName}" haritasini silmek istediginizden emin misiniz?`,
      [
        { text: "Iptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await offlineMapService.deleteMap(mapName);
              await loadSettings();
              Alert.alert("Basarili", "Harita basariyla silindi!");
            } catch (error) {
              console.error("Error deleting map:", error);
              Alert.alert("Hata", "Harita silinirken bir hata olustu.");
            }
          },
        },
      ]
    );
  };

  const clearAllMaps = async () => {
    Alert.alert(
      "Tum Haritalari Sil",
      "Tum indirilmis haritalari silmek istediginizden emin misiniz?",
      [
        { text: "Iptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await offlineMapService.clearAllMaps();
              await loadSettings();
              Alert.alert("Basarili", "Tum haritalar basariyla silindi!");
            } catch (error) {
              console.error("Error clearing maps:", error);
              Alert.alert("Hata", "Haritalar silinirken bir hata olustu.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00B4D8" />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Ayarlar</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Uygulama Ayarlari</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Cevrimdisi Mod</Text>
                <Text style={styles.settingDescription}>
                  Internet baglantisi olmadan da haritalari kullanin
                </Text>
              </View>
              <Switch
                value={offlineMode}
                onValueChange={handleOfflineModeToggle}
                trackColor={{ false: "#E9ECEF", true: "#90E0EF" }}
                thumbColor={offlineMode ? "#00B4D8" : "#ADB5BD"}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Otomatik Harita Indirme</Text>
                <Text style={styles.settingDescription}>
                  Gezi olustururken haritalari otomatik indir
                </Text>
              </View>
              <Switch
                value={autoDownloadMaps}
                onValueChange={handleAutoDownloadToggle}
                trackColor={{ false: "#E9ECEF", true: "#90E0EF" }}
                thumbColor={autoDownloadMaps ? "#00B4D8" : "#ADB5BD"}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Cevrimdisi Haritalar</Text>
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={handleDownloadMap}
                disabled={isLoading}
              >
                <Text style={styles.downloadButtonText}>
                  {isLoading ? "Indiriliyor..." : "Harita Indir"}
                </Text>
              </TouchableOpacity>
            </View>

            {downloadedMaps.length === 0 ? (
              <View style={styles.emptyMaps}>
                <Text style={styles.emptyTitle}>Henuz harita indirilmemis</Text>
                <Text style={styles.emptySubtitle}>
                  Cevrimdisi kullanim icin harita indirin
                </Text>
              </View>
            ) : (
              <View style={styles.mapsList}>
                {downloadedMaps.map((mapName, index) => (
                  <View key={index} style={styles.mapItem}>
                    <View style={styles.mapInfo}>
                      <Text style={styles.mapName}>{mapName}</Text>
                      <Text style={styles.mapSize}>
                        Cevrimdisi kullanilabilir
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteMapButton}
                      onPress={() => handleDeleteMap(mapName)}
                    >
                      <Text style={styles.deleteMapText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                {downloadedMaps.length > 1 && (
                  <TouchableOpacity
                    style={styles.clearAllButton}
                    onPress={clearAllMaps}
                  >
                    <Text style={styles.clearAllText}>Tum Haritalari Sil</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Uygulama Bilgileri</Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Versiyon</Text>
                <Text style={styles.infoValue}>1.0.0</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Gelistirici</Text>
                <Text style={styles.infoValue}>PathWay Team</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Lisans</Text>
                <Text style={styles.infoValue}>MIT</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#00B4D8",
    padding: 20,
    paddingTop: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 28,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  mainContent: {
    flex: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    color: "#2C3E50",
    marginBottom: 16,
    fontWeight: "600",
  },
  settingItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: "#2C3E50",
    fontWeight: "600",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#6C757D",
    lineHeight: 18,
  },
  downloadButton: {
    backgroundColor: "#00B4D8",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  downloadButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  emptyMaps: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7F8C8D",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#95A5A6",
    textAlign: "center",
  },
  mapsList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  mapInfo: {
    flex: 1,
  },
  mapName: {
    fontSize: 16,
    color: "#2C3E50",
    fontWeight: "500",
    marginBottom: 4,
  },
  mapSize: {
    fontSize: 14,
    color: "#6C757D",
  },
  deleteMapButton: {
    padding: 8,
  },
  deleteMapText: {
    fontSize: 16,
  },
  clearAllButton: {
    backgroundColor: "#DC3545",
    padding: 16,
    alignItems: "center",
  },
  clearAllText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  infoLabel: {
    fontSize: 16,
    color: "#2C3E50",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    color: "#6C757D",
  },
});
