import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface CalendarMapProps {
    places: { lat: number; lng: number; clinicName: string | null }[];
    center: { lat: number; lng: number; };
    zoom?: number;
    updateLocation: (index: number, location: { lat: number; lng: number }) => void;
}

const CalendarMap: React.FC<CalendarMapProps> = ({ places, center, zoom = 12, updateLocation }) => {
    console.log("places", places);
    
    const handleMarkerDragEnd = (event: any, index: number) => {
        const { latitude: lat, longitude: lng } = event.nativeEvent.coordinate;
        updateLocation(index, { lat, lng });
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                    latitude: center.lat,
                    longitude: center.lng,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                showsUserLocation={false}
                showsMyLocationButton={false}
                showsCompass={true}
                showsScale={true}
                showsTraffic={false}
                showsBuildings={true}
                showsIndoors={true}
                showsIndoorLevelPicker={false}
                rotateEnabled={true}
                scrollEnabled={true}
                zoomEnabled={true}
                pitchEnabled={true}
                toolbarEnabled={false}
                moveOnMarkerPress={true}
            >
                {places.map((place, index) => (
                    <Marker
                        key={index}
                        coordinate={{
                            latitude: place.lat,
                            longitude: place.lng,
                        }}
                        title={place.clinicName || 'Clinic'}
                        description="Job location"
                        draggable={false}
                        onDragEnd={(event) => handleMarkerDragEnd(event, index)}
                        pinColor="red"
                    />
                ))}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 8,
        overflow: 'hidden',
    },
    map: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
});

export default CalendarMap; 