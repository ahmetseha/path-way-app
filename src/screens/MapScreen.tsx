import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  StatusBar,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { Location as LocationType } from "../types";
import { databaseService } from "../services/DatabaseService";

interface MapScreenProps {
  navigation: any;
  route: any;
}

export default function MapScreen({ navigation, route }: MapScreenProps) {
  const { tripId } = route.params;
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(null);
  const [region, setRegion] = useState({
    latitude: 41.0082, // İstanbul default
    longitude: 28.9784,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationDescription, setNewLocationDescription] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    loadLocations();
    getCurrentLocation();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadLocations();
    }, [tripId])
  );

  const loadLocations = async () => {
    try {
      const locationsData = await databaseService.getLocationsByTrip(tripId);
      setLocations(locationsData);
    } catch (error) {
      console.error("Error loading locations:", error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("İzin Gerekli", "Konum izni gereklidir.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      console.error("Error getting current location:", error);
    }
  };

  const handleMapPress = (event: any) => {
    setSelectedLocation(event.nativeEvent.coordinate);
    setShowAddModal(true);
  };

  const handleAddLocation = async () => {
    if (!newLocationName.trim() || !selectedLocation) {
      Alert.alert("Hata", "Lutfen konum adini girin.");
      return;
    }

    try {
      await databaseService.createLocation({
        tripId,
        name: newLocationName.trim(),
        description: newLocationDescription.trim(),
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        address: `${selectedLocation.latitude.toFixed(
          6
        )}, ${selectedLocation.longitude.toFixed(6)}`,
      });

      setShowAddModal(false);
      setNewLocationName("");
      setNewLocationDescription("");
      setSelectedLocation(null);
      loadLocations();
      Alert.alert("Basarili", "Konum basariyla eklendi!");
    } catch (error) {
      console.error("Error adding location:", error);
      Alert.alert("Hata", "Konum eklenirken bir hata olustu.");
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    Alert.alert("Konumu Sil", "Bu konumu silmek istediğinizden emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await databaseService.deleteLocation(locationId);
            loadLocations();
          } catch (error) {
            console.error("Error deleting location:", error);
            Alert.alert("Hata", "Konum silinirken bir hata oluştu.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00B4D8" />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Harita</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
            >
              <Text style={styles.locationButtonText}>📍</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          {locations.map((location) => (
            <Marker
              key={location.id}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title={location.name}
              description={location.description || location.address}
            >
              <Callout>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{location.name}</Text>
                  {location.description && (
                    <Text style={styles.calloutDescription}>
                      {location.description}
                    </Text>
                  )}
                  <Text style={styles.calloutAddress}>{location.address}</Text>
                  <TouchableOpacity
                    style={styles.calloutDeleteButton}
                    onPress={() => handleDeleteLocation(location.id)}
                  >
                    <Text style={styles.calloutDeleteText}>Sil</Text>
                  </TouchableOpacity>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      </View>

      <View style={styles.locationBadge}>
        <Text style={styles.locationBadgeText}>{locations.length} durak</Text>
      </View>

      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Durak Ekle</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Durak Adı *</Text>
              <TextInput
                style={styles.textInput}
                value={newLocationName}
                onChangeText={setNewLocationName}
                placeholder="Örn: Ayasofya"
                placeholderTextColor="#ADB5BD"
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Açıklama</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newLocationDescription}
                onChangeText={setNewLocationDescription}
                placeholder="Durak hakkında detaylar..."
                placeholderTextColor="#ADB5BD"
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>

            {selectedLocation && (
              <View style={styles.coordinatesInfo}>
                <Text style={styles.coordinatesLabel}>Koordinatlar</Text>
                <Text style={styles.coordinatesText}>
                  {selectedLocation.latitude.toFixed(6)},{" "}
                  {selectedLocation.longitude.toFixed(6)}
                </Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddLocation}
              >
                <Text style={styles.addButtonText}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: 30,
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
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  locationButtonText: {
    fontSize: 18,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  locationBadge: {
    position: "absolute",
    top: 130,
    right: 20,
    backgroundColor: "#00B4D8",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  locationBadgeText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  calloutContainer: {
    width: 200,
    padding: 8,
  },
  calloutTitle: {
    fontSize: 16,
    color: "#2C3E50",
    fontWeight: "600",
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 4,
  },
  calloutAddress: {
    fontSize: 12,
    color: "#ADB5BD",
    marginBottom: 8,
  },
  calloutDeleteButton: {
    backgroundColor: "#DC3545",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  calloutDeleteText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    color: "#2C3E50",
    fontWeight: "600",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  closeButtonText: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 28,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#2C3E50",
    marginBottom: 8,
    fontWeight: "600",
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    color: "#2C3E50",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  coordinatesInfo: {
    backgroundColor: "#90E0EF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  coordinatesLabel: {
    fontSize: 14,
    color: "#2C3E50",
    fontWeight: "600",
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 14,
    color: "#6C757D",
    fontFamily: "monospace",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#E9ECEF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#6C757D",
    fontWeight: "600",
  },
  addButton: {
    flex: 1,
    backgroundColor: "#00B4D8",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
