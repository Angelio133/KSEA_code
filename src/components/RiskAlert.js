import React from "react";
import { View, Text, StyleSheet, Vibration } from "react-native";
import { colors } from "../theme/Theme";

export default function RiskAlert({
  visible,
  type,
  message,
  subMessage,
  onClose,
}) {
  if (!visible) return null;

  // Vibration selon le niveau de risque
  React.useEffect(() => {
    if (visible) {
      Vibration.vibrate([500, 300, 500]);
    }
  }, [visible]);

  const getColor = () => {
    if (type === "high") return colors.danger;
    if (type === "medium") return colors.warning;
    return colors.primary;
  };

  return (
    <View style={[styles.alertContainer, { backgroundColor: getColor() }]}>
      <Text style={styles.alertTitle}>
        {type === "high" ? "⚠️ DANGER IMMINENT" : "⚠️ ATTENTION"}
      </Text>
      <Text style={styles.alertMessage}>{message}</Text>
      {subMessage && <Text style={styles.alertSubMessage}>{subMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  alertContainer: {
    position: "absolute",
    top: 80,
    left: 20,
    right: 20,
    padding: 20,
    borderRadius: 15,
    zIndex: 1000,
    elevation: 10,
  },
  alertTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  alertMessage: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    marginVertical: 8,
  },
  alertSubMessage: {
    color: "#FFEDD5",
    fontSize: 15,
    textAlign: "center",
  },
});
