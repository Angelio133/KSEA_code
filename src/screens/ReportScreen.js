import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../theme/Theme";

export default function ReportScreen() {
  const navigation = useNavigation();
  const [riskType, setRiskType] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const riskOptions = [
    { label: "Nid-de-poule", value: "pothole" },
    { label: "Accident / Point noir", value: "blackspot" },
    { label: "Animal sur la route", value: "animal" },
    { label: "Éboulement", value: "landslide" },
    { label: "Inondation", value: "flood" },
    { label: "Virage dangereux", value: "curve" },
  ];

  const handleSubmit = () => {
    setSubmitting(true);
    // Simulation d'envoi
    setTimeout(() => {
      alert("✅ Signalement envoyé ! Merci pour votre contribution.");
      navigation.goBack();
      setSubmitting(false);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Signaler un Danger</Text>
        <Text style={styles.subtitle}>
          Aidez à rendre les routes plus sûres
        </Text>

        <Text style={styles.label}>Type de danger :</Text>
        <View style={styles.optionsContainer}>
          {riskOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                riskType === option.value && styles.optionSelected,
              ]}
              onPress={() => setRiskType(option.value)}
            >
              <Text
                style={
                  riskType === option.value
                    ? styles.optionTextSelected
                    : styles.optionText
                }
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Description (optionnel) :</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Gros trou au milieu de la route..."
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={!riskType || submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? "Envoi en cours..." : "Envoyer le Signalement"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: colors.textLight, marginBottom: 25 },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: colors.text,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 25,
  },
  optionButton: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: { color: colors.text },
  optionTextSelected: { color: "white" },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 25,
  },
  submitButton: {
    backgroundColor: colors.danger,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
