import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Trip } from "../types";
import { databaseService } from "../services/DatabaseService";

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadTrips = async () => {
    try {
      const loadedTrips = await databaseService.getTrips();
      setTrips(loadedTrips);
    } catch (error) {
      console.error("Error loading trips:", error);
      Alert.alert("Hata", "Geziler yüklenirken bir hata oluştu.");
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadTrips();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrips();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR");
  };

  const renderTripItem = ({ item }: { item: Trip }) => (
    <TouchableOpacity
      style={styles.tripItem}
      onPress={() => navigation.navigate("TripDetail", { tripId: item.id })}
    >
      <Text style={styles.tripTitle}>{item.title}</Text>
      <Text style={styles.tripDate}>
        {formatDate(item.startDate)} - {formatDate(item.endDate)}
      </Text>
      {item.description && (
        <Text style={styles.tripDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Henüz gezi planınız yok</Text>
      <Text style={styles.emptySubtitle}>
        İlk maceranızı planlamaya başlayın!
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate("CreateTrip")}
      >
        <Text style={styles.emptyButtonText}>İlk Gezimi Oluştur</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00B4D8" />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>PathWay</Text>
            <Text style={styles.headerSubtitle}>Maceralarinizi Planlayin</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate("Settings")}
          >
            <Text style={styles.settingsButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={trips}
        renderItem={renderTripItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CreateTrip")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
  },
  headerTextContainer: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 5,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  settingsButtonText: {
    fontSize: 18,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  tripItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  tripDate: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  tripDescription: {
    fontSize: 14,
    color: "#34495E",
    marginTop: 8,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#7F8C8D",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#95A5A6",
    textAlign: "center",
  },
  emptyButton: {
    backgroundColor: "#00B4D8",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  emptyButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: 40,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabText: {
    fontSize: 24,
    color: "#2C3E50",
    fontWeight: "bold",
  },
});
