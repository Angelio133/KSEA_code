import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Colors } from "../theme/colors";

const REPORT_TYPES = [
  {
    id: "1",
    label: "Accident Récent",
    icon: "car-crash",
    color: Colors.danger,
  },
  {
    id: "2",
    label: "Zone Dangereuse",
    icon: "alert-octagon",
    color: Colors.primary,
  },
  {
    id: "3",
    label: "Embouteillage Hard",
    icon: "traffic-light",
    color: Colors.accent,
  },
  { id: "4", label: "Chaussée Inondée", icon: "water", color: "#33B5E5" },
];

export default function ReportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Signalement Rapide</Text>
      <Text style={styles.subHeader}>
        Alertez la communauté d'Antananarivo en un clic.
      </Text>

      <View style={styles.grid}>
        {REPORT_TYPES.map((item) => (
          <TouchableOpacity key={item.id} style={styles.card}>
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: item.color + "15" },
              ]}
            >
              <Icon name={item.icon} size={38} color={item.color} />
            </View>
            <Text style={styles.cardLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.vocalAction}>
        <Icon name="microphone" size={26} color={Colors.background} />
        <Text style={styles.vocalText}>SIGNALER PAR LA VOIX</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
    paddingTop: 60,
  },
  header: { color: Colors.text, fontSize: 26, fontWeight: "bold" },
  subHeader: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 35,
    marginTop: 5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "47%",
    backgroundColor: Colors.surface,
    borderRadius: 22,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
  },
  iconWrapper: { padding: 14, borderRadius: 50, marginBottom: 12 },
  cardLabel: {
    color: Colors.text,
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  vocalAction: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  vocalText: {
    color: Colors.background,
    fontWeight: "800",
    marginLeft: 8,
    fontSize: 15,
  },
});
