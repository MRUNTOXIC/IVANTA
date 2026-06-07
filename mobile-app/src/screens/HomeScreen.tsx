import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Image, ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import PropertyCard from '../components/PropertyCard';
import AppHeader from '../components/AppHeader';
import { useDrawer, RootStackParamList } from '../navigation';
import { getPropertiesByCategory, getProperties, getFavorites, addFavorite, removeFavorite } from '../services/api';
import { nearbyProperties, type LatLng } from '../services/location';
import { Property } from '../types/Property';
import { useAuth } from '../auth/context';

const CATEGORY_ORDER = ['Featured Property', 'Luxury Property', 'Popular Property', 'Upcoming Projects'];
const CATEGORY_LINKS: Record<string, { screen: string; params?: object }> = {
  'Upcoming Projects': { screen: 'Properties', params: { type: 'new' } },
};
const BROWSE_TYPES = [
  { id: 'buy',        label: 'Buy',        icon: 'home-outline' },
  { id: 'rent',       label: 'Rent',       icon: 'key-outline' },
  { id: 'commercial', label: 'Commercial', icon: 'business-outline' },
  { id: 'plot',       label: 'Plots',      icon: 'map-outline' },
  { id: 'pg',         label: 'PG',         icon: 'bed-outline' },
  { id: 'new',        label: 'Projects',   icon: 'construct-outline' },
];

