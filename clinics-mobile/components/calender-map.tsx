import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

const GOOGLE_MAPS_APIKEY = "AIzaSyDc_qXxv7x1A5aVpmJZemwzixkMT1_ejjo"; // must enable Directions API

type Location = {
  lat: number;
  long: number;
  label: string;
};

type RouteData = {
  coordinates: Array<{ latitude: number; longitude: number }>;
  distance: string;
  duration: string;
};

export default function MapWithRoute({ locations }: { locations: Location[] }) {
  const [routeData, setRouteData] = useState<RouteData | null>(null);

  useEffect(() => {
    if (locations && locations.length >= 2) {
      fetchRoute();
    }
  }, [locations]);

  const fetchRoute = async () => {
    try {
      const origin = `${locations[0].lat},${locations[0].long}`;
      const destination = `${locations[locations.length - 1].lat},${locations[locations.length - 1].long}`;
      const waypoints = locations.slice(1, -1)
        .map(loc => `${loc.lat},${loc.long}`)
        .join('|');

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=${waypoints}&key=${GOOGLE_MAPS_APIKEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];
        
        // Decode polyline
        const coordinates = decodePolyline(route.overview_polyline.points);
        
        setRouteData({
          coordinates,
          distance: leg.distance.text,
          duration: leg.duration.text,
        });

        console.log("Distance:", leg.distance.text);
        console.log("Duration:", leg.duration.text);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  // Simple polyline decoder (you might want to use a library like @mapbox/polyline for production)
  const decodePolyline = (encoded: string) => {
    const points: Array<{ latitude: number; longitude: number }> = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b: number;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return points;
  };

  if (!locations || locations.length < 2) return null;

  const origin = {
    latitude: locations[0].lat,
    longitude: locations[0].long,
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={{
        latitude: origin.latitude,
        longitude: origin.longitude,
        latitudeDelta: 5,
        longitudeDelta: 5,
      }}>
        {locations.map((loc, idx) => (
          <Marker
            key={idx}
            coordinate={{ latitude: loc.lat, longitude: loc.long }}
            title={loc.label}
          />
        ))}

        {/* Custom polyline for route */}
        {routeData && (
          <Polyline
            coordinates={routeData.coordinates}
            strokeWidth={4}
            strokeColor="#007AFF"
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
