import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";
import * as Speech from "expo-speech";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Colors } from "../theme/colors";

// Points critiques réels à Antananarivo pour la démo
const MOCK_DANGERS = [
  {
    id: "1",
    title: "Axe Analakely",
    desc: "Risque élevé d'accrochage - Trafic dense",
    lat: -18.905,
    lng: 47.52,
    level: "high",
  },
  {
    id: "2",
    title: "Anosy (Rond-point)",
    desc: "Chaussée dégradée - Ralentissement brutal",
    lat: -18.915,
    lng: 47.523,
    level: "medium",
  },
];

export default function VigilanceScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [currentAlerte, setCurrentAlerte] = useState(MOCK_DANGERS[0]); // Alerte active par défaut

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission de localisation refusée");
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);
    })();
  }, []);

  // Fonctionnalité : Alerte Vocale IA
  const déclencherAlerteVocale = (alerte) => {
    setCurrentAlerte(alerte);
    const message = `Attention. Approche d'une zone de vigilance. ${alerte.title}. ${alerte.desc}.`;

    Speech.speak(message, {
      language: "fr-FR",
      pitch: 1.0,
      rate: 0.95,
    });
  };

  if (!location && !errorMsg) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>
          Initialisation du moteur de vigilance GPS...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location ? location.latitude : -18.913,
          longitude: location ? location.longitude : 47.5224,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {/* Position de l'utilisateur en temps réel */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
          >
            <View style={styles.userMarker}>
              <View style={styles.userMarkerPulse} />
            </View>
          </Marker>
        )}

        {/* Zones de danger de l'infrastructure d'Antananarivo */}
        {MOCK_DANGERS.map((danger) => (
          <React.Fragment key={danger.id}>
            <Marker
              coordinate={{ latitude: danger.lat, longitude: danger.lng }}
              onPress={() => déclencherAlerteVocale(danger)}
            >
              <View
                style={[
                  styles.markerContainer,
                  {
                    borderColor:
                      danger.level === "high" ? Colors.danger : Colors.primary,
                  },
                ]}
              >
                <Icon
                  name="radar"
                  size={22}
                  color={
                    danger.level === "high" ? Colors.danger : Colors.primary
                  }
                />
              </View>
            </Marker>
            <Circle
              center={{ latitude: danger.lat, longitude: danger.lng }}
              radius={200}
              fillColor={
                danger.level === "high"
                  ? "rgba(255, 75, 75, 0.15)"
                  : "rgba(255, 215, 0, 0.15)"
              }
              strokeColor={
                danger.level === "high" ? Colors.danger : Colors.primary
              }
              strokeWidth={1}
            />
          </React.Fragment>
        ))}
      </MapView>

      {/* Panneau de Monitoring Cyberpunk / IA */}
      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <View style={styles.aiBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.aiText}>SYSTEM VIGILANCE ACTIF</Text>
          </View>
          <TouchableOpacity
            style={styles.audioButton}
            onPress={() => déclencherAlerteVocale(currentAlerte)}
          >
            <Icon name="volume-high" color={Colors.background} size={18} />
          </TouchableOpacity>
        </View>

        <Text style={styles.cardTitle}>{currentAlerte.title}</Text>
        <Text style={styles.cardDesc}>{currentAlerte.desc}</Text>

        <View style={styles.divider} />

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>
            Statut :{" "}
            <Text
              style={{
                color:
                  currentAlerte.level === "high"
                    ? Colors.danger
                    : Colors.primary,
                fontWeight: "bold",
              }}
            >
              CRITIQUE
            </Text>
          </Text>
          <Text style={styles.metaLabel}>
            Confiance IA :{" "}
            <Text style={{ color: Colors.accent, fontWeight: "bold" }}>
              94%
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0C" },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0B0B0C",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#AAAAAA",
    marginTop: 15,
    fontSize: 13,
    letterSpacing: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },

  // Style Utilisateur
  userMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#00E5FF",
    borderWidth: 2,
    borderColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  userMarkerPulse: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0, 229, 255, 0.3)",
    position: "absolute",
  },

  // Style Marqueurs Dangers
  markerContainer: {
    backgroundColor: "#141416",
    padding: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  // Panneau IA Carte info
  infoCard: {
    position: "absolute",
    bottom: 30,
    left: 16,
    right: 16,
    backgroundColor: "#141416",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 229, 255, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    marginRight: 6,
  },
  aiText: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  audioButton: { backgroundColor: Colors.accent, padding: 8, borderRadius: 10 },

  cardTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  cardDesc: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: 14,
  },
  metaRow: { flexDirection: "row", justifyContent: "space-between" },
  metaLabel: { color: "#888888", fontSize: 12, letterSpacing: 0.5 },
});
