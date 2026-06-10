import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  ActivityIndicator,
  Platform,
  Easing,
} from "react-native";
import MapView, { UrlTile } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import useLocation from "../hooks/useLocation";
import { colors } from "../theme/Theme";
import { BlurView } from "expo-blur";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { location, speed, error, loading } = useLocation();

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const scaleStartButton = useRef(new Animated.Value(1)).current;
  const scaleReportButton = useRef(new Animated.Value(1)).current;
  const speedAnim = useRef(new Animated.Value(0)).current;

  const currentSpeed = loading ? "..." : Math.round(speed || 0);

  // GPS Badge Pulse
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // Speed Value Animation
  useEffect(() => {
    Animated.timing(speedAnim, {
      toValue: currentSpeed === "..." ? 0 : currentSpeed,
      duration: 800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
  }, [currentSpeed]);

  const handlePressIn = (scaleRef) => {
    Animated.spring(scaleRef, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = (scaleRef) => {
    Animated.spring(scaleRef, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    }).start();
  };

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.35],
  });

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
          showsUserLocation
          showsCompass
          showsMyLocationButton
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
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
          />
        </MapView>

        {/* GPS Pulse Badge */}
        <Animated.View
          style={[styles.gpsBadge, { transform: [{ scale: pulseScale }] }]}
        >
          <View style={styles.liveDot} />
          <Text style={styles.gpsText}>
            {location ? "GPS actif" : "Recherche GPS"}
          </Text>
        </Animated.View>
      </View>

      <BlurView intensity={90} tint="light" style={styles.infoContainer}>
        <View style={styles.grabber} />

        <Text style={styles.title}>Mitandrina AI</Text>
        <Text style={styles.subtitle}>Ton copilote intelligent</Text>

        {/* Speed Card */}
        <View style={styles.speedCard}>
          <Text style={styles.speedLabel}>VITESSE ACTUELLE</Text>
          <View style={styles.speedRow}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.success} />
            ) : (
              <Animated.Text style={styles.speedValue}>
                {speedAnim
                  .interpolate({
                    inputRange: [0, 200],
                    outputRange: [0, speedAnim._value],
                    extrapolate: "clamp",
                  })
                  .__getValue()}
              </Animated.Text>
            )}
            <Text style={styles.speedUnit}>km/h</Text>
          </View>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Start Driving Button */}
        <Animated.View style={{ transform: [{ scale: scaleStartButton }] }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("DrivingMode")}
            onPressIn={() => handlePressIn(scaleStartButton)}
            onPressOut={() => handlePressOut(scaleStartButton)}
            style={styles.startButton}
          >
            <Text style={styles.startButtonIcon}>🚗</Text>
            <View style={styles.buttonTextBox}>
              <Text style={styles.startButtonText}>Démarrer la conduite</Text>
              <Text style={styles.startButtonSubText}>
                Navigation et prévention active
              </Text>
            </View>
            <Text style={styles.buttonArrow}>›</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Report Button */}
        <Animated.View style={{ transform: [{ scale: scaleReportButton }] }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Signaler")}
            onPressIn={() => handlePressIn(scaleReportButton)}
            onPressOut={() => handlePressOut(scaleReportButton)}
            style={styles.reportButton}
          >
            <Text style={styles.reportButtonIcon}>⚠️</Text>
            <View style={styles.buttonTextBox}>
              <Text style={styles.reportButtonText}>Signaler un danger</Text>
              <Text style={styles.reportButtonSubText}>
                Aider les autres conducteurs
              </Text>
            </View>
            <Text style={styles.buttonArrow}>›</Text>
          </TouchableOpacity>
        </Animated.View>
      </BlurView>
    </SafeAreaView>
  );
}

// Les styles restent similaires mais avec ombre + glass + glow sur boutons
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  mapContainer: { flex: 1 },
  map: { width: "100%", height: "100%" },

  gpsBadge: {
    position: "absolute",
    top: 18,
    left: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(28,28,30,0.86)",
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 999,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
    marginRight: 8,
  },
  gpsText: { color: "#fff", fontWeight: "800", fontSize: 12 },

  infoContainer: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 22,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "rgba(255,255,255,0.92)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 14,
  },
  grabber: {
    width: 46,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#D1D1D6",
    alignSelf: "center",
    marginBottom: 14,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: colors.primary,
    textAlign: "center",
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textLight,
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "600",
  },

  speedCard: {
    backgroundColor: "#F8F8FB",
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: "center",
    marginBottom: 14,
  },
  speedLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.textLight,
    letterSpacing: 1,
    marginBottom: 6,
  },
  speedRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    minHeight: 44,
  },
  speedValue: {
    fontSize: 40,
    fontWeight: "900",
    color: colors.success,
    lineHeight: 44,
  },
  speedUnit: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textLight,
    marginLeft: 6,
  },

  errorBox: {
    backgroundColor: "rgba(255,59,48,0.1)",
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "800",
  },

  startButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.26,
    shadowRadius: 18,
    elevation: 10,
  },
  startButtonIcon: { fontSize: 26, marginRight: 12 },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warning,
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: colors.warning,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 15,
    elevation: 8,
  },
  reportButtonIcon: { fontSize: 24, marginRight: 12 },

  buttonTextBox: { flex: 1 },
  startButtonText: { color: "#fff", fontSize: 17, fontWeight: "900" },
  startButtonSubText: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },
  reportButtonText: { color: "#fff", fontSize: 16, fontWeight: "900" },
  reportButtonSubText: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },
  buttonArrow: {
    fontSize: 34,
    fontWeight: "300",
    color: "#fff",
    marginLeft: 8,
  },
});
