import React from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

const GOOGLE_MAPS_APIKEY = "AIzaSyDc_qXxv7x1A5aVpmJZemwzixkMT1_ejjo"; // must enable Directions API

type Location = {
  lat: number;
  long: number;
  label: string;
};

export default function MapWithRoute({ locations }: { locations: Location[] }) {
  if (!locations || locations.length < 2) return null;

  const origin = {
    latitude: locations[0].lat,
    longitude: locations[0].long,
  };
  const destination = {
    latitude: locations[locations.length - 1].lat,
    longitude: locations[locations.length - 1].long,
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

        {/* Google Directions polyline + ETA */}
        <MapViewDirections
          origin={origin}
          destination={destination}
          waypoints={locations.slice(1, -1).map(l => ({ latitude: l.lat, longitude: l.long }))}
          apikey={GOOGLE_MAPS_APIKEY}
          strokeWidth={4}
          strokeColor="#007AFF"
          onReady={result => {
            console.log("Distance:", result.distance, "km");
            console.log("Duration:", result.duration, "mins");
          }}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
