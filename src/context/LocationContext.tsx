import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Platform, Alert } from 'react-native';

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

interface LocationContextType {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  refreshLocation: () => Promise<void>;
}

// Default to Kolkata center
const DEFAULT_LOCATION: LocationData = {
  latitude: 22.5726,
  longitude: 88.3639,
  address: 'Park Street, Kolkata',
};

const LocationContext = createContext<LocationContextType>({
  location: DEFAULT_LOCATION,
  loading: false,
  error: null,
  requestPermission: async () => false,
  refreshLocation: async () => {},
});

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [location, setLocation] = useState<LocationData | null>(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAddress = async (lat: number, lng: number): Promise<string> => {
    try {
      if (Platform.OS === 'web') {
        // Use Mapbox reverse geocoding on web
        const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
        if (token) {
          const resp = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&limit=1`
          );
          const data = await resp.json();
          if (data.features && data.features.length > 0) {
            return data.features[0].place_name || `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
          }
        }
        return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
      }
      const [result] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (result) {
        const parts = [result.street, result.city, result.region].filter(Boolean);
        return parts.join(', ') || `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
      }
      return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
    } catch {
      return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        // Browser geolocation
        return new Promise((resolve) => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              () => resolve(true),
              () => resolve(false)
            );
          } else {
            resolve(false);
          }
        });
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  };

  const refreshLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      if (Platform.OS === 'web') {
        // Browser Geolocation API
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          });
        });
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const address = await getAddress(lat, lng);
        setLocation({ latitude: lat, longitude: lng, address });
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied');
          return;
        }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const address = await getAddress(pos.coords.latitude, pos.coords.longitude);
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          address,
        });
      }
    } catch (e: any) {
      setError(e.message || 'Failed to get location');
      // Keep default Kolkata location
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ location, loading, error, requestPermission, refreshLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
