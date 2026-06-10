import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { I18nextProvider } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Speech from "expo-speech";

import i18n from "./Src/i18n/i18n";
import MapScreen from "./Src/screens/MapScreen";
import useLocation from "./Src/hooks/useLocation";

import { COLORS, GRADIENTS } from "./Src/theme/Theme";
import { KNOWN_DESTINATIONS } from "./Src/constants/Destinations";
import { BLACK_SPOTS } from "./Src/constants/BlackSpots";

const { width, height } = Dimensions.get("window");

const APP_LOGO = require("./Src/assets/logo.png");

const VISUAL_ALERT_DISTANCE_METERS = 500;
const VOICE_ALERT_DISTANCE_METERS = 200;

function getDistanceMeters(pointA, pointB) {
  if (!pointA || !pointB) return null;

  const R = 6371000;
  const lat1 = (pointA.latitude * Math.PI) / 180;
  const lat2 = (pointB.latitude * Math.PI) / 180;
  const deltaLat = ((pointB.latitude - pointA.latitude) * Math.PI) / 180;
  const deltaLng = ((pointB.longitude - pointA.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function formatDangerDistance(meters) {
  if (meters === null || meters === undefined || Number.isNaN(meters)) {
    return "--";
  }

  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("map");

  const [destination, setDestination] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const [destinationCoords, setDestinationCoords] = useState(null);

  const [isRouteActive, setIsRouteActive] = useState(false);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [isResolvingDestination, setIsResolvingDestination] = useState(false);
  const [destinationError, setDestinationError] = useState("");
  const [routeInfo, setRouteInfo] = useState(null);

  const { location: userLocation, speed, gpsError } = useLocation();

  const inputRef = useRef(null);
  const spokenDangerIdsRef = useRef(new Set());

  const introOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.72)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const orbitAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const welcomeAnim = useRef(new Animated.Value(0)).current;

  const dangersWithDistance = useMemo(() => {
    if (!userLocation) return BLACK_SPOTS;

    return BLACK_SPOTS.map((spot) => ({
      ...spot,
      distance: getDistanceMeters(userLocation, spot),
    })).sort((a, b) => (a.distance || 999999) - (b.distance || 999999));
  }, [userLocation]);

  const nearestDanger = dangersWithDistance[0] || null;

  const activeDanger =
    isRouteActive &&
    nearestDanger?.distance !== undefined &&
    nearestDanger.distance <= VISUAL_ALERT_DISTANCE_METERS
      ? nearestDanger
      : null;

  const voiceDanger =
    isRouteActive &&
    nearestDanger?.distance !== undefined &&
    nearestDanger.distance <= VOICE_ALERT_DISTANCE_METERS
      ? nearestDanger
      : null;

  useEffect(() => {
    if (!isRouteActive) {
      spokenDangerIdsRef.current.clear();
      Speech.stop();
      return;
    }

    if (!voiceDanger) return;

    const dangerId = String(voiceDanger.id);

    if (spokenDangerIdsRef.current.has(dangerId)) {
      return;
    }

    spokenDangerIdsRef.current.add(dangerId);

    const dangerDistance = formatDangerDistance(voiceDanger.distance);

    const message = `Attention. Danger proche à ${dangerDistance}. ${voiceDanger.description} Ralentissez et gardez une distance de sécurité.`;

    Speech.stop();
    Speech.speak(message, {
      language: "fr-FR",
      pitch: 1,
      rate: 0.92,
    });
  }, [
    isRouteActive,
    voiceDanger?.id,
    voiceDanger?.distance,
    voiceDanger?.description,
  ]);

  useEffect(() => {
    if (currentPage !== 1) return;

    introOpacity.setValue(0);
    logoScale.setValue(0.72);
    floatAnim.setValue(0);
    pulseAnim.setValue(0);
    orbitAnim.setValue(0);
    shineAnim.setValue(0);
    particleAnim.setValue(0);
    buttonAnim.setValue(0);
    welcomeAnim.setValue(0);

    Animated.parallel([
      Animated.timing(introOpacity, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 42,
        useNativeDriver: true,
      }),
      Animated.timing(welcomeAnim, {
        toValue: 1,
        duration: 900,
        delay: 100,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.spring(buttonAnim, {
        toValue: 1,
        friction: 7,
        tension: 48,
        delay: 520,
        useNativeDriver: true,
      }),
    ]).start();

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const orbitLoop = Animated.loop(
      Animated.timing(orbitAnim, {
        toValue: 1,
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    const shineLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shineAnim, {
          toValue: 0,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const particleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(particleAnim, {
          toValue: 1,
          duration: 3100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(particleAnim, {
          toValue: 0,
          duration: 3100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    floatLoop.start();
    pulseLoop.start();
    orbitLoop.start();
    shineLoop.start();
    particleLoop.start();

    return () => {
      floatLoop.stop();
      pulseLoop.stop();
      orbitLoop.stop();
      shineLoop.stop();
      particleLoop.stop();
    };
  }, [
    currentPage,
    introOpacity,
    logoScale,
    floatAnim,
    pulseAnim,
    orbitAnim,
    shineAnim,
    particleAnim,
    buttonAnim,
    welcomeAnim,
  ]);

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -16],
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.18],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.16, 0.36],
  });

  const orbitRotate = orbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const reverseOrbitRotate = orbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["360deg", "0deg"],
  });

  const shineTranslate = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-160, 160],
  });

  const particleY = particleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -24],
  });

  const particleOpacity = particleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.18, 1, 0.18],
  });

  const welcomeY = welcomeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-18, 0],
  });

  const buttonScale = buttonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.72, 1],
  });

  const startApp = () => setCurrentPage(2);

  const openDestinationModal = () => {
    setDestinationInput(destination);
    setDestinationError("");
    setIsSearchModalVisible(true);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 250);
  };

  const geocodeDestination = async (query) => {
    const cleanedQuery = String(query || "").trim();

    if (!cleanedQuery) {
      throw new Error("Entrez une destination.");
    }

    const url =
      "https://nominatim.openstreetmap.org/search" +
      "?format=json" +
      "&limit=1" +
      "&addressdetails=1" +
      "&countrycodes=mg" +
      `&q=${encodeURIComponent(`${cleanedQuery}, Madagascar`)}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Accept-Language": "fr",
        "User-Agent": "MitandrinaAI/1.0 (prototype)",
        Referer: "https://mitandrina-ai.local",
      },
    });

    if (!response.ok) {
      throw new Error("Impossible de contacter le service de géocodage.");
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Destination introuvable. Essayez un nom plus précis.");
    }

    return {
      latitude: Number(data[0].lat),
      longitude: Number(data[0].lon),
      displayName: data[0].display_name,
    };
  };

  const handleSelectDestination = async (name, coords = null) => {
    const finalDestination = String(name || "").trim();

    if (!finalDestination) {
      setDestinationError("Entrez une destination avant de continuer.");
      return;
    }

    try {
      setIsResolvingDestination(true);
      setDestinationError("");

      const knownCoords = coords || KNOWN_DESTINATIONS[finalDestination];
      const resolvedCoords = knownCoords
        ? knownCoords
        : await geocodeDestination(finalDestination);

      setDestination(finalDestination);
      setDestinationInput(finalDestination);
      setDestinationCoords({
        latitude: Number(resolvedCoords.latitude),
        longitude: Number(resolvedCoords.longitude),
      });

      setRouteInfo(null);
      setIsRouteActive(true);
      setActiveTab("map");
      setIsSearchModalVisible(false);
    } catch (error) {
      setDestinationError(
        error?.message ||
          "Impossible de trouver cette destination. Essayez encore.",
      );
    } finally {
      setIsResolvingDestination(false);
    }
  };

  const cancelRoute = () => {
    Speech.stop();
    spokenDangerIdsRef.current.clear();

    setIsRouteActive(false);
    setDestination("");
    setDestinationInput("");
    setDestinationCoords(null);
    setRouteInfo(null);
    setActiveTab("map");
  };

  const routeStats = {
    eta: routeInfo?.durationText || (isRouteActive ? "Calcul..." : "--"),
    distance: routeInfo?.distanceText || (isRouteActive ? "Calcul..." : "--"),
    dangerDistance: activeDanger
      ? formatDangerDistance(activeDanger.distance)
      : nearestDanger?.distance
        ? formatDangerDistance(nearestDanger.distance)
        : "500 m",
    voiceDistance: voiceDanger
      ? formatDangerDistance(voiceDanger.distance)
      : "200 m",
    from: userLocation ? "Votre position" : "Analakely",
  };

  return (
    <I18nextProvider i18n={i18n}>
      <SafeAreaProvider>
        <View style={styles.globalContainer}>
          {currentPage === 1 && (
            <View style={styles.splashContainer}>
              <LinearGradient
                colors={GRADIENTS.splash}
                locations={[0, 0.36, 0.74, 1]}
                style={styles.splashBackground}
              />

              <View style={styles.splashEffectsLayer}>
                <LinearGradient
                  colors={[
                    "rgba(11,143,85,0.22)",
                    "rgba(11,143,85,0.06)",
                    "transparent",
                  ]}
                  style={[styles.auroraBlob, styles.auroraBlobOne]}
                />
                <LinearGradient
                  colors={[
                    "rgba(226,30,38,0.16)",
                    "rgba(226,30,38,0.04)",
                    "transparent",
                  ]}
                  style={[styles.auroraBlob, styles.auroraBlobTwo]}
                />
                <LinearGradient
                  colors={[
                    "rgba(47,53,69,0.16)",
                    "rgba(47,53,69,0.04)",
                    "transparent",
                  ]}
                  style={[styles.auroraBlob, styles.auroraBlobThree]}
                />

                <View style={[styles.depthLine, styles.depthLineOne]} />
                <View style={[styles.depthLine, styles.depthLineTwo]} />
                <View style={[styles.depthLine, styles.depthLineThree]} />
                <View style={[styles.depthLine, styles.depthLineFour]} />

                <View style={[styles.radarCircle, styles.radarCircleOne]} />
                <View style={[styles.radarCircle, styles.radarCircleTwo]} />
                <View style={[styles.radarCircle, styles.radarCircleThree]} />

                <Animated.View
                  style={[
                    styles.particle,
                    styles.particleOne,
                    {
                      opacity: particleOpacity,
                      transform: [{ translateY: particleY }],
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.particle,
                    styles.particleTwo,
                    {
                      opacity: particleOpacity,
                      transform: [{ translateY: particleY }],
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.particle,
                    styles.particleThree,
                    {
                      opacity: particleOpacity,
                      transform: [{ translateY: particleY }],
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.particle,
                    styles.particleFour,
                    {
                      opacity: particleOpacity,
                      transform: [{ translateY: particleY }],
                    },
                  ]}
                />
              </View>

              <Animated.Text
                style={[
                  styles.welcomeText,
                  {
                    opacity: welcomeAnim,
                    transform: [{ translateY: welcomeY }],
                  },
                ]}
              >
                Bienvenue
              </Animated.Text>

              <Animated.View
                style={[
                  styles.centralHalo,
                  {
                    opacity: pulseOpacity,
                    transform: [{ scale: pulseScale }],
                  },
                ]}
              />

              <Animated.View
                style={[
                  styles.logoStage,
                  {
                    opacity: introOpacity,
                    transform: [{ scale: logoScale }, { translateY: floatY }],
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.orbitRing,
                    styles.orbitRingLarge,
                    { transform: [{ rotate: orbitRotate }] },
                  ]}
                >
                  <View style={styles.orbitDotGreen} />
                </Animated.View>

                <Animated.View
                  style={[
                    styles.orbitRing,
                    styles.orbitRingMedium,
                    { transform: [{ rotate: reverseOrbitRotate }] },
                  ]}
                >
                  <View style={styles.orbitDotRed} />
                </Animated.View>

                <Animated.View
                  style={[
                    styles.orbitRing,
                    styles.orbitRingSmall,
                    { transform: [{ rotate: orbitRotate }] },
                  ]}
                >
                  <View style={styles.orbitDotDark} />
                </Animated.View>

                <Animated.View
                  style={[
                    styles.radarPulseRing,
                    {
                      opacity: pulseOpacity,
                      transform: [{ scale: pulseScale }],
                    },
                  ]}
                />

                <View style={styles.logoShadowDisc} />
                <View style={styles.logoWhiteAura} />

                <View style={styles.logoOnlyFrame}>
                  <Image source={APP_LOGO} style={styles.logoOnlyImage} />
                  <Animated.View
                    style={[
                      styles.logoSweep,
                      {
                        transform: [
                          { rotate: "-18deg" },
                          { translateY: shineTranslate },
                        ],
                      },
                    ]}
                  />
                </View>
              </Animated.View>

              <Animated.View
                style={[
                  styles.launchButtonWrapper,
                  {
                    opacity: buttonAnim,
                    transform: [{ scale: buttonScale }],
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={startApp}
                  activeOpacity={0.87}
                  style={styles.launchButtonTouchable}
                >
                  <LinearGradient
                    colors={GRADIENTS.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.launchButton}
                  >
                    <View style={styles.launchButtonGloss} />
                    <Text style={styles.launchButtonText}>Entrer</Text>
                    <Text style={styles.launchArrow}>➜</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}

          {currentPage === 2 && (
            <View style={styles.mainContainer}>
              <View style={styles.contentArea}>
                {activeTab === "map" && (
                  <MapScreen
                    userLocation={userLocation}
                    speed={speed}
                    gpsError={gpsError}
                    isRouteActive={isRouteActive}
                    destination={destination}
                    destinationCoords={destinationCoords}
                    blackSpots={BLACK_SPOTS}
                    onRouteInfoChange={setRouteInfo}
                    onOpenCopilot={() => setActiveTab("copilot")}
                    onReportDanger={() => setActiveTab("danger_zones")}
                  />
                )}

                {activeTab === "danger_zones" && (
                  <LinearGradient
                    colors={[COLORS.background, "#EEF7F2", "#FFFFFF"]}
                    style={styles.premiumScreen}
                  >
                    <SafeAreaView style={styles.safeFull} edges={["top"]}>
                      <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.tabScrollContent}
                      >
                        <PremiumHeader
                          kicker="SURVEILLANCE ROUTIÈRE"
                          title="Signaux de danger"
                          subtitle="Analyse des zones à risque, incidents signalés et points noirs autour du trajet."
                        />

                        <LinearGradient
                          colors={GRADIENTS.road}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.dangerHeroCard}
                        >
                          <View style={styles.dangerHeroGlow} />
                          <View style={styles.heroIconBox}>
                            <Text style={styles.heroIcon}>
                              {voiceDanger ? "🔊" : activeDanger ? "⚠️" : "🛡️"}
                            </Text>
                          </View>
                          <View style={styles.heroTextBox}>
                            <Text style={styles.heroTitle}>
                              {voiceDanger
                                ? "Intervention vocale du Copilot"
                                : activeDanger
                                  ? "Danger proche détecté"
                                  : "Surveillance active"}
                            </Text>
                            <Text style={styles.heroDesc}>
                              {voiceDanger
                                ? `${voiceDanger.title} est à ${formatDangerDistance(
                                    voiceDanger.distance,
                                  )}. Le Copilot intervient vocalement.`
                                : activeDanger
                                  ? `${activeDanger.title} est à ${formatDangerDistance(
                                      activeDanger.distance,
                                    )}.`
                                  : "Les zones sensibles sont surveillées autour de votre trajet."}
                            </Text>
                          </View>
                        </LinearGradient>

                        {dangersWithDistance.map((danger) => (
                          <SignalCard
                            key={danger.id}
                            badgeStyle={
                              danger.risk === "high"
                                ? styles.dangerBadgeHigh
                                : styles.dangerBadgeWarning
                            }
                            badge={
                              danger.risk === "high"
                                ? "Risque élevé"
                                : "Risque modéré"
                            }
                            distance={
                              danger.distance
                                ? formatDangerDistance(danger.distance)
                                : "Zone connue"
                            }
                            title={
                              danger.risk === "high"
                                ? `🔴 ${danger.title}`
                                : `🟠 ${danger.title}`
                            }
                            desc={danger.description}
                          />
                        ))}
                      </ScrollView>
                    </SafeAreaView>
                  </LinearGradient>
                )}

                {activeTab === "copilot" && (
                  <LinearGradient
                    colors={[COLORS.background, "#EEF7F2", "#FFFFFF"]}
                    style={styles.premiumScreen}
                  >
                    <SafeAreaView style={styles.safeFull} edges={["top"]}>
                      <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.tabScrollContent}
                      >
                        <PremiumHeader
                          kicker="ASSISTANT INTELLIGENT"
                          title="Copilot IA"
                          subtitle="Prévention visuelle à 500 m et intervention vocale à 200 m."
                        />

                        <LinearGradient
                          colors={
                            voiceDanger || activeDanger
                              ? GRADIENTS.copilotAlert
                              : GRADIENTS.copilotIdle
                          }
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.copilotHeroCard}
                        >
                          <View style={styles.copilotOrb} />
                          <View style={styles.heroIconBox}>
                            <Text style={styles.heroIcon}>
                              {voiceDanger ? "🔊" : activeDanger ? "🚨" : "🧠"}
                            </Text>
                          </View>
                          <View style={styles.heroTextBox}>
                            <Text style={styles.heroTitle}>
                              {voiceDanger
                                ? `Alerte vocale à ${formatDangerDistance(
                                    voiceDanger.distance,
                                  )}`
                                : activeDanger
                                  ? `Prévention à ${formatDangerDistance(
                                      activeDanger.distance,
                                    )}`
                                  : isRouteActive
                                    ? "Copilot IA actif"
                                    : "Copilot en veille active"}
                            </Text>
                            <Text style={styles.heroDesc}>
                              {voiceDanger
                                ? `${voiceDanger.description} Le Copilot vous demande de ralentir.`
                                : activeDanger
                                  ? `${activeDanger.description} Préparez-vous à ralentir.`
                                  : isRouteActive
                                    ? "Votre trajet est suivi. La voix se déclenche automatiquement à 200 m d’un danger."
                                    : "Choisissez une destination pour lancer l’analyse prédictive."}
                            </Text>
                          </View>
                        </LinearGradient>

                        {isRouteActive ? (
                          <View style={styles.aiDashboardCard}>
                            <MetricRow
                              label="Destination"
                              value={destination}
                            />
                            <MetricRow
                              label="Temps restant"
                              value={routeStats.eta}
                            />
                            <MetricRow
                              label="Distance"
                              value={routeStats.distance}
                            />
                            <MetricRow
                              label="Prévention visuelle"
                              value="500 m"
                            />
                            <MetricRow
                              label="Intervention vocale"
                              value={routeStats.voiceDistance}
                            />

                            <LinearGradient
                              colors={
                                voiceDanger || activeDanger
                                  ? [
                                      "rgba(226,30,38,0.16)",
                                      "rgba(226,30,38,0.06)",
                                    ]
                                  : [
                                      "rgba(11,143,85,0.18)",
                                      "rgba(11,143,85,0.07)",
                                    ]
                              }
                              style={styles.recommendationCard}
                            >
                              <Text
                                style={[
                                  styles.recommendationTitle,
                                  (voiceDanger || activeDanger) && {
                                    color: COLORS.secondaryDark,
                                  },
                                ]}
                              >
                                Recommandation IA
                              </Text>
                              <Text
                                style={[
                                  styles.recommendationText,
                                  (voiceDanger || activeDanger) && {
                                    color: COLORS.secondaryDark,
                                  },
                                ]}
                              >
                                {voiceDanger
                                  ? "Alerte vocale déclenchée. Ralentissez immédiatement, gardez une distance de sécurité et surveillez les piétons, véhicules et obstacles."
                                  : activeDanger
                                    ? "Danger détecté dans la zone de prévention. Réduisez progressivement la vitesse."
                                    : "Maintenez une vitesse stable, gardez une bonne distance de sécurité et restez attentif aux alertes."}
                              </Text>
                            </LinearGradient>
                          </View>
                        ) : (
                          <View style={styles.emptyStateCard}>
                            <Text style={styles.emptyStateIcon}>📍</Text>
                            <Text style={styles.emptyStateTitle}>
                              Aucune destination active
                            </Text>
                            <Text style={styles.emptyStateText}>
                              Retournez sur la carte pour activer le suivi IA.
                            </Text>
                          </View>
                        )}
                      </ScrollView>
                    </SafeAreaView>
                  </LinearGradient>
                )}
              </View>

              {activeTab === "map" && !isRouteActive && (
                <View
                  style={styles.centerPanelWrapper}
                  pointerEvents="box-none"
                >
                  <BlurView
                    intensity={60}
                    tint="light"
                    style={styles.destinationGlassCard}
                  >
                    <LinearGradient
                      colors={GRADIENTS.cardLight}
                      style={styles.destinationGlassInner}
                    >
                      <View style={styles.panelFloatingIcon}>
                        <LinearGradient
                          colors={GRADIENTS.primary}
                          style={styles.panelFloatingIconGradient}
                        >
                          <Text style={styles.panelFloatingIconText}>⌖</Text>
                        </LinearGradient>
                      </View>

                      <Text style={styles.destinationPanelTitle}>
                        Où souhaitez-vous aller ?
                      </Text>

                      <Text style={styles.destinationPanelText}>
                        Choisissez une destination pour lancer l’itinéraire, le
                        temps restant et la prévention IA.
                      </Text>

                      <TouchableOpacity
                        style={styles.destinationMainButton}
                        onPress={openDestinationModal}
                        activeOpacity={0.9}
                      >
                        <LinearGradient
                          colors={GRADIENTS.road}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.destinationMainButtonGradient}
                        >
                          <View style={styles.destinationPlusBox}>
                            <Text style={styles.destinationPlus}>＋</Text>
                          </View>
                          <View style={styles.destinationButtonTextBox}>
                            <Text style={styles.destinationButtonTitle}>
                              Choisir ma destination
                            </Text>
                            <Text style={styles.destinationButtonSub}>
                              Adresse, lieu, favori ou voix
                            </Text>
                          </View>
                          <Text style={styles.destinationButtonArrow}>›</Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      <View style={styles.quickChoiceRow}>
                        <QuickChip
                          text="📍 Adresse"
                          onPress={openDestinationModal}
                        />
                        <QuickChip
                          text="🏢 Ivato"
                          onPress={() =>
                            handleSelectDestination(
                              "Aéroport International d'Ivato",
                              KNOWN_DESTINATIONS[
                                "Aéroport International d'Ivato"
                              ],
                            )
                          }
                        />
                        <QuickChip
                          text="⭐ INSI"
                          onPress={() =>
                            handleSelectDestination(
                              "INSI Madagascar",
                              KNOWN_DESTINATIONS["INSI Madagascar"],
                            )
                          }
                        />
                        <QuickChip
                          text="🎤 Voix"
                          onPress={openDestinationModal}
                        />
                      </View>

                      <View style={styles.panelStatsBar}>
                        <View style={styles.panelStatItem}>
                          <Text style={styles.panelStatLabel}>Prévention</Text>
                          <Text style={styles.panelStatValue}>500 m</Text>
                        </View>
                        <View style={styles.panelStatDivider} />
                        <View style={styles.panelStatItem}>
                          <Text style={styles.panelStatLabel}>Voix IA</Text>
                          <Text style={styles.panelStatValue}>200 m</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </BlurView>
                </View>
              )}

              <Modal
                animationType="slide"
                transparent={true}
                visible={isSearchModalVisible}
                onRequestClose={() => setIsSearchModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <BlurView intensity={35} tint="dark" style={styles.modalBlur}>
                    <View style={styles.modalSheet}>
                      <View style={styles.modalGrabber} />

                      <View style={styles.modalHeader}>
                        <TouchableOpacity
                          style={styles.closeModalBtn}
                          onPress={() => setIsSearchModalVisible(false)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.closeModalText}>✕</Text>
                        </TouchableOpacity>

                        <View style={styles.modalHeaderTextBox}>
                          <Text style={styles.modalHeaderTitle}>
                            Choisir une destination
                          </Text>
                          <Text style={styles.modalHeaderSubtitle}>
                            Adresse → GPS → route réelle
                          </Text>
                        </View>
                      </View>

                      <View style={styles.modalInputWrapper}>
                        <View style={styles.inputIconCircle}>
                          <Text style={styles.inputDot}>📍</Text>
                        </View>

                        <TextInput
                          ref={inputRef}
                          style={styles.modalTextInput}
                          placeholder="Ex: Ivato, Analakely, Ambohijatovo..."
                          placeholderTextColor="#8E8E93"
                          value={destinationInput}
                          onChangeText={(text) => {
                            setDestinationInput(text);
                            setDestinationError("");
                          }}
                          autoFocus
                          returnKeyType="search"
                          onSubmitEditing={() =>
                            handleSelectDestination(destinationInput)
                          }
                        />

                        <TouchableOpacity
                          style={[
                            styles.validateInputBtn,
                            isResolvingDestination &&
                              styles.validateInputBtnDisabled,
                          ]}
                          onPress={() =>
                            handleSelectDestination(destinationInput)
                          }
                          activeOpacity={0.85}
                          disabled={isResolvingDestination}
                        >
                          {isResolvingDestination ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <Text style={styles.validateInputText}>OK</Text>
                          )}
                        </TouchableOpacity>
                      </View>

                      {destinationError ? (
                        <Text style={styles.destinationErrorText}>
                          {destinationError}
                        </Text>
                      ) : null}

                      <View style={styles.categoryGrid}>
                        <CategoryCard
                          icon="📍"
                          label="Adresse"
                          onPress={() => inputRef.current?.focus()}
                        />
                        <CategoryCard
                          icon="🏢"
                          label="Lieu"
                          onPress={() =>
                            handleSelectDestination(
                              "Aéroport International d'Ivato",
                              KNOWN_DESTINATIONS[
                                "Aéroport International d'Ivato"
                              ],
                            )
                          }
                        />
                        <CategoryCard
                          icon="⭐"
                          label="Favoris"
                          onPress={() =>
                            handleSelectDestination(
                              "INSI Madagascar",
                              KNOWN_DESTINATIONS["INSI Madagascar"],
                            )
                          }
                        />
                        <CategoryCard
                          icon="🎤"
                          label="Voix"
                          onPress={() =>
                            setDestinationError(
                              "Recherche vocale à connecter plus tard avec expo-speech ou expo-av.",
                            )
                          }
                        />
                      </View>

                      <ScrollView
                        style={styles.optionsList}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                      >
                        <Text style={styles.sectionDividerTitle}>ADRESSE</Text>

                        <OptionRow
                          icon="🗺️"
                          title="Rechercher l’adresse saisie"
                          subtitle={
                            destinationInput ||
                            "Entrez votre destination ci-dessus"
                          }
                          onPress={() =>
                            handleSelectDestination(destinationInput)
                          }
                        />

                        <Text style={styles.sectionDividerTitle}>
                          LIEUX CONNUS
                        </Text>

                        <OptionRow
                          icon="✈️"
                          title="Aéroport International d'Ivato"
                          subtitle="Lieu connu • Route réelle"
                          onPress={() =>
                            handleSelectDestination(
                              "Aéroport International d'Ivato",
                              KNOWN_DESTINATIONS[
                                "Aéroport International d'Ivato"
                              ],
                            )
                          }
                        />

                        <OptionRow
                          icon="🌳"
                          title="Jardin d'Ambohijatovo"
                          subtitle="Lieu connu • Centre-ville"
                          onPress={() =>
                            handleSelectDestination(
                              "Jardin d'Ambohijatovo",
                              KNOWN_DESTINATIONS["Jardin d'Ambohijatovo"],
                            )
                          }
                        />

                        <OptionRow
                          icon="🏙️"
                          title="Analakely"
                          subtitle="Lieu connu • Zone urbaine"
                          onPress={() =>
                            handleSelectDestination(
                              "Analakely",
                              KNOWN_DESTINATIONS.Analakely,
                            )
                          }
                        />

                        <Text style={styles.sectionDividerTitle}>FAVORIS</Text>

                        <OptionRow
                          icon="⭐"
                          title="INSI Madagascar"
                          subtitle="Favori • Campus universitaire"
                          onPress={() =>
                            handleSelectDestination(
                              "INSI Madagascar",
                              KNOWN_DESTINATIONS["INSI Madagascar"],
                            )
                          }
                        />
                      </ScrollView>
                    </View>
                  </BlurView>
                </View>
              </Modal>

              {activeTab === "map" && isRouteActive && (
                <SafeAreaView style={styles.routeActiveSummary} edges={["top"]}>
                  <BlurView
                    intensity={75}
                    tint="dark"
                    style={styles.summaryGlass}
                  >
                    <LinearGradient
                      colors={
                        voiceDanger || activeDanger
                          ? ["rgba(226,30,38,0.96)", "rgba(31,36,48,0.94)"]
                          : ["rgba(31,36,48,0.96)", "rgba(17,24,39,0.94)"]
                      }
                      style={styles.summaryBox}
                    >
                      <View style={styles.summaryHeader}>
                        <View style={styles.summaryTitleBox}>
                          <Text style={styles.summaryOverline}>
                            {voiceDanger
                              ? "ALERTE VOCALE IA"
                              : activeDanger
                                ? "ALERTE DANGER"
                                : "ITINÉRAIRE ACTIF"}
                          </Text>
                          <Text style={styles.summaryTitle} numberOfLines={1}>
                            {routeStats.from} → {destination}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.liveBadge,
                            (voiceDanger || activeDanger) &&
                              styles.liveBadgeAlert,
                          ]}
                        >
                          <Text
                            style={[
                              styles.liveBadgeText,
                              (voiceDanger || activeDanger) &&
                                styles.liveBadgeTextAlert,
                            ]}
                          >
                            {voiceDanger
                              ? "200 M"
                              : activeDanger
                                ? "500 M"
                                : "LIVE"}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.summaryRow}>
                        <SummaryMetric label="Temps" value={routeStats.eta} />
                        <SummaryMetric
                          label="Distance"
                          value={routeStats.distance}
                        />
                        <SummaryMetric
                          label="Alerte"
                          value={
                            voiceDanger
                              ? routeStats.voiceDistance
                              : routeStats.dangerDistance
                          }
                        />

                        <TouchableOpacity
                          style={styles.cancelRouteBtn}
                          onPress={cancelRoute}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.cancelRouteText}>Quitter</Text>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </BlurView>
                </SafeAreaView>
              )}

              <BlurView intensity={78} tint="light" style={styles.bottomTabBar}>
                <TabButton
                  active={activeTab === "map"}
                  icon="🗺️"
                  label="Carte"
                  onPress={() => setActiveTab("map")}
                />
                <TabButton
                  active={activeTab === "danger_zones"}
                  icon="⚠️"
                  label="Signaux"
                  onPress={() => setActiveTab("danger_zones")}
                />
                <TabButton
                  active={activeTab === "copilot"}
                  icon="🧠"
                  label="Copilot IA"
                  onPress={() => setActiveTab("copilot")}
                />
              </BlurView>
            </View>
          )}
        </View>
      </SafeAreaProvider>
    </I18nextProvider>
  );
}

function PremiumHeader({ kicker, title, subtitle }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionKicker}>{kicker}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );
}

function SignalCard({ badgeStyle, badge, distance, title, desc }) {
  return (
    <View style={styles.signalCard}>
      <View style={styles.signalTopRow}>
        <Text style={badgeStyle}>{badge}</Text>
        <Text style={styles.dangerDistance}>{distance}</Text>
      </View>
      <Text style={styles.signalTitle}>{title}</Text>
      <Text style={styles.signalDesc}>{desc}</Text>
    </View>
  );
}

function MetricRow({ label, value }) {
  return (
    <View style={styles.aiMetricRow}>
      <Text style={styles.aiMetricLabel}>{label}</Text>
      <Text style={styles.aiMetricValue}>{value}</Text>
    </View>
  );
}

function SummaryMetric({ label, value }) {
  return (
    <View style={styles.summaryMetric}>
      <Text style={styles.summaryMetricLabel}>{label}</Text>
      <Text style={styles.summaryMetricValue}>{value}</Text>
    </View>
  );
}

function QuickChip({ text, onPress }) {
  return (
    <TouchableOpacity
      style={styles.quickChoiceChip}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <Text style={styles.quickChoiceText}>{text}</Text>
    </TouchableOpacity>
  );
}

function CategoryCard({ icon, label, onPress }) {
  return (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={styles.categoryIcon}>{icon}</Text>
      <Text style={styles.categoryText}>{label}</Text>
    </TouchableOpacity>
  );
}

function OptionRow({ icon, title, subtitle, onPress }) {
  return (
    <TouchableOpacity
      style={styles.optionRow}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={styles.optionIcon}>{icon}</Text>
      <View style={styles.optionTextBox}>
        <Text style={styles.optionLabel}>{title}</Text>
        <Text style={styles.optionSubLabel}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

function TabButton({ active, icon, label, onPress }) {
  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View
        style={[styles.tabIconBubble, active && styles.tabIconBubbleActive]}
      >
        <Text style={styles.tabIcon}>{icon}</Text>
      </View>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  splashContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  splashBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  splashEffectsLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  auroraBlob: {
    position: "absolute",
    borderRadius: 999,
  },
  auroraBlobOne: {
    width: 500,
    height: 500,
    top: -190,
    right: -210,
  },
  auroraBlobTwo: {
    width: 420,
    height: 420,
    bottom: -160,
    left: -200,
  },
  auroraBlobThree: {
    width: 300,
    height: 300,
    bottom: 120,
    right: -130,
  },
  depthLine: {
    position: "absolute",
    width: width * 1.55,
    height: 2,
    backgroundColor: "rgba(11,143,85,0.07)",
    transform: [{ rotate: "-32deg" }],
  },
  depthLineOne: {
    top: height * 0.17,
    left: -130,
  },
  depthLineTwo: {
    top: height * 0.36,
    left: -160,
    backgroundColor: "rgba(226,30,38,0.055)",
  },
  depthLineThree: {
    bottom: height * 0.24,
    left: -140,
    backgroundColor: "rgba(47,53,69,0.055)",
  },
  depthLineFour: {
    bottom: height * 0.1,
    left: -90,
    backgroundColor: "rgba(11,143,85,0.052)",
  },
  radarCircle: {
    position: "absolute",
    alignSelf: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(11,143,85,0.09)",
  },
  radarCircleOne: {
    width: 340,
    height: 340,
    top: height * 0.29,
  },
  radarCircleTwo: {
    width: 510,
    height: 510,
    top: height * 0.19,
  },
  radarCircleThree: {
    width: 700,
    height: 700,
    top: height * 0.08,
  },
  particle: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 10,
    elevation: 8,
  },
  particleOne: {
    top: height * 0.2,
    left: width * 0.2,
  },
  particleTwo: {
    top: height * 0.32,
    right: width * 0.17,
    backgroundColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
  },
  particleThree: {
    bottom: height * 0.27,
    right: width * 0.22,
    backgroundColor: COLORS.dark,
    shadowColor: COLORS.dark,
  },
  particleFour: {
    bottom: height * 0.18,
    left: width * 0.24,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
  },
  welcomeText: {
    position: "absolute",
    top: height * 0.09,
    color: COLORS.primaryDark,
    fontSize: 44,
    fontWeight: "800",
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    letterSpacing: 1.2,
    textShadowColor: "rgba(11,143,85,0.18)",
    textShadowOffset: { width: 0, height: 7 },
    textShadowRadius: 14,
  },
  centralHalo: {
    position: "absolute",
    width: 470,
    height: 470,
    borderRadius: 235,
    backgroundColor: "rgba(11,143,85,0.14)",
  },
  logoStage: {
    width: 405,
    height: 405,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  orbitRing: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
  },
  orbitRingLarge: {
    width: 380,
    height: 380,
    borderColor: "rgba(11,143,85,0.22)",
  },
  orbitRingMedium: {
    width: 315,
    height: 315,
    borderColor: "rgba(226,30,38,0.18)",
  },
  orbitRingSmall: {
    width: 250,
    height: 250,
    borderColor: "rgba(47,53,69,0.18)",
  },
  orbitDotGreen: {
    position: "absolute",
    top: 32,
    left: 78,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  orbitDotRed: {
    position: "absolute",
    top: 80,
    right: 42,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  orbitDotDark: {
    position: "absolute",
    bottom: 32,
    left: 82,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: COLORS.dark,
    shadowColor: COLORS.dark,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  radarPulseRing: {
    position: "absolute",
    width: 275,
    height: 275,
    borderRadius: 138,
    borderWidth: 2,
    borderColor: "rgba(11,143,85,0.18)",
  },
  logoShadowDisc: {
    position: "absolute",
    width: 288,
    height: 288,
    borderRadius: 144,
    backgroundColor: "rgba(11,143,85,0.08)",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 30,
    elevation: 10,
  },
  logoWhiteAura: {
    position: "absolute",
    width: 258,
    height: 258,
    borderRadius: 129,
    backgroundColor: "rgba(255,255,255,0.48)",
    borderWidth: 1,
    borderColor: "rgba(11,143,85,0.12)",
  },
  logoOnlyFrame: {
    width: 280,
    height: 280,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  logoOnlyImage: {
    width: 265,
    height: 265,
    resizeMode: "contain",
  },
  logoSweep: {
    position: "absolute",
    width: 280,
    height: 48,
    backgroundColor: "rgba(255,255,255,0.34)",
  },
  launchButtonWrapper: {
    position: "absolute",
    bottom: height * 0.085,
  },
  launchButtonTouchable: {
    borderRadius: 999,
  },
  launchButton: {
    minWidth: 188,
    height: 72,
    borderRadius: 36,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.3,
    shadowRadius: 26,
    elevation: 16,
    overflow: "hidden",
  },
  launchButtonGloss: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.16)",
    top: -82,
    left: -22,
  },
  launchButtonText: {
    color: COLORS.textLight,
    fontSize: 19,
    fontWeight: "900",
    marginRight: 11,
  },
  launchArrow: {
    color: COLORS.textLight,
    fontSize: 25,
    fontWeight: "900",
    marginTop: -1,
  },

  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentArea: {
    flex: 1,
  },
  premiumScreen: {
    flex: 1,
  },
  safeFull: {
    flex: 1,
  },
  tabScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
  },
  sectionHeader: {
    marginBottom: 18,
  },
  sectionKicker: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginBottom: 7,
  },
  sectionTitle: {
    fontSize: 31,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: -0.9,
  },
  sectionSubtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    fontWeight: "600",
  },
  dangerHeroCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
    padding: 20,
    marginBottom: 18,
    overflow: "hidden",
    shadowColor: COLORS.dark3,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 26,
    elevation: 12,
  },
  copilotHeroCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
    padding: 20,
    marginBottom: 18,
    overflow: "hidden",
    shadowColor: COLORS.dark3,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 26,
    elevation: 12,
  },
  dangerHeroGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(226,30,38,0.24)",
    right: -70,
    top: -70,
  },
  copilotOrb: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(255,255,255,0.13)",
    right: -75,
    top: -80,
  },
  heroIconBox: {
    width: 60,
    height: 60,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.13)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  heroIcon: {
    fontSize: 30,
  },
  heroTextBox: {
    flex: 1,
  },
  heroTitle: {
    color: COLORS.textLight,
    fontSize: 18,
    fontWeight: "900",
  },
  heroDesc: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 5,
    fontWeight: "600",
  },
  signalCard: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 26,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.88)",
    shadowColor: COLORS.dark3,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },
  signalTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 11,
  },
  dangerBadgeHigh: {
    backgroundColor: "rgba(226,30,38,0.12)",
    color: COLORS.secondary,
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "900",
  },
  dangerBadgeWarning: {
    backgroundColor: "rgba(245,158,11,0.14)",
    color: COLORS.warning,
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "900",
  },
  dangerDistance: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "900",
  },
  signalTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.text,
  },
  signalDesc: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 7,
    fontWeight: "600",
  },
  aiDashboardCard: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    shadowColor: COLORS.dark3,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },
  aiMetricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F4",
  },
  aiMetricLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "900",
  },
  aiMetricValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
    maxWidth: width * 0.48,
    textAlign: "right",
  },
  recommendationCard: {
    borderRadius: 22,
    padding: 16,
    marginTop: 16,
  },
  recommendationTitle: {
    color: COLORS.primaryDark,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 6,
  },
  recommendationText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  emptyStateCard: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },
  emptyStateIcon: {
    fontSize: 42,
    marginBottom: 10,
  },
  emptyStateTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },
  emptyStateText: {
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    fontWeight: "600",
  },

  centerPanelWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99,
    paddingHorizontal: 18,
    transform: [{ translateY: 35 }],
  },
  destinationGlassCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 34,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.75)",
    shadowColor: COLORS.dark3,
    shadowOffset: { width: 0, height: 22 },
    shadowOpacity: 0.22,
    shadowRadius: 32,
    elevation: 16,
  },
  destinationGlassInner: {
    padding: 22,
  },
  panelFloatingIcon: {
    width: 62,
    height: 62,
    borderRadius: 24,
    marginBottom: 15,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  panelFloatingIconGradient: {
    flex: 1,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  panelFloatingIconText: {
    color: COLORS.textLight,
    fontSize: 30,
    fontWeight: "900",
  },
  destinationPanelTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: -0.8,
  },
  destinationPanelText: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 18,
  },
  destinationMainButton: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: COLORS.dark3,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 10,
  },
  destinationMainButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  destinationPlusBox: {
    width: 44,
    height: 44,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  destinationPlus: {
    color: COLORS.textLight,
    fontSize: 22,
    fontWeight: "900",
  },
  destinationButtonTextBox: {
    flex: 1,
  },
  destinationButtonTitle: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: "900",
  },
  destinationButtonSub: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  destinationButtonArrow: {
    color: COLORS.textLight,
    fontSize: 32,
    fontWeight: "300",
  },
  quickChoiceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 15,
  },
  quickChoiceChip: {
    backgroundColor: "rgba(255,255,255,0.86)",
    borderWidth: 1,
    borderColor: "rgba(229,229,234,0.86)",
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderRadius: 999,
    marginRight: 8,
    marginTop: 8,
  },
  quickChoiceText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "900",
  },
  panelStatsBar: {
    flexDirection: "row",
    backgroundColor: COLORS.dark3,
    borderRadius: 22,
    padding: 14,
    marginTop: 18,
  },
  panelStatItem: {
    flex: 1,
    alignItems: "center",
  },
  panelStatDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  panelStatLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    fontWeight: "900",
  },
  panelStatValue: {
    color: COLORS.textLight,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 3,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.34)",
  },
  modalBlur: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "rgba(255,255,255,0.98)",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    height: height * 0.82,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 18,
  },
  modalGrabber: {
    width: 46,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#D1D1D6",
    alignSelf: "center",
    marginBottom: 14,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  closeModalBtn: {
    backgroundColor: COLORS.surfaceSoft,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  closeModalText: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
  },
  modalHeaderTextBox: {
    flex: 1,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
  },
  modalHeaderSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  modalInputWrapper: {
    flexDirection: "row",
    backgroundColor: COLORS.surfaceSoft,
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 13,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  inputDot: {
    fontSize: 16,
  },
  modalTextInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "800",
  },
  validateInputBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 13,
    marginLeft: 8,
    minWidth: 42,
    alignItems: "center",
  },
  validateInputBtnDisabled: {
    opacity: 0.6,
  },
  validateInputText: {
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: "900",
  },
  destinationErrorText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 10,
  },
  categoryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    marginTop: 6,
  },
  categoryCard: {
    width: "23%",
    backgroundColor: "#F8F8FB",
    borderRadius: 20,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEEF2",
  },
  categoryIcon: {
    fontSize: 23,
    marginBottom: 6,
  },
  categoryText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: "900",
    textAlign: "center",
  },
  optionsList: {
    flex: 1,
  },
  sectionDividerTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.textMuted,
    letterSpacing: 1.1,
    marginBottom: 8,
    marginTop: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceSoft,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 14,
    width: 30,
    textAlign: "center",
  },
  optionTextBox: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
  },
  optionSubLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 3,
    fontWeight: "700",
  },

  routeActiveSummary: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    zIndex: 100,
  },
  summaryGlass: {
    borderRadius: 26,
    overflow: "hidden",
  },
  summaryBox: {
    borderRadius: 26,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryTitleBox: {
    flex: 1,
    paddingRight: 10,
  },
  summaryOverline: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  summaryTitle: {
    color: COLORS.textLight,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 3,
  },
  liveBadge: {
    backgroundColor: "rgba(11,143,85,0.18)",
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 999,
  },
  liveBadgeAlert: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  liveBadgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "900",
  },
  liveBadgeTextAlert: {
    color: COLORS.textLight,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 13,
  },
  summaryMetric: {
    flex: 1,
  },
  summaryMetricLabel: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 10,
    fontWeight: "800",
  },
  summaryMetricValue: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 2,
  },
  cancelRouteBtn: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  cancelRouteText: {
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: "900",
  },

  bottomTabBar: {
    position: "absolute",
    bottom: 12,
    left: 14,
    right: 14,
    height: 78,
    borderRadius: 28,
    overflow: "hidden",
    flexDirection: "row",
    paddingBottom: 8,
    paddingTop: 8,
    zIndex: 100,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    shadowColor: COLORS.dark3,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 16,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabIconBubble: {
    width: 40,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 3,
  },
  tabIconBubbleActive: {
    backgroundColor: "rgba(11,143,85,0.14)",
  },
  tabIcon: {
    fontSize: 19,
  },
  tabLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "900",
  },
  tabLabelActive: {
    color: COLORS.primary,
  },
});
