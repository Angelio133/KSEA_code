import React, { useEffect, useRef, useState } from "react";
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

import i18n from "./Src/i18n/i18n";
import MapScreen from "./Src/screens/MapScreen";
import useLocation from "./Src/hooks/useLocation";

const { width, height } = Dimensions.get("window");

const APP_LOGO = require("./Src/assets/logo.png");

const KNOWN_DESTINATIONS = {
  "Aéroport International d'Ivato": {
    latitude: -18.7996,
    longitude: 47.4788,
  },
  "Aéroport d'Ivato": {
    latitude: -18.7996,
    longitude: 47.4788,
  },
  "Jardin d'Ambohijatovo": {
    latitude: -18.9142,
    longitude: 47.5261,
  },
  Analakely: {
    latitude: -18.9089,
    longitude: 47.5252,
  },
  "INSI Madagascar": {
    latitude: -18.9078,
    longitude: 47.5269,
  },
};

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

  const introOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.72)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const orbitAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const welcomeAnim = useRef(new Animated.Value(0)).current;

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
        "User-Agent": "MitandrinaAI/1.0 (hackathon-prototype)",
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
    dangerDistance: "500 m",
    from: userLocation ? "Votre position" : "Analakely",
  };

  return (
    <I18nextProvider i18n={i18n}>
      <SafeAreaProvider>
        <View style={styles.globalContainer}>
          {currentPage === 1 && (
            <View style={styles.splashContainer}>
              <LinearGradient
                colors={["#FFFFFF", "#F1F6FF", "#F7F1FF", "#FFFFFF"]}
                locations={[0, 0.36, 0.74, 1]}
                style={styles.splashBackground}
              />

              <View style={styles.splashEffectsLayer}>
                <LinearGradient
                  colors={[
                    "rgba(123,97,255,0.22)",
                    "rgba(0,122,255,0.06)",
                    "transparent",
                  ]}
                  style={[styles.auroraBlob, styles.auroraBlobOne]}
                />
                <LinearGradient
                  colors={[
                    "rgba(52,199,89,0.14)",
                    "rgba(123,97,255,0.04)",
                    "transparent",
                  ]}
                  style={[styles.auroraBlob, styles.auroraBlobTwo]}
                />
                <LinearGradient
                  colors={[
                    "rgba(255,149,0,0.13)",
                    "rgba(255,59,48,0.04)",
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
                  <View style={styles.orbitDotBlue} />
                </Animated.View>

                <Animated.View
                  style={[
                    styles.orbitRing,
                    styles.orbitRingMedium,
                    { transform: [{ rotate: reverseOrbitRotate }] },
                  ]}
                >
                  <View style={styles.orbitDotOrange} />
                </Animated.View>

                <Animated.View
                  style={[
                    styles.orbitRing,
                    styles.orbitRingSmall,
                    { transform: [{ rotate: orbitRotate }] },
                  ]}
                >
                  <View style={styles.orbitDotGreen} />
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
                    colors={["#8B7CFF", "#5856D6", "#343092"]}
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
                    onRouteInfoChange={setRouteInfo}
                  />
                )}

                {activeTab === "danger_zones" && (
                  <LinearGradient
                    colors={["#F8FAFF", "#EEF3FF", "#FFFFFF"]}
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
                          colors={["#17172A", "#111827", "#070B16"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.dangerHeroCard}
                        >
                          <View style={styles.dangerHeroGlow} />
                          <View style={styles.heroIconBox}>
                            <Text style={styles.heroIcon}>⚠️</Text>
                          </View>
                          <View style={styles.heroTextBox}>
                            <Text style={styles.heroTitle}>
                              2 dangers prioritaires
                            </Text>
                            <Text style={styles.heroDesc}>
                              Prévention activée sur les zones les plus
                              sensibles du parcours.
                            </Text>
                          </View>
                        </LinearGradient>

                        <SignalCard
                          badgeStyle={styles.dangerBadgeHigh}
                          badge="Risque élevé"
                          distance="500 m"
                          title="🔴 Axe Analakely — Haute densité"
                          desc="Risque d’accrochage élevé entre 17h et 19h. Forte présence de piétons et véhicules."
                        />
                        <SignalCard
                          badgeStyle={styles.dangerBadgeWarning}
                          badge="Risque modéré"
                          distance="1,2 km"
                          title="🟠 RN7 — Courbe PK 12"
                          desc="Virage glissant par temps de pluie. Réduction de vitesse recommandée."
                        />
                        <SignalCard
                          badgeStyle={styles.dangerBadgeInfo}
                          badge="Signalement"
                          distance="2,4 km"
                          title="🛑 Obstacle signalé"
                          desc="Objet sur la chaussée signalé par la communauté. Vérification en attente."
                        />
                      </ScrollView>
                    </SafeAreaView>
                  </LinearGradient>
                )}

                {activeTab === "copilot" && (
                  <LinearGradient
                    colors={["#F8FAFF", "#EEF3FF", "#FFFFFF"]}
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
                          subtitle="Prévention, guidage et analyse temps réel des dangers sur votre route."
                        />

                        <LinearGradient
                          colors={
                            isRouteActive
                              ? ["#381414", "#7C2222", "#FF3B30"]
                              : ["#101828", "#17172A", "#28265C"]
                          }
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.copilotHeroCard}
                        >
                          <View style={styles.copilotOrb} />
                          <View style={styles.heroIconBox}>
                            <Text style={styles.heroIcon}>
                              {isRouteActive ? "⚠️" : "🧠"}
                            </Text>
                          </View>
                          <View style={styles.heroTextBox}>
                            <Text style={styles.heroTitle}>
                              {isRouteActive
                                ? "Danger détecté à 500 mètres"
                                : "Copilot en veille active"}
                            </Text>
                            <Text style={styles.heroDesc}>
                              {isRouteActive
                                ? "Ralentissez. Une zone de collisions fréquentes est signalée devant vous."
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

                            <LinearGradient
                              colors={[
                                "rgba(52,199,89,0.18)",
                                "rgba(52,199,89,0.07)",
                              ]}
                              style={styles.recommendationCard}
                            >
                              <Text style={styles.recommendationTitle}>
                                Recommandation IA
                              </Text>
                              <Text style={styles.recommendationText}>
                                Maintenez une vitesse stable, augmentez la
                                distance de sécurité et préparez-vous à
                                ralentir.
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
                      colors={[
                        "rgba(255,255,255,0.94)",
                        "rgba(255,255,255,0.78)",
                      ]}
                      style={styles.destinationGlassInner}
                    >
                      <View style={styles.panelFloatingIcon}>
                        <LinearGradient
                          colors={["#8B7CFF", "#5856D6"]}
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
                          colors={["#101828", "#1D2140"]}
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
                          <Text style={styles.panelStatLabel}>Copilot</Text>
                          <Text style={styles.panelStatValue}>IA</Text>
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
                      colors={["rgba(17,24,39,0.96)", "rgba(28,28,46,0.92)"]}
                      style={styles.summaryBox}
                    >
                      <View style={styles.summaryHeader}>
                        <View style={styles.summaryTitleBox}>
                          <Text style={styles.summaryOverline}>
                            ITINÉRAIRE ACTIF
                          </Text>
                          <Text style={styles.summaryTitle} numberOfLines={1}>
                            {routeStats.from} → {destination}
                          </Text>
                        </View>

                        <View style={styles.liveBadge}>
                          <Text style={styles.liveBadgeText}>LIVE</Text>
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
                          value={routeStats.dangerDistance}
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
    backgroundColor: "#FFFFFF",
  },

  splashContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "rgba(88,86,214,0.06)",
    transform: [{ rotate: "-32deg" }],
  },
  depthLineOne: {
    top: height * 0.17,
    left: -130,
  },
  depthLineTwo: {
    top: height * 0.36,
    left: -160,
    backgroundColor: "rgba(0,122,255,0.065)",
  },
  depthLineThree: {
    bottom: height * 0.24,
    left: -140,
    backgroundColor: "rgba(88,86,214,0.055)",
  },
  depthLineFour: {
    bottom: height * 0.1,
    left: -90,
    backgroundColor: "rgba(52,199,89,0.052)",
  },
  radarCircle: {
    position: "absolute",
    alignSelf: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(88,86,214,0.07)",
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
    backgroundColor: "#7B61FF",
    shadowColor: "#7B61FF",
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
    backgroundColor: "#34C759",
    shadowColor: "#34C759",
  },
  particleThree: {
    bottom: height * 0.27,
    right: width * 0.22,
    backgroundColor: "#FF9500",
    shadowColor: "#FF9500",
  },
  particleFour: {
    bottom: height * 0.18,
    left: width * 0.24,
    backgroundColor: "#007AFF",
    shadowColor: "#007AFF",
  },
  welcomeText: {
    position: "absolute",
    top: height * 0.09,
    color: "#4C3FB4",
    fontSize: 44,
    fontWeight: "800",
    fontStyle: "italic",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    letterSpacing: 1.2,
    textShadowColor: "rgba(123,97,255,0.20)",
    textShadowOffset: { width: 0, height: 7 },
    textShadowRadius: 14,
  },
  centralHalo: {
    position: "absolute",
    width: 470,
    height: 470,
    borderRadius: 235,
    backgroundColor: "rgba(123,97,255,0.16)",
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
    borderColor: "rgba(123,97,255,0.20)",
  },
  orbitRingMedium: {
    width: 315,
    height: 315,
    borderColor: "rgba(0,122,255,0.18)",
  },
  orbitRingSmall: {
    width: 250,
    height: 250,
    borderColor: "rgba(52,199,89,0.18)",
  },
  orbitDotBlue: {
    position: "absolute",
    top: 32,
    left: 78,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#7B61FF",
    shadowColor: "#7B61FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  orbitDotOrange: {
    position: "absolute",
    top: 80,
    right: 42,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#FF9500",
    shadowColor: "#FF9500",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  orbitDotGreen: {
    position: "absolute",
    bottom: 32,
    left: 82,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#34C759",
    shadowColor: "#34C759",
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
    borderColor: "rgba(123,97,255,0.18)",
  },
  logoShadowDisc: {
    position: "absolute",
    width: 288,
    height: 288,
    borderRadius: 144,
    backgroundColor: "rgba(123,97,255,0.09)",
    shadowColor: "#7B61FF",
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
    borderColor: "rgba(123,97,255,0.12)",
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
    backgroundColor: "rgba(255,255,255,0.32)",
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
    shadowColor: "#7B61FF",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.38,
    shadowRadius: 26,
    elevation: 16,
    overflow: "hidden",
  },
  launchButtonGloss: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.14)",
    top: -82,
    left: -22,
  },
  launchButtonText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    marginRight: 11,
  },
  launchArrow: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    marginTop: -1,
  },

  mainContainer: {
    flex: 1,
    backgroundColor: "#F2F2F7",
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
    color: "#5856D6",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginBottom: 7,
  },
  sectionTitle: {
    fontSize: 31,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -0.9,
  },
  sectionSubtitle: {
    color: "#6B7280",
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
    shadowColor: "#111827",
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
    shadowColor: "#111827",
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
    backgroundColor: "rgba(255,149,0,0.22)",
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
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  heroDesc: {
    color: "rgba(255,255,255,0.7)",
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
    shadowColor: "#111827",
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
    backgroundColor: "rgba(255,59,48,0.12)",
    color: "#FF3B30",
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "900",
  },
  dangerBadgeWarning: {
    backgroundColor: "rgba(255,149,0,0.14)",
    color: "#FF9500",
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "900",
  },
  dangerBadgeInfo: {
    backgroundColor: "rgba(0,122,255,0.12)",
    color: "#007AFF",
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "900",
  },
  dangerDistance: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "900",
  },
  signalTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
  },
  signalDesc: {
    color: "#6B7280",
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
    shadowColor: "#111827",
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
    color: "#8E8E93",
    fontSize: 13,
    fontWeight: "900",
  },
  aiMetricValue: {
    color: "#111827",
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
    color: "#2E7D32",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 6,
  },
  recommendationText: {
    color: "#2E7D32",
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
    color: "#111827",
    fontSize: 18,
    fontWeight: "900",
  },
  emptyStateText: {
    color: "#6B7280",
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
  },
  destinationGlassCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 34,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.75)",
    shadowColor: "#111827",
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
    shadowColor: "#5856D6",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35,
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
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
  },
  destinationPanelTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -0.8,
  },
  destinationPanelText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 18,
  },
  destinationMainButton: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#111827",
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
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },
  destinationButtonTextBox: {
    flex: 1,
  },
  destinationButtonTitle: {
    color: "#FFFFFF",
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
    color: "#FFFFFF",
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
    color: "#111827",
    fontSize: 12,
    fontWeight: "900",
  },
  panelStatsBar: {
    flexDirection: "row",
    backgroundColor: "#111827",
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
    color: "#FFFFFF",
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
    backgroundColor: "#F2F2F7",
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
    color: "#111827",
  },
  modalHeaderTextBox: {
    flex: 1,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },
  modalHeaderSubtitle: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  modalInputWrapper: {
    flexDirection: "row",
    backgroundColor: "#F2F2F7",
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  inputIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
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
    color: "#111827",
    fontWeight: "800",
  },
  validateInputBtn: {
    backgroundColor: "#5856D6",
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
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  destinationErrorText: {
    color: "#FF3B30",
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
    color: "#111827",
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
    color: "#8E8E93",
    letterSpacing: 1.1,
    marginBottom: 8,
    marginTop: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
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
    color: "#111827",
  },
  optionSubLabel: {
    fontSize: 13,
    color: "#8E8E93",
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
    color: "#34C759",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  summaryTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 3,
  },
  liveBadge: {
    backgroundColor: "rgba(52,199,89,0.16)",
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 999,
  },
  liveBadgeText: {
    color: "#34C759",
    fontSize: 10,
    fontWeight: "900",
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
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 2,
  },
  cancelRouteBtn: {
    backgroundColor: "#FF3B30",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  cancelRouteText: {
    color: "#FFFFFF",
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
    shadowColor: "#111827",
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
    backgroundColor: "rgba(88,86,214,0.14)",
  },
  tabIcon: {
    fontSize: 19,
  },
  tabLabel: {
    fontSize: 11,
    color: "#8E8E93",
    fontWeight: "900",
  },
  tabLabelActive: {
    color: "#5856D6",
  },
});
