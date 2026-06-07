import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { useTranslation } from "react-i18next";

const ANALAKELY = {
  latitude: -18.913688,
  longitude: 47.536392,
};

function formatDuration(seconds) {
  if (!seconds || Number.isNaN(seconds)) return "--";

  const minutes = Math.round(seconds / 60);

  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return rest > 0 ? `${hours} h ${rest} min` : `${hours} h`;
}

function formatDistance(meters) {
  if (!meters || Number.isNaN(meters)) return "--";

  if (meters < 1000) return `${Math.round(meters)} m`;

  return `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
}

export default function MapScreen({
  userLocation,
  speed,
  gpsError,
  isRouteActive,
  destination,
  destinationCoords,
  blackSpots,
  onRouteInfoChange,
}) {
  const { t } = useTranslation();

  const webViewRef = useRef(null);
  const lastCoordinatesSent = useRef({ latitude: 0, longitude: 0 });

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");

  const initialPositionRef = useRef({
    latitude: userLocation?.latitude || ANALAKELY.latitude,
    longitude: userLocation?.longitude || ANALAKELY.longitude,
  });

  const defaultBlackSpots = useMemo(
    () => [
      {
        id: 1,
        latitude: -18.905,
        longitude: 47.525,
        risk: "high",
        title: "Zone Accidentogène - RN7",
        description: "Virage à forte inclinaison",
      },
      {
        id: 2,
        latitude: -18.92,
        longitude: 47.54,
        risk: "moderate",
        title: "Axe Analakely",
        description: "Forte concentration de piétons",
      },
      {
        id: 3,
        latitude: -18.895,
        longitude: 47.518,
        risk: "high",
        title: "Danger à 500 m",
        description: "Zone de collisions fréquentes sur l’itinéraire",
      },
    ],
    [],
  );

  const spots = blackSpots || defaultBlackSpots;

  const injectJavaScript = useCallback((code) => {
    if (!webViewRef.current) return;
    webViewRef.current.injectJavaScript(`${code}\ntrue;`);
  }, []);

  const sendRouteRequestToWebView = useCallback(() => {
    if (!isMapLoaded) return;

    if (!isRouteActive || !destinationCoords) {
      setRouteError("");
      setRouteLoading(false);
      onRouteInfoChange?.(null);

      injectJavaScript(`
        if (typeof clearRealRoute === "function") {
          clearRealRoute();
        }
      `);

      return;
    }

    const startLat =
      userLocation?.latitude || initialPositionRef.current.latitude;
    const startLng =
      userLocation?.longitude || initialPositionRef.current.longitude;

    const destLat = Number(destinationCoords.latitude);
    const destLng = Number(destinationCoords.longitude);

    if (
      Number.isNaN(startLat) ||
      Number.isNaN(startLng) ||
      Number.isNaN(destLat) ||
      Number.isNaN(destLng)
    ) {
      setRouteError("Coordonnées invalides.");
      return;
    }

    setRouteLoading(true);
    setRouteError("");

    const payload = {
      startLat,
      startLng,
      destLat,
      destLng,
      destinationName: destination || "Destination",
    };

    injectJavaScript(`
      if (typeof requestRealRoute === "function") {
        requestRealRoute(${JSON.stringify(payload)});
      }
    `);
  }, [
    isMapLoaded,
    isRouteActive,
    destinationCoords,
    destination,
    userLocation,
    injectJavaScript,
    onRouteInfoChange,
  ]);

  useEffect(() => {
    if (userLocation && webViewRef.current) {
      const lat = userLocation.latitude;
      const lng = userLocation.longitude;

      const hasMoved =
        Math.abs(lastCoordinatesSent.current.latitude - lat) > 0.0001 ||
        Math.abs(lastCoordinatesSent.current.longitude - lng) > 0.0001;

      if (hasMoved) {
        lastCoordinatesSent.current = { latitude: lat, longitude: lng };

        injectJavaScript(`
          if (typeof updateDriverPosition === "function") {
            updateDriverPosition(${lat}, ${lng});
          }
        `);
      }
    }
  }, [userLocation, injectJavaScript]);

  useEffect(() => {
    sendRouteRequestToWebView();
  }, [sendRouteRequestToWebView]);

  const handleWebViewMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      if (message.type === "MAP_READY") {
        setIsMapLoaded(true);
        return;
      }

      if (message.type === "ROUTE_LOADING") {
        setRouteLoading(true);
        setRouteError("");
        return;
      }

      if (message.type === "ROUTE_SUCCESS") {
        setRouteLoading(false);
        setRouteError("");

        onRouteInfoChange?.({
          distance: message.distance,
          duration: message.duration,
          distanceText: formatDistance(message.distance),
          durationText: formatDuration(message.duration),
          provider: message.provider || "OSRM",
        });

        return;
      }

      if (message.type === "ROUTE_ERROR") {
        const errorMessage =
          message.message || "Impossible de calculer l’itinéraire réel.";

        setRouteLoading(false);
        setRouteError(errorMessage);

        onRouteInfoChange?.({
          error: errorMessage,
          distanceText: "--",
          durationText: "--",
          provider: "OSRM",
        });
      }
    } catch (error) {
      console.log("Message WebView invalide:", error);
    }
  };

  const mapHtml = useMemo(() => {
    const initialLat = initialPositionRef.current.latitude;
    const initialLng = initialPositionRef.current.longitude;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
        />

        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />

        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

        <style>
          body,
          html,
          #map {
            height: 100%;
            margin: 0;
            padding: 0;
            background-color: #F5F7FA;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            touch-action: pan-x pan-y;
          }

          .leaflet-control-attribution {
            display: none !important;
          }

          .leaflet-container {
            background: #F5F7FA;
            touch-action: pan-x pan-y;
          }

          .leaflet-tile {
            filter: saturate(1.08) contrast(1.02) brightness(1.02);
          }

          .leaflet-control-zoom {
            border: none !important;
            box-shadow: 0 10px 24px rgba(0,0,0,0.18) !important;
            border-radius: 16px !important;
            overflow: hidden;
            margin-top: 62px !important;
            margin-right: 14px !important;
          }

          .leaflet-control-zoom a {
            width: 42px !important;
            height: 42px !important;
            line-height: 42px !important;
            font-size: 24px !important;
            font-weight: 800 !important;
            color: #1C1C1E !important;
            background: rgba(255,255,255,0.96) !important;
            border: none !important;
          }

          .leaflet-control-zoom a:hover {
            background: #F2F2F7 !important;
          }

          .leaflet-control-zoom-in {
            border-bottom: 1px solid #E5E5EA !important;
          }

          .gps-marker {
            width: 22px;
            height: 22px;
            background-color: #007AFF;
            border: 4px solid #FFFFFF;
            border-radius: 50%;
            box-shadow:
              0 0 0 8px rgba(0, 122, 255, 0.16),
              0 8px 20px rgba(0, 122, 255, 0.35);
          }

          .destination-marker {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #5856D6, #7B61FF);
            border: 3px solid #FFFFFF;
            border-radius: 15px 15px 15px 5px;
            transform: rotate(-45deg);
            box-shadow: 0 10px 24px rgba(88, 86, 214, 0.42);
          }

          .destination-marker::after {
            content: "";
            position: absolute;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #FFFFFF;
            top: 10px;
            left: 10px;
          }

          .danger-pulse {
            width: 23px;
            height: 23px;
            border-radius: 50%;
            background: #FF3B30;
            border: 3px solid #FFFFFF;
            box-shadow:
              0 0 0 8px rgba(255, 59, 48, 0.15),
              0 8px 20px rgba(255, 59, 48, 0.28);
          }

          .warning-pulse {
            width: 23px;
            height: 23px;
            border-radius: 50%;
            background: #FF9500;
            border: 3px solid #FFFFFF;
            box-shadow:
              0 0 0 8px rgba(255, 149, 0, 0.15),
              0 8px 20px rgba(255, 149, 0, 0.25);
          }

          .popup-title {
            font-weight: 800;
            color: #1C1C1E;
            margin-bottom: 4px;
          }

          .popup-desc {
            color: #636366;
            font-size: 12px;
            line-height: 16px;
          }

          .route-tooltip {
            background: #1C1C1E;
            color: #FFFFFF;
            border: none;
            border-radius: 14px;
            padding: 8px 10px;
            font-size: 12px;
            font-weight: 700;
            box-shadow: 0 10px 24px rgba(0,0,0,0.2);
          }

          .route-tooltip::before {
            display: none;
          }
        </style>
      </head>

      <body>
        <div id="map"></div>

        <script>
          function sendToReactNative(payload) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify(payload));
            }
          }

          var map = L.map("map", {
            zoomControl: true,
            attributionControl: false,
            dragging: true,
            touchZoom: true,
            doubleClickZoom: true,
            scrollWheelZoom: true,
            boxZoom: true,
            keyboard: true,
            tap: true,
            zoomAnimation: true,
            fadeAnimation: true,
            markerZoomAnimation: true,
            inertia: true,
            inertiaDeceleration: 3000,
            zoomSnap: 0.25,
            zoomDelta: 0.5,
            wheelPxPerZoomLevel: 80,
            maxZoom: 20,
            minZoom: 3,
          }).setView([${initialLat}, ${initialLng}], 16);

          map.zoomControl.setPosition("topright");

          L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
            {
              subdomains: "abcd",
              maxZoom: 20,
              minZoom: 3,
              detectRetina: true,
              attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
            }
          ).addTo(map);

          var driverIcon = L.divIcon({
            className: "gps-marker",
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });

          var destinationIcon = L.divIcon({
            className: "destination-marker",
            iconSize: [36, 36],
            iconAnchor: [18, 36],
          });

          var driverMarker = L.marker([${initialLat}, ${initialLng}], {
            icon: driverIcon,
          }).addTo(map);

          var routeLine = null;
          var routeShadowLine = null;
          var destinationMarker = null;
          var lastRouteController = null;

          function updateDriverPosition(lat, lng) {
            var newLatLng = new L.LatLng(lat, lng);
            driverMarker.setLatLng(newLatLng);

            if (!routeLine) {
              map.panTo(newLatLng, {
                animate: true,
                duration: 0.45,
              });
            }
          }

          function clearRealRoute() {
            if (routeLine) {
              map.removeLayer(routeLine);
              routeLine = null;
            }

            if (routeShadowLine) {
              map.removeLayer(routeShadowLine);
              routeShadowLine = null;
            }

            if (destinationMarker) {
              map.removeLayer(destinationMarker);
              destinationMarker = null;
            }
          }

          function formatDuration(seconds) {
            var minutes = Math.round(seconds / 60);

            if (minutes < 60) {
              return minutes + " min";
            }

            var hours = Math.floor(minutes / 60);
            var rest = minutes % 60;

            return rest > 0 ? hours + " h " + rest + " min" : hours + " h";
          }

          function formatDistance(meters) {
            if (meters < 1000) {
              return Math.round(meters) + " m";
            }

            return (meters / 1000).toFixed(1).replace(".", ",") + " km";
          }

          function drawRealRoute(routeCoordinates, destinationName, distance, duration) {
            clearRealRoute();

            var latLngPoints = routeCoordinates.map(function(pair) {
              return [pair[1], pair[0]];
            });

            routeShadowLine = L.polyline(latLngPoints, {
              color: "#FFFFFF",
              weight: 13,
              opacity: 0.96,
              lineCap: "round",
              lineJoin: "round",
            }).addTo(map);

            routeLine = L.polyline(latLngPoints, {
              color: "#5856D6",
              weight: 7,
              opacity: 0.94,
              lineCap: "round",
              lineJoin: "round",
            }).addTo(map);

            var destinationPoint = latLngPoints[latLngPoints.length - 1];

            destinationMarker = L.marker(destinationPoint, {
              icon: destinationIcon,
            }).addTo(map);

            destinationMarker.bindTooltip("Destination : " + destinationName, {
              permanent: false,
              direction: "top",
              className: "route-tooltip",
            });

            routeLine.bindTooltip(
              "Route réelle • " +
                formatDistance(distance) +
                " • " +
                formatDuration(duration),
              {
                permanent: false,
                direction: "top",
                className: "route-tooltip",
              }
            );

            map.fitBounds(routeLine.getBounds(), {
              paddingTopLeft: [50, 160],
              paddingBottomRight: [50, 170],
              animate: true,
              duration: 0.75,
            });
          }

          async function requestRealRoute(payload) {
            try {
              sendToReactNative({ type: "ROUTE_LOADING" });

              if (lastRouteController) {
                lastRouteController.abort();
              }

              lastRouteController = new AbortController();

              var startLat = payload.startLat;
              var startLng = payload.startLng;
              var destLat = payload.destLat;
              var destLng = payload.destLng;
              var destinationName = payload.destinationName || "Destination";

              var routePath =
                startLng + "," + startLat + ";" + destLng + "," + destLat +
                "?overview=full&geometries=geojson&steps=false";

              var urls = [
                "https://routing.openstreetmap.de/routed-car/route/v1/driving/" + routePath,
                "https://router.project-osrm.org/route/v1/driving/" + routePath
              ];

              var data = null;
              var lastError = null;
              var provider = "OSRM";

              for (var i = 0; i < urls.length; i++) {
                try {
                  var response = await fetch(urls[i], {
                    method: "GET",
                    headers: {
                      "Accept": "application/json"
                    },
                    signal: lastRouteController.signal
                  });

                  if (!response.ok) {
                    lastError = new Error("Erreur HTTP " + response.status);
                    continue;
                  }

                  data = await response.json();
                  provider = i === 0
                    ? "routing.openstreetmap.de"
                    : "router.project-osrm.org";
                  break;
                } catch (error) {
                  lastError = error;
                }
              }

              if (!data) {
                throw lastError || new Error("Service d’itinéraire indisponible.");
              }

              if (data.code !== "Ok" || !data.routes || !data.routes[0]) {
                throw new Error("Aucun itinéraire trouvé.");
              }

              var route = data.routes[0];
              var coordinates = route.geometry && route.geometry.coordinates
                ? route.geometry.coordinates
                : [];

              if (!coordinates.length) {
                throw new Error("Route vide.");
              }

              drawRealRoute(
                coordinates,
                destinationName,
                route.distance,
                route.duration
              );

              sendToReactNative({
                type: "ROUTE_SUCCESS",
                distance: route.distance,
                duration: route.duration,
                provider: provider
              });
            } catch (error) {
              if (error && error.name === "AbortError") {
                return;
              }

              clearRealRoute();

              sendToReactNative({
                type: "ROUTE_ERROR",
                message:
                  error && error.message
                    ? error.message
                    : "Impossible de calculer l’itinéraire réel."
              });
            }
          }

          var spots = ${JSON.stringify(spots)};

          spots.forEach(function(spot) {
            var isHigh = spot.risk === "high";

            var dangerIcon = L.divIcon({
              className: isHigh ? "danger-pulse" : "warning-pulse",
              iconSize: [23, 23],
              iconAnchor: [11, 11],
            });

            L.marker([spot.latitude, spot.longitude], {
              icon: dangerIcon,
            })
              .addTo(map)
              .bindPopup(
                "<div class='popup-title'>" +
                  spot.title +
                  "</div><div class='popup-desc'>" +
                  spot.description +
                  "</div>"
              );

            L.circle([spot.latitude, spot.longitude], {
              color: isHigh ? "#FF3B30" : "#FF9500",
              fillColor: isHigh ? "#FF3B30" : "#FF9500",
              fillOpacity: isHigh ? 0.16 : 0.13,
              radius: isHigh ? 150 : 120,
              weight: 2,
              opacity: 0.65,
            }).addTo(map);
          });

          setTimeout(function() {
            sendToReactNative({ type: "MAP_READY" });
          }, 500);
        </script>
      </body>
      </html>
    `;
  }, [spots]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: mapHtml }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleWebViewMessage}
        onLoadEnd={() => {
          setIsMapLoaded(true);
          setTimeout(sendRouteRequestToWebView, 400);
        }}
      />

      {!isRouteActive && (
        <View style={styles.mapReadyBadge}>
          <View style={styles.mapReadyDot} />
          <View>
            <Text style={styles.mapReadyTitle}>Carte prête</Text>
            <Text style={styles.mapReadySubtitle}>
              Glissez, zoomez ou choisissez une destination
            </Text>
          </View>
        </View>
      )}

      {isRouteActive && (
        <View style={styles.bottomOverlay}>
          <View style={styles.speedCard}>
            <Text style={styles.speedLabel}>VITESSE</Text>
            <Text style={styles.speedValue}>
              {speed && speed > 0 ? Math.round(speed) : 0}
              <Text style={styles.speedUnit}> km/h</Text>
            </Text>
          </View>

          {routeLoading && (
            <View style={styles.routeStatusBadge}>
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.routeStatusText}>Calcul route réelle...</Text>
            </View>
          )}

          {routeError ? (
            <View style={styles.routeErrorBadge}>
              <Text style={styles.routeErrorText}>{routeError}</Text>
            </View>
          ) : null}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.reportButton]}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonIcon}>⚠️</Text>
              <View>
                <Text style={styles.buttonText}>
                  {t("report") || "Signaler"}
                </Text>
                <Text style={styles.buttonSubText}>Danger proche</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.driveButton]}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonIcon}>🧠</Text>
              <View>
                <Text style={styles.buttonText}>Copilot IA</Text>
                <Text style={styles.buttonSubText}>Prévention active</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!userLocation && !gpsError && (
        <View style={styles.loaderBadge}>
          <ActivityIndicator
            size="small"
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.loaderText}>Recherche du signal GPS...</Text>
        </View>
      )}

      {gpsError && (
        <View style={styles.gpsErrorBadge}>
          <Text style={styles.gpsErrorText}>GPS indisponible</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },

  mapReadyBadge: {
    position: "absolute",
    top: 58,
    left: 16,
    right: 82,
    zIndex: 10,
    backgroundColor: "rgba(28, 28, 30, 0.88)",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  mapReadyDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#34C759",
    marginRight: 12,
  },
  mapReadyTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  mapReadySubtitle: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },

  bottomOverlay: {
    position: "absolute",
    bottom: 104,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  speedCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 18,
    paddingVertical: 11,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
    marginBottom: 14,
    minWidth: 104,
    alignItems: "center",
  },
  speedLabel: {
    color: "#AEAEB2",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  speedValue: {
    color: "#34C759",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 2,
  },
  speedUnit: {
    fontSize: 12,
    color: "#AEAEB2",
    fontWeight: "500",
  },

  routeStatusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(28, 28, 30, 0.88)",
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  routeStatusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  routeErrorBadge: {
    backgroundColor: "rgba(255, 59, 48, 0.92)",
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  routeErrorText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flex: 0.485,
  },
  reportButton: {
    backgroundColor: "#FF3B30",
  },
  driveButton: {
    backgroundColor: "#5856D6",
  },
  buttonIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  buttonSubText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },

  loaderBadge: {
    position: "absolute",
    top: 108,
    alignSelf: "center",
    backgroundColor: "rgba(28, 28, 30, 0.88)",
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 20,
  },
  loaderText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  gpsErrorBadge: {
    position: "absolute",
    top: 108,
    alignSelf: "center",
    backgroundColor: "rgba(255, 59, 48, 0.92)",
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 999,
    zIndex: 20,
  },
  gpsErrorText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
});
