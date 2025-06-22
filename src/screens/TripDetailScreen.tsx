import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Trip, Location } from "../types";
import { databaseService } from "../services/DatabaseService";

interface TripDetailScreenProps {
  navigation: any;
  route: any;
}

export default function TripDetailScreen({
  navigation,
  route,
}: TripDetailScreenProps) {
  const { tripId } = route.params;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTripData = async () => {
    try {
      setIsLoading(true);
      const [tripData, locationsData] = await Promise.all([
        databaseService.getTrip(tripId),
        databaseService.getLocationsByTrip(tripId),
      ]);
      setTrip(tripData);
      setLocations(locationsData);
    } catch (error) {
      console.error("Error loading trip data:", error);
      Alert.alert("Hata", "Gezi bilgileri yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTripData();
  }, [tripId]);

  useFocusEffect(
    React.useCallback(() => {
      loadTripData();
    }, [tripId])
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR");
  };

  const handleDeleteTrip = () => {
    Alert.alert(
      "Geziyi Sil",
      "Bu geziyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await databaseService.deleteTrip(tripId);
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting trip:", error);
              Alert.alert("Hata", "Gezi silinirken bir hata oluştu.");
            }
          },
        },
      ]
    );
  };

  if (isLoading || !trip) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00B4D8" />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              {trip?.title || "Gezi Detayı"}
            </Text>
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
        <View style={styles.tripInfo}>
          <View style={styles.tripInfoHeader}>
            <Text style={styles.tripDates}>
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </Text>
            <TouchableOpacity
              style={styles.deleteTripButton}
              onPress={handleDeleteTrip}
            >
              <Text style={styles.deleteTripButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
          {trip.description && (
            <Text style={styles.tripDescription}>{trip.description}</Text>
          )}
        </View>

        <View style={styles.locationsSection}>
          <Text style={styles.sectionTitle}>Duraklar ({locations.length})</Text>

          {locations.length === 0 ? (
            <View style={styles.emptyLocations}>
              <Text style={styles.emptyTitle}>Henüz durak eklenmemiş</Text>
              <Text style={styles.emptySubtitle}>
                Gezinize duraklar ekleyerek rotanızı oluşturun
              </Text>
              <TouchableOpacity
                style={styles.addLocationButton}
                onPress={() => navigation.navigate("Map", { tripId })}
              >
                <Text style={styles.addLocationButtonText}>Durak Ekle</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.locationsList}>
              {locations.map((location, index) => (
                <View key={location.id} style={styles.locationItem}>
                  <View style={styles.locationNumber}>
                    <Text style={styles.locationNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.locationContent}>
                    <Text style={styles.locationName}>{location.name}</Text>
                    <Text style={styles.locationAddress}>
                      {location.address}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.locationDeleteButton}
                    onPress={async () => {
                      try {
                        await databaseService.deleteLocation(location.id);
                        loadTripData();
                      } catch (error) {
                        console.error("Error deleting location:", error);
                        Alert.alert(
                          "Hata",
                          "Durak silinirken bir hata oluştu."
                        );
                      }
                    }}
                  >
                    <Text style={styles.locationDeleteText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => navigation.navigate("Map", { tripId })}
        >
          <Text style={styles.mapButtonText}>🗺️ Haritayı Aç</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6C757D",
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
  tripInfo: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tripInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  tripDates: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
  },
  deleteTripButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#DC3545",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteTripButtonText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  tripDescription: {
    fontSize: 14,
    color: "#7F8C8D",
    lineHeight: 20,
  },
  locationsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 16,
  },
  emptyLocations: {
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
    marginBottom: 20,
  },
  addLocationButton: {
    backgroundColor: "#00B4D8",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addLocationButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  locationsList: {
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
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  locationNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#00B4D8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  locationNumberText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  locationContent: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    color: "#2C3E50",
    fontWeight: "500",
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: "#6C757D",
  },
  locationDeleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#DC3545",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  locationDeleteText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  mapButton: {
    backgroundColor: "#00B4D8",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  mapButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
