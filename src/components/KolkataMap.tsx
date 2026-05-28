import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { borderRadius } from '../theme/spacing';

interface KolkataMapProps {
  showRoute?: boolean;
  height?: number;
}

// Web: render a real interactive Mapbox GL map via inline HTML in an iframe
const WebMap = ({ showRoute = false, height = 300 }: KolkataMapProps) => {
  const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

  const mapHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script>
    // Suppress network errors from bubbling to parent window during offline development
    window.addEventListener('unhandledrejection', function(e) {
      if (e.reason && (e.reason.message || e.reason.toString()).includes('fetch')) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
    window.onerror = function(message, source, lineno, colno, error) {
      if (message && (message.toString().includes('fetch') || message.toString().includes('Load failed') || message.toString().includes('mapboxgl'))) {
        return true;
      }
    };
  </script>
  <link href="https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css" rel="stylesheet" />
  <script src="https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    if (typeof mapboxgl === 'undefined') {
      const mapEl = document.getElementById('map');
      mapEl.style.cssText = 'display:flex;flex-direction:column;justify-content:center;align-items:center;background:#FFF9EF;font-family:sans-serif;color:#4B5563;text-align:center;padding:20px;box-sizing:border-box;height:100%;';
      mapEl.innerHTML = \`
        <div style="font-size:20px;margin-bottom:8px;font-weight:bold;">🗺️ Offline Map Sandbox</div>
        <div style="font-size:12px;color:#6B7280;max-width:280px;line-height:1.6;margin-bottom:12px;">
          Mapbox GL is currently offline. Simulating safe route tracking from Park Street to Howrah Station.
        </div>
        <div style="padding:4px 10px;background:#FFEDD5;color:#C2410C;border-radius:12px;font-size:10px;font-weight:bold;letter-spacing:0.5px;text-transform:uppercase;display:inline-block;">
          Offline Sandbox Active
        </div>
      \`;
    } else {
      try {
        mapboxgl.accessToken = '${MAPBOX_TOKEN}';
        const map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/navigation-day-v1',
          center: [88.3480, 22.5650],
          zoom: 12.5,
          attributionControl: false,
        });

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        ${showRoute ? `
        // Current location marker (green)
        const startEl = document.createElement('div');
        startEl.style.cssText = 'width:16px;height:16px;background:#10B981;border:3px solid #fff;border-radius:50%;box-shadow:0 0 8px rgba(16,185,129,0.6);';
        new mapboxgl.Marker({ element: startEl }).setLngLat([88.3526, 22.5539]).setPopup(new mapboxgl.Popup().setText('You — Park Street')).addTo(map);

        // Destination marker (orange)
        const endEl = document.createElement('div');
        endEl.style.cssText = 'width:16px;height:16px;background:#F97316;border:3px solid #fff;border-radius:50%;box-shadow:0 0 8px rgba(249,115,22,0.6);';
        new mapboxgl.Marker({ element: endEl }).setLngLat([88.3433, 22.5839]).setPopup(new mapboxgl.Popup().setText('Howrah Station')).addTo(map);

        // Route line
        map.on('load', () => {
          map.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [88.3526, 22.5539],
                  [88.3499, 22.5645],
                  [88.3495, 22.5726],
                  [88.3433, 22.5839],
                ],
              },
            },
          });
          map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#10B981', 'line-width': 4 },
          });
        });
        ` : `
        // Default marker at center of Kolkata
        const el = document.createElement('div');
        el.style.cssText = 'width:18px;height:18px;background:#F97316;border:3px solid #fff;border-radius:50%;box-shadow:0 0 10px rgba(249,115,22,0.5);';
        new mapboxgl.Marker({ element: el }).setLngLat([88.3480, 22.5650]).addTo(map);
        `}
      } catch (err) {
        console.warn('Mapbox setup error: ', err);
      }
    }
  </script>
</body>
</html>`;

  return (
    <View style={[styles.container, { height }]}>
      <iframe
        srcDoc={mapHtml}
        style={{ width: '100%', height: '100%', border: 'none', borderRadius: borderRadius.lg } as any}
        title="Kolkata Map"
      />
    </View>
  );
};

// Native: use react-native-maps with Mapbox tile overlay
const NativeMap = ({ showRoute = false, height = 300 }: KolkataMapProps) => {
  const MapView = require('react-native-maps').default;
  const { Marker, UrlTile, Polyline } = require('react-native-maps');
  const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
  const tileUrl = `https://api.mapbox.com/styles/v1/mapbox/navigation-day-v1/tiles/256/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`;

  const currentLoc = { latitude: 22.5539, longitude: 88.3526 };
  const destinationLoc = { latitude: 22.5839, longitude: 88.3433 };
  const routeCoordinates = [
    { latitude: 22.5539, longitude: 88.3526 },
    { latitude: 22.5645, longitude: 88.3499 },
    { latitude: 22.5726, longitude: 88.3495 },
    { latitude: 22.5839, longitude: 88.3433 },
  ];

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 22.5650,
          longitude: 88.3480,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
        mapType="none"
      >
        <UrlTile urlTemplate={tileUrl} maximumZ={19} flipY={false} />
        {showRoute && (
          <>
            <Marker coordinate={currentLoc} title="Current Location (Park St)" pinColor="#10B981" />
            <Marker coordinate={destinationLoc} title="Howrah Station" pinColor="#F97316" />
            <Polyline coordinates={routeCoordinates} strokeColor="#10B981" strokeWidth={4} />
          </>
        )}
      </MapView>
    </View>
  );
};

export const KolkataMap = (props: KolkataMapProps) => {
  if (Platform.OS === 'web') {
    return <WebMap {...props} />;
  }
  return <NativeMap {...props} />;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