export default function HomeScreen() {
  const nav = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { openDrawer } = useDrawer();
  const { user } = useAuth();

  const [byCategory, setByCategory] = useState<Record<string, Property[]>>({});
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [nearbyList, setNearbyList] = useState<Property[]>([]);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [locStatus, setLocStatus] = useState<'loading' | 'granted' | 'denied'>('loading');
  const [totalCount, setTotalCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    const [cats, all] = await Promise.all([getPropertiesByCategory(), getProperties()]);
    setByCategory(cats);
    setAllProperties(all);
    setTotalCount(all.length);
    setRefreshing(false);
  }, []);

  // Request location on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') { setLocStatus('denied'); return; }
        setLocStatus('granted');
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
        setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      } catch {
        setLocStatus('denied');
      }
    })();
  }, []);

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!user) return;
    getFavorites(user.id).then(favs => setFavoriteIds(new Set(favs.map(p => p._id))));
  }, [user]);

  useEffect(() => {
    if (userLocation && allProperties.length > 0) {
      setNearbyList(nearbyProperties(allProperties, userLocation, 15).slice(0, 10));
    }
  }, [userLocation, allProperties]);

  const toggleFavorite = async (propertyId: string) => {
    if (!user) { nav.navigate('Login'); return; }
    const isFav = favoriteIds.has(propertyId);
    setFavoriteIds(prev => { const n = new Set(prev); isFav ? n.delete(propertyId) : n.add(propertyId); return n; });
    isFav ? await removeFavorite(user.id, propertyId) : await addFavorite(user.id, propertyId);
  };

  // What to show in Nearby section
  const nearbyDisplayList = nearbyList.length > 0 ? nearbyList : allProperties.slice(0, 10);
  const nearbyLabel = nearbyList.length > 0
    ? `${nearbyList.length} properties near you`
    : locStatus === 'denied' ? 'GPS off — showing top properties' : 'Top properties';

  const categories = CATEGORY_ORDER.filter(c => byCategory[c]?.length > 0);
  const builderCount = byCategory['Upcoming Projects']?.length ?? 0;

  return (
    <View style={s.container}>
      <AppHeader onMenuPress={openDrawer} onSearchPress={() => nav.navigate('Search')} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#c0392b" />}
      >
        {/* 1. HERO */}
        <View style={s.hero}>
          <View style={s.heroContent}>
            <View style={s.trustBadge}>
              <Ionicons name="sparkles" size={12} color="#c0392b" />
              <Text style={s.trustText}>Rajkot's Trusted Property Platform</Text>
            </View>
            <Image source={require('../../assets/IvantaLogo.png')} style={s.heroLogo} resizeMode="contain" />
            <Text style={s.heroTagline}>Find Your Dream Property</Text>
            <TouchableOpacity style={s.searchBar} onPress={() => nav.navigate('Search')}>
              <Ionicons name="search-outline" size={16} color="#9ca3af" />
              <Text style={s.searchText}>Search by location, type...</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. STATS */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Ionicons name="home-outline" size={18} color="#c0392b" />
            <Text style={s.statNum}>{totalCount}+</Text>
            <Text style={s.statLabel}>Properties</Text>
          </View>
          <View style={s.statCard}>
            <Ionicons name="business-outline" size={18} color="#c0392b" />
            <Text style={s.statNum}>{builderCount}+</Text>
            <Text style={s.statLabel}>Projects</Text>
          </View>
          <View style={s.statCard}>
            <Ionicons name="pricetag-outline" size={18} color="#c0392b" />
            <Text style={s.statNum}>₹ 0</Text>
            <Text style={s.statLabel}>Platform Fee</Text>
          </View>
          <View style={[s.statCard, { borderRightWidth: 0 }]}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#c0392b" />
            <Text style={s.statNum}>100%</Text>
            <Text style={s.statLabel}>Transparent</Text>
          </View>
        </View>

        {/* 3. BROWSE BY TYPE */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View>
              <Text style={s.sectionTitle}>Browse by Type</Text>
              <Text style={s.sectionSub}>Use filters inside "See All"</Text>
            </View>
            <TouchableOpacity style={s.seeAllBtn} onPress={() => nav.navigate('Properties')}>
              <Text style={s.seeAllText}>See All</Text>
              <Ionicons name="options-outline" size={14} color="#c0392b" />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {BROWSE_TYPES.map(t => (
              <TouchableOpacity key={t.id} style={s.typeChip} onPress={() => nav.navigate('Properties', { type: t.id })}>
                <View style={s.typeIconWrap}>
                  <Ionicons name={t.icon as any} size={20} color="#c0392b" />
                </View>
                <Text style={s.typeLabel}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 4. NEARBY / TOP PROPERTIES */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View>
              <Text style={s.sectionTitle}>
                {nearbyList.length > 0 ? 'Nearby Properties' : 'Top Properties'}
              </Text>
              <Text style={s.sectionSub}>{nearbyLabel}</Text>
            </View>
            {nearbyList.length > 0 && (
              <TouchableOpacity style={s.seeAllBtn} onPress={() => nav.navigate('NearbyMap', { initialLocation: userLocation ?? undefined })}>
                <Text style={s.seeAllText}>Map</Text>
                <Ionicons name="map-outline" size={14} color="#c0392b" />
              </TouchableOpacity>
            )}
          </View>

          {locStatus === 'loading' ? (
            <View style={s.locBanner}>
              <ActivityIndicator size="small" color="#c0392b" />
              <Text style={s.locBannerText}>Detecting your location...</Text>
            </View>
          ) : locStatus === 'denied' && nearbyDisplayList.length === 0 ? (
            <TouchableOpacity style={s.locBanner} onPress={() => Location.requestForegroundPermissionsAsync()}>
              <Ionicons name="location-outline" size={16} color="#c0392b" />
              <Text style={s.locBannerText}>Enable GPS to see nearby properties</Text>
              <Ionicons name="chevron-forward" size={14} color="#c0392b" />
            </TouchableOpacity>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
              {nearbyDisplayList.map(p => (
                <View key={p._id} style={{ marginRight: 12 }}>
                  <PropertyCard
                    property={p}
                    onPress={() => nav.navigate('PropertyDetail', { propertyId: p._id })}
                    isFavorite={favoriteIds.has(p._id)}
                    onFavoritePress={() => toggleFavorite(p._id)}
                  />
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* 5. CATEGORY SECTIONS */}
        {categories.map(cat => {
          const props = byCategory[cat];
          const link = CATEGORY_LINKS[cat] ?? { screen: 'Properties', params: { category: cat } };
          return (
            <View key={cat} style={s.section}>
              <View style={s.sectionHeader}>
                <View>
                  <Text style={s.sectionTitle}>{cat}</Text>
                  <Text style={s.sectionSub}>{props.length} {props.length === 1 ? 'property' : 'properties'} available</Text>
                </View>
                <TouchableOpacity style={s.seeAllBtn} onPress={() => nav.navigate(link.screen as any, link.params as any)}>
                  <Text style={s.seeAllText}>See All</Text>
                  <Ionicons name="arrow-forward" size={13} color="#c0392b" />
                </TouchableOpacity>
              </View>
              {props.length > 2 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
                  {props.map(p => (
                    <View key={p._id} style={{ marginRight: 12 }}>
                      <PropertyCard property={p} onPress={() => nav.navigate('PropertyDetail', { propertyId: p._id })} isFavorite={favoriteIds.has(p._id)} onFavoritePress={() => toggleFavorite(p._id)} />
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View style={s.gridRow}>
                  {props.map(p => (
                    <PropertyCard key={p._id} property={p} onPress={() => nav.navigate('PropertyDetail', { propertyId: p._id })} isFavorite={favoriteIds.has(p._id)} onFavoritePress={() => toggleFavorite(p._id)} />
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* WHY CHOOSE US */}
        <View style={s.whySection}>
          <Text style={s.whyTitle}>Why Choose Ivanta</Text>
          <Text style={s.whySub}>Experience the difference with our customer-first approach</Text>
          <View style={s.whyGrid}>
            {[
              { icon: 'gift-outline',     title: 'Free Service',        desc: 'No hidden charges for buyers & renters.' },
              { icon: 'eye-outline',      title: 'Fully Transparent',   desc: 'Every detail upfront — pricing & history.' },
              { icon: 'sparkles-outline', title: 'Seamless Experience', desc: 'From search to keys, smooth at every step.' },
              { icon: 'layers-outline',   title: 'One Stop Solution',   desc: 'Buy, rent, loan — everything under one roof.' },
            ].map(f => (
              <View key={f.title} style={s.whyCard}>
                <View style={s.whyIconWrap}><Ionicons name={f.icon as any} size={22} color="#fff" /></View>
                <Text style={s.whyCardTitle}>{f.title}</Text>
                <Text style={s.whyCardDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.footerStrip}>
          <Text style={s.footerText}>© {new Date().getFullYear()} Ivanta Ventures LLP</Text>
          <TouchableOpacity onPress={() => nav.navigate('Profile')}>
            <Text style={s.footerLink}>Contact Us</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  hero: { backgroundColor: '#fff' },
  heroContent: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 },
  trustBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 16 },
  trustText: { fontSize: 11, fontWeight: '600', color: '#1f2937' },
  heroLogo: { height: 56, width: 200, marginBottom: 12 },
  heroTagline: { fontSize: 16, fontWeight: '500', color: '#1f2937', marginBottom: 18, textAlign: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, width: '100%' },
  searchText: { color: '#9ca3af', fontSize: 14 },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f3f4f6', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#fff' },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRightWidth: 1, borderRightColor: '#f3f4f6' },
  statNum: { fontSize: 14, fontWeight: '800', color: '#1f2937', marginTop: 4 },
  statLabel: { fontSize: 9, color: '#9ca3af', marginTop: 1, textAlign: 'center' },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1f2937' },
  sectionSub: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#c0392b', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  seeAllText: { fontSize: 12, fontWeight: '600', color: '#c0392b' },
  typeChip: { alignItems: 'center', marginRight: 14, width: 68 },
  typeIconWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#fef2f2', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  typeLabel: { fontSize: 11, fontWeight: '600', color: '#374151', textAlign: 'center' },
  gridRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  locBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fef2f2', borderRadius: 10, padding: 12, marginTop: 12, borderWidth: 1, borderColor: '#fecaca' },
  locBannerText: { flex: 1, fontSize: 12, color: '#c0392b', fontWeight: '600' },
  whySection: { marginTop: 32, paddingHorizontal: 16, paddingBottom: 8 },
  whyTitle: { fontSize: 20, fontWeight: '800', color: '#1f2937', textAlign: 'center' },
  whySub: { fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 4, marginBottom: 16 },
  whyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  whyCard: { width: '47%', backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e5e7eb', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  whyIconWrap: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#c0392b', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  whyCardTitle: { fontSize: 13, fontWeight: '700', color: '#1f2937', marginBottom: 4 },
  whyCardDesc: { fontSize: 11, color: '#6b7280', lineHeight: 16 },
  footerStrip: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, marginTop: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb', backgroundColor: '#fff' },
  footerText: { fontSize: 11, color: '#9ca3af' },
  footerLink: { fontSize: 11, color: '#c0392b', fontWeight: '600' },
});
