import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, UrlTile, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation';
import { getProperties } from '../services/api';
import { nearbyProperties, propertyLocation, LatLng } from '../services/location';
import type { Property } from '../types/Property';

export default function NearbyMapScreen() {
  const nav = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'NearbyMap'>>();
  const initialLocation = route.params?.initialLocation;

  const [location, setLocation] = useState<LatLng | null>(initialLocation ?? null);
  const [status, setStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [properties, setProperties] = useState<Property[]>([]);
  const [nearby, setNearby] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLocation = async () => {
    setStatus('requesting');
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
      setStatus('denied');
      setLoading(false);
      return;
    }
    setStatus('granted');
    const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
    const coords = { latitude: current.coords.latitude, longitude: current.coords.longitude };
    setLocation(coords);
  };

  useEffect(() => {
    const fetchData = async () => {
      const allProperties = await getProperties();
      setProperties(allProperties);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!location && status === 'idle') {
      loadLocation();
    }
  }, [location, status]);

  useEffect(() => {
    if (location && properties.length > 0) {
      setNearby(nearbyProperties(properties, location, 15).slice(0, 20));
    }
  }, [location, properties]);

  const region: Region = {
    latitude: location?.latitude ?? 21.1702,
    longitude: location?.longitude ?? 72.8311,
    latitudeDelta: 0.14,
    longitudeDelta: 0.12,
  };

  const mapProperties = nearby.length > 0 ? nearby : properties.filter(p => propertyLocation(p) !== null).slice(0, 10);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Nearby Properties</Text>
          <Text style={styles.headerSubtitle}>Map view for properties close to you</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#c0392b" />
          <Text style={styles.loadingText}>Loading map data...</Text>
        </View>
      ) : status === 'denied' && !location ? (
        <View style={styles.infoWrap}>
          <Ionicons name="location-off-outline" size={44} color="#c0392b" />
          <Text style={styles.infoTitle}>Location access needed</Text>
          <Text style={styles.infoText}>Allow GPS access to see nearby properties on the map.</Text>
          <TouchableOpacity style={styles.actionBtn} onPress={loadLocation}>
            <Text style={styles.actionBtnText}>Allow Location</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.mapSection}>
          <MapView
            style={styles.map}
            initialRegion={region}
            showsUserLocation
            showsMyLocationButton
          >
            {/* OpenStreetMap tiles — same as website, free, no API key */}
            <UrlTile
              urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maximumZ={19}
              flipY={false}
            />
            {mapProperties.map((property) => {
              const coords = propertyLocation(property);
              if (!coords) return null;
              return (
                <Marker
                  key={property._id}
                  coordinate={coords}
                  title={property.title}
                  description={`${property.area}, ${property.city}`}
                />
              );
            })}
          </MapView>

          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Nearby matches</Text>
            <Text style={styles.listSub}>{nearby.length > 0 ? `${nearby.length} properties nearby` : `${mapProperties.length} properties with coordinates`}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.propertyList}>
            {mapProperties.map((property) => {
              const coords = propertyLocation(property);
              if (!coords) return null;
              return (
                <TouchableOpacity
                  key={property._id}
                  style={styles.propertyCard}
                  onPress={() => nav.navigate('PropertyDetail', { propertyId: property._id })}
                >
                  <Text style={styles.propertyCardTitle} numberOfLines={2}>{property.title}</Text>
                  <Text style={styles.propertyCardLocation}>{property.area}, {property.city}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 18, paddingBottom: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  backButton: { padding: 8 },
  headerTitleWrap: { flex: 1, paddingLeft: 10 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  headerSubtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, color: '#6b7280', fontSize: 13, textAlign: 'center' },
  infoWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  infoTitle: { marginTop: 18, fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'center' },
  infoText: { marginTop: 10, fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
  actionBtn: { marginTop: 18, backgroundColor: '#c0392b', paddingHorizontal: 22, paddingVertical: 14, borderRadius: 12 },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  mapSection: { flex: 1 },
  map: { flex: 1 },
  listHeader: { paddingHorizontal: 16, paddingTop: 14, backgroundColor: '#f8fafc' },
  listTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  listSub: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  propertyList: { paddingLeft: 16, paddingTop: 12, paddingBottom: 18, gap: 12 },
  propertyCard: { width: 220, backgroundColor: '#fff', borderRadius: 16, padding: 16, marginRight: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  propertyCardTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 6 },
  propertyCardLocation: { fontSize: 12, color: '#6b7280' },
});
