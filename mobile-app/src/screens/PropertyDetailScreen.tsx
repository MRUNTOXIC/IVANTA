import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Linking, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPropertyById, getFavorites, addFavorite, removeFavorite } from '../services/api';
import { Property } from '../types/Property';
import { RootStackParamList } from '../navigation';
import { useAuth } from '../auth/context';

const W = Dimensions.get('window').width;

export default function PropertyDetailScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'PropertyDetail'>>();
  const nav = useNavigation<any>();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    getPropertyById(params.propertyId).then(setProperty);
  }, []);

  useEffect(() => {
    if (!user || !property) return;
    getFavorites(user.id).then(favs => {
      setIsFavorite(favs.some(p => p._id === property._id));
    });
  }, [user, property]);

  const toggleFavorite = async () => {
    if (!user) { nav.navigate('Login'); return; }
    setIsFavorite(v => !v);
    isFavorite
      ? await removeFavorite(user.id, property!._id)
      : await addFavorite(user.id, property!._id);
  };

  if (!property) return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );

  const priceText =
    property.priceFrom
      ? `₹${property.priceFrom} – ₹${property.priceTo || '...'}`
      : property.price
        ? `₹${property.price}`
        : 'Call for Price';

  const lat = property.latitude ? Number(property.latitude) : NaN;
  const lng = property.longitude ? Number(property.longitude) : NaN;
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

  const addressParts = [
    property.street1,
    property.street2,
    property.street3,
    property.street4,
    property.area,
    property.city,
    property.state,
    property.pincode,
  ].filter(Boolean);
  const address = addressParts.join(', ');

  const openMap = async () => {
    const query = hasCoords ? `${lat},${lng}` : address;
    if (!query) return;
    // Try Google Maps app first, fall back to browser
    const googleMapsApp = hasCoords
      ? `comgooglemaps://?q=${lat},${lng}&zoom=16`
      : `comgooglemaps://?q=${encodeURIComponent(address)}`;
    const googleMapsBrowser = hasCoords
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    const canOpenApp = await Linking.canOpenURL(googleMapsApp);
    await Linking.openURL(canOpenApp ? googleMapsApp : googleMapsBrowser);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        {/* Images */}
        <View style={styles.imgContainer}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={e => setImgIndex(Math.round(e.nativeEvent.contentOffset.x / W))}>
            {(property.images?.length ? property.images : ['https://placehold.co/400x250/e5e7eb/9ca3af?text=No+Image']).map((img, i) => (
              <Image key={i} source={{ uri: img }} style={styles.img} contentFit="cover" />
            ))}
          </ScrollView>
          <View style={styles.imgCounter}>
            <Text style={styles.imgCounterText}>{imgIndex + 1}/{property.images?.length || 1}</Text>
          </View>
          {property.badge && <View style={styles.badge}><Text style={styles.badgeText}>{property.badge}</Text></View>}
          <TouchableOpacity style={styles.heartBtn} onPress={toggleFavorite}>
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color={isFavorite ? '#ef4444' : '#fff'} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{property.title}</Text>
          <Text style={styles.location}><Ionicons name="location-outline" size={14} color="#9ca3af" /> {property.area}, {property.city}, {property.state}</Text>
          <Text style={styles.price}>{priceText}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            {property.beds?.[0] && <View style={styles.stat}><Ionicons name="bed-outline" size={20} color="#2563eb" /><Text style={styles.statLabel}>Beds</Text><Text style={styles.statVal}>{property.beds[0]}</Text></View>}
            {property.baths && <View style={styles.stat}><Ionicons name="water-outline" size={20} color="#2563eb" /><Text style={styles.statLabel}>Baths</Text><Text style={styles.statVal}>{property.baths}</Text></View>}
            {property.sqft && <View style={styles.stat}><Ionicons name="resize-outline" size={20} color="#2563eb" /><Text style={styles.statLabel}>Area</Text><Text style={styles.statVal}>{property.sqft}</Text></View>}
            <View style={styles.stat}><Ionicons name="business-outline" size={20} color="#2563eb" /><Text style={styles.statLabel}>Type</Text><Text style={styles.statVal}>{property.propertyType}</Text></View>
          </View>

          {/* Map */}
          {(hasCoords || address) && (
            <>
              <Text style={styles.sectionTitle}>Location</Text>
              {address ? <Text style={styles.addr}>{address}</Text> : null}
              <TouchableOpacity style={styles.mapBtn} onPress={openMap}>
                <Ionicons name="map-outline" size={18} color="#c0392b" />
                <Text style={styles.mapBtnText}>Open in Google Maps</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Description */}
          {property.description && <>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.desc}>{property.description}</Text>
          </>}

          {/* Amenities */}
          {property.amenities?.length > 0 && <>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenities}>
              {property.amenities.map((a, i) => (
                <View key={i} style={styles.amenityItem}>
                  <Ionicons name="checkmark-circle" size={15} color="#10b981" />
                  <Text style={styles.amenityText}>{a}</Text>
                </View>
              ))}
            </View>
          </>}

          {/* Landmarks */}
          {(property.landmarks?.length ?? 0) > 0 && <>
            <Text style={styles.sectionTitle}>Nearby</Text>
            {property.landmarks!.map((l, i) => (
              <View key={i} style={styles.landmark}>
                <Ionicons name="location-outline" size={14} color="#9ca3af" />
                <Text style={styles.landmarkName}>{l.name}</Text>
                <Text style={styles.landmarkDist}>{l.distance}</Text>
              </View>
            ))}
          </>}
        </View>
      </ScrollView>

      {/* Contact Buttons */}
      <View style={styles.contactBar}>
        {property.contactPhone && (
          <TouchableOpacity style={[styles.contactBtn, { backgroundColor: '#2563eb' }]} onPress={() => Linking.openURL(`tel:${property.contactPhone}`)}>
            <Ionicons name="call" size={18} color="#fff" />
            <Text style={styles.contactBtnText}>Call</Text>
          </TouchableOpacity>
        )}
        {property.whatsappNumber && (
          <TouchableOpacity style={[styles.contactBtn, { backgroundColor: '#25d366' }]} onPress={() => Linking.openURL(`whatsapp://send?phone=${property.whatsappNumber}`)}>
            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
            <Text style={styles.contactBtnText}>WhatsApp</Text>
          </TouchableOpacity>
        )}
        {(hasCoords || address) && (
          <TouchableOpacity style={[styles.contactBtn, { backgroundColor: '#111827' }]} onPress={openMap}>
            <Ionicons name="map" size={18} color="#fff" />
            <Text style={styles.contactBtnText}>Map</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imgContainer: { height: 260, position: 'relative' },
  img: { width: W, height: 260 },
  imgCounter: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  imgCounterText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  heartBtn: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 8 },
  badge: { position: 'absolute', top: 12, left: 12, backgroundColor: '#2563eb', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  content: { padding: 18 },
  title: { fontSize: 22, fontWeight: '800', color: '#1f2937', marginBottom: 6 },
  location: { fontSize: 14, color: '#9ca3af', marginBottom: 10 },
  price: { fontSize: 26, fontWeight: '800', color: '#2563eb', marginBottom: 18 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  stat: { flex: 1, alignItems: 'center', backgroundColor: '#f9fafb', paddingVertical: 12, borderRadius: 10, marginHorizontal: 3 },
  statLabel: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  statVal: { fontSize: 13, fontWeight: '700', color: '#1f2937' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1f2937', marginBottom: 10, marginTop: 6 },
  addr: { fontSize: 13, color: '#4b5563', marginBottom: 10, lineHeight: 18 },
  mapBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff', marginBottom: 8 },
  mapBtnText: { fontSize: 14, fontWeight: '700', color: '#2563eb' },
  desc: { fontSize: 14, color: '#4b5563', lineHeight: 22 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  amenityItem: { flexDirection: 'row', alignItems: 'center', width: '48%', gap: 6 },
  amenityText: { fontSize: 13, color: '#4b5563' },
  landmark: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 8 },
  landmarkName: { flex: 1, fontSize: 13, color: '#4b5563' },
  landmarkDist: { fontSize: 12, color: '#9ca3af', fontWeight: '600' },
  contactBar: { flexDirection: 'row', padding: 16, gap: 10, borderTopWidth: 1, borderTopColor: '#e5e7eb', backgroundColor: '#fff' },
  contactBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 13, borderRadius: 10, gap: 8 },
  contactBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
