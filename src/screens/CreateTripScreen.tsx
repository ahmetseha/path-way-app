import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { databaseService } from "../services/DatabaseService";

interface CreateTripScreenProps {
  navigation: any;
}

export default function CreateTripScreen({
  navigation,
}: CreateTripScreenProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("tr-TR");
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      if (selectedDate > endDate) {
        setEndDate(selectedDate);
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate && selectedDate >= startDate) {
      setEndDate(selectedDate);
    } else if (selectedDate) {
      Alert.alert("Hata", "Bitiş tarihi başlangıç tarihinden önce olamaz.");
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert("Hata", "Lütfen gezi başlığını girin.");
      return false;
    }
    if (startDate > endDate) {
      Alert.alert("Hata", "Bitiş tarihi başlangıç tarihinden önce olamaz.");
      return false;
    }
    return true;
  };

  const handleCreateTrip = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await databaseService.createTrip({
        title: title.trim(),
        description: description.trim(),
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      });

      Alert.alert("Başarılı", "Gezi başarıyla oluşturuldu!", [
        {
          text: "Tamam",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error creating trip:", error);
      Alert.alert("Hata", "Gezi oluşturulurken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00B4D8" />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Yeni Gezi</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Gezi Başlığı *</Text>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Örn: İstanbul Macerası"
                placeholderTextColor="#ADB5BD"
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Açıklama</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Geziniz hakkında detaylar..."
                placeholderTextColor="#ADB5BD"
                multiline
                numberOfLines={4}
                maxLength={200}
              />
            </View>

            <View style={styles.dateSection}>
              <Text style={styles.sectionTitle}>Tarih Seçimi</Text>

              <View style={styles.dateRow}>
                <View style={styles.dateInputGroup}>
                  <Text style={styles.inputLabel}>Başlangıç</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowStartPicker(true)}
                  >
                    <Text style={styles.dateButtonText}>
                      {formatDate(startDate)}
                    </Text>
                    <Text style={styles.dateIcon}>📅</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.dateInputGroup}>
                  <Text style={styles.inputLabel}>Bitiş</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowEndPicker(true)}
                  >
                    <Text style={styles.dateButtonText}>
                      {formatDate(endDate)}
                    </Text>
                    <Text style={styles.dateIcon}>📅</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.createButton,
                isLoading && styles.createButtonDisabled,
              ]}
              onPress={handleCreateTrip}
              disabled={isLoading}
            >
              <Text style={styles.createButtonText}>
                {isLoading ? "Oluşturuluyor..." : "Geziyi Oluştur"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
          minimumDate={new Date()}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
          minimumDate={startDate}
        />
      )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formContainer: {
    flex: 1,
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
    minHeight: 100,
    textAlignVertical: "top",
  },
  dateSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    color: "#2C3E50",
    marginBottom: 16,
    fontWeight: "600",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateInputGroup: {
    flex: 1,
    marginRight: 16,
  },
  dateButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#2C3E50",
    fontWeight: "500",
  },
  dateIcon: {
    fontSize: 18,
  },
  createButton: {
    backgroundColor: "#00B4D8",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
