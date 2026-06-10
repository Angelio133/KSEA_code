import { useState, useEffect } from "react";
import * as Location from "expo-location";

export default function useLocation() {
  const [location, setLocation] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [gpsError, setGpsError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription;

    const startLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setGpsError("Permission de localisation refusée");
          setLoading(false);
          return;
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 5,
          },
          (newLocation) => {
            setLocation(newLocation.coords);

            const speedInMps = newLocation.coords.speed || 0;
            const speedInKmh = Math.round(speedInMps * 3.6);

            setSpeed(speedInKmh);
            setGpsError(null);
          },
        );
      } catch (err) {
        setGpsError(err?.message || "Erreur GPS");
      } finally {
        setLoading(false);
      }
    };

    startLocationTracking();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return {
    location,
    speed,
    gpsError,
    error: gpsError,
    loading,
  };
}
