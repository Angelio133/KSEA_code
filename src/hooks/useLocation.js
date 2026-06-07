import { useState, useEffect } from "react";
import * as Location from "expo-location";

export default function useLocation() {
  const [location, setLocation] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permission de localisation refusée");
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

            // Calcul de la vitesse en km/h
            const speedInMps = newLocation.coords.speed || 0;
            const speedInKmh = Math.round(speedInMps * 3.6);
            setSpeed(speedInKmh);
          },
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  return { location, speed, error, loading };
}
