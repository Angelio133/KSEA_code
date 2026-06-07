import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import useLocation from "../hooks/useLocation";
import RiskAlert from "../components/RiskAlert";
import { colors } from "../theme/Theme";

export default function DrivingModeScreen() {
  const navigation = useNavigation();
  const { location, speed, error } = useLocation();

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("medium");

  // Simulation d'alertes selon la vitesse et la position (à améliorer plus tard)
  useEffect(() => {
    if (speed > 65) {
      setAlertMessage("Vitesse excessive ! Ralentissez");
      setAlertType("high");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    } else if (speed > 50) {
      setAlertMessage("Attention - Zone urbaine");
      setAlertType("medium");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 4000);
    }
  }, [speed]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mitandrina AI</Text>
      </View>

      {/* Vitesse principale */}
      <View style={styles.speedContainer}>
        <Text style={styles.speedLabel}>VITESSE ACTUELLE</Text>
        <Text style={styles.speedValue}>
          {speed} <Text style={styles.unit}>km/h</Text>
        </Text>
      </View>

      {/* Alerte dynamique */}
      <RiskAlert
        visible={showAlert}
        type={alertType}
        message={alertMessage}
        subMessage="Point noir détecté à proximité"
      />

      {/* Informations supplémentaires */}
      <View style={styles.infoBottom}>
        <Text style={styles.routeText}>RN7 - Direction Sud</Text>
        <Text style={styles.statusText}>Vigilance Active • GPS Connecté</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      {/* Bouton d'urgence */}
      <TouchableOpacity style={styles.emergencyButton}>
        <Text style={styles.emergencyText}>🚨 SIGNALER URGENCE</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#1E2937",
  },
  backButton: { color: "#60A5FA", fontSize: 18 },
  title: { color: "white", fontSize: 20, fontWeight: "bold" },

  speedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  speedLabel: {
    color: "#94A3B8",
    fontSize: 18,
    marginBottom: 10,
  },
  speedValue: {
    color: "white",
    fontSize: 92,
    fontWeight: "bold",
  },
  unit: {
    fontSize: 28,
    fontWeight: "normal",
  },

  infoBottom: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  routeText: { color: "#94A3B8", fontSize: 16 },
  statusText: {
    color: "#4ADE80",
    fontSize: 17,
    fontWeight: "600",
    marginTop: 5,
  },
  errorText: { color: "#FF6B6B", fontSize: 14, marginTop: 5 },

  emergencyButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#EF4444",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  emergencyText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
