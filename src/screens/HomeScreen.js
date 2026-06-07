import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import MapView, { UrlTile } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import useLocation from "../hooks/useLocation";
import { colors } from "../theme/Theme";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { location, speed, error, loading } = useLocation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: -18.8792,
            longitude: 47.5079,
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
          }}
          showsUserLocation={true}
          showsCompass={true}
          region={
            location
              ? {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.015,
                }
              : undefined
          }
        >
          {/* OpenStreetMap Tiles */}
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
          />
        </MapView>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title}>Mitandrina AI</Text>
        <Text style={styles.subtitle}>Ton copilote intelligent</Text>

        <Text style={styles.speedText}>
          Vitesse actuelle :
          <Text style={styles.speedValue}> {loading ? "..." : speed} km/h</Text>
        </Text>

        {error && <Text style={styles.errorText}>⚠️ {error}</Text>}

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate("DrivingMode")}
        >
          <Text style={styles.startButtonText}>🚗 Démarrer la Conduite</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => navigation.navigate("Signaler")}
        >
          <Text style={styles.reportButtonText}>⚠️ Signaler un Danger</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Styles restent les mêmes...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  mapContainer: { flex: 1 },
  map: { width: "100%", height: "100%" },
  infoContainer: {
    padding: 20,
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: "center",
    marginBottom: 15,
  },
  speedText: { fontSize: 18, textAlign: "center", marginVertical: 10 },
  speedValue: { fontSize: 32, fontWeight: "bold", color: colors.success },
  startButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 12,
    marginVertical: 10,
    alignItems: "center",
  },
  startButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  reportButton: {
    backgroundColor: colors.warning,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  reportButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
  errorText: { color: "red", textAlign: "center", marginVertical: 8 },
});
