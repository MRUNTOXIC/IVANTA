import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import PropertyCard from '../components/PropertyCard';
import AppHeader from '../components/AppHeader';
import { useDrawer, RootStackParamList } from '../navigation';
import { getPropertiesByCategory, getProperties, getFavorites, addFavorite, removeFavorite } from '../services/api';
import { Property } from '../types/Property';
import { useAuth } from '../auth/context';

const CATEGORY_ORDER = ['Featured Property', 'Luxury Property', 'Popular Property', 'Upcoming Projects'];

const CATEGORY_LINKS: Record<string, { screen: string; params?: object }> = {
  'Upcoming Projects': { screen: 'Properties', params: { type: 'new' } },
};

const BROWSE_TYPES = [
  { id: 'buy', label: 'Buy', icon: 'home-outline' },
  { id: 'rent', label: 'Rent', icon: 'key-outline' },
  { id: 'commercial', label: 'Commercial', icon: 'business-outline' },
  { id: 'plot', label: 'Plots', icon: 'map-outline' },
  { id: 'pg', label: 'PG', icon: 'bed-outline' },
  { id: 'new', label: 'Projects', icon: 'construct-outline' },
];

export default function HomeScreen() {
  const nav = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { openDrawer } = useDrawer();
  const { user } = useAuth();
  const [byCategory, setByCategory] = useState<Record<string, Property[]>>({});
  const [totalCount, setTotalCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const load = async () => {
    const [cats, all] = await Promise.all([getPropertiesByCategory(), getProperties()]);
    setByCategory(cats);
    setTotalCount(all.length);
    setRefreshing(false);
  };

  const loadFavorites = async () => {
    if (!user) return;
    const favs = await getFavorites(user.id);
    setFavoriteIds(new Set(favs.map(p => p._id)));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { loadFavorites(); }, [user]);

  const toggleFavorite = async (propertyId: string) => {
    if (!user) { nav.navigate('Login'); return; }
    const isFav = favoriteIds.has(propertyId);
    setFavoriteIds(prev => {
      const next = new Set(prev);
      isFav ? next.delete(propertyId) : next.add(propertyId);
      return next;
    });
    isFav ? await removeFavorite(user.id, propertyId) : await addFavorite(user.id, propertyId);
  };

  const categories = CATEGORY_ORDER.filter(c => byCategory[c]?.length > 0);
  const builderCount = byCategory['Upcoming Projects']?.length ?? 0;

  return (
    <View style={styles.container}>
      <AppHeader onMenuPress={openDrawer} onSearchPress={() => nav.navigate('Search')} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#c0392b" />}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <View style={styles.trustBadge}>
              <Ionicons name="sparkles" size={12} color="#c0392b" />
              <Text style={styles.trustText}>Rajkot's Trusted Property Platform</Text>
            </View>
            <Image
              source={require('../../assets/IvantaLogo.png')}
              style={styles.heroLogo}
              resizeMode="contain"
            />
            <Text style={styles.heroTagline}>Find Your Dream Property</Text>
            <TouchableOpacity style={styles.searchBar} onPress={() => nav.navigate('Search')}>
              <Ionicons name="search-outline" size={16} color="#9ca3af" />
              <Text style={styles.searchText}>Search by location, type...</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats — separate from hero so Browse by Type section starts below it */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="home-outline" size={18} color="#c0392b" />
            <Text style={styles.statNum}>{totalCount}+</Text>
            <Text style={styles.statLabel}>Properties</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="business-outline" size={18} color="#c0392b" />
            <Text style={styles.statNum}>{builderCount}+</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="pricetag-outline" size={18} color="#c0392b" />
            <Text style={styles.statNum}>₹ 0</Text>
            <Text style={styles.statLabel}>Platform Fee</Text>
          </View>
          <View style={[styles.statCard, { borderRightWidth: 0 }]}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#c0392b" />
            <Text style={styles.statNum}>100%</Text>
            <Text style={styles.statLabel}>Transparent</Text>
          </View>
        </View>

        {/* Browse by Type */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Browse by Type</Text>
              <Text style={styles.sectionSub}>Use filters inside “See All”</Text>
            </View>
            <TouchableOpacity style={styles.seeAllBtn} onPress={() => nav.navigate('Properties')}>
              <Text style={styles.seeAllText}>See All</Text>
              <Ionicons name="options-outline" size={14} color="#c0392b" />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {BROWSE_TYPES.map(t => (
              <TouchableOpacity
                key={t.id}
                style={styles.typeChip}
                onPress={() => nav.navigate('Properties', { type: t.id })}
              >
                <View style={styles.typeIconWrap}>
                  <Ionicons name={t.icon as any} size={20} color="#c0392b" />
                </View>
                <Text style={styles.typeLabel}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Category sections */}
        {categories.map(cat => {
          const props = byCategory[cat];
          const link = CATEGORY_LINKS[cat] ?? { screen: 'Properties', params: { category: cat } };

          return (
            <View key={cat} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>{cat}</Text>
                  <Text style={styles.sectionSub}>{props.length} {props.length === 1 ? 'property' : 'properties'} available</Text>
                </View>
                <TouchableOpacity
                  style={styles.seeAllBtn}
                  onPress={() => nav.navigate(link.screen as any, link.params as any)}
                >
                  <Text style={styles.seeAllText}>See All</Text>
                  <Ionicons name="arrow-forward" size={13} color="#c0392b" />
                </TouchableOpacity>
              </View>

              {/* Horizontal scroll for 3+ properties, grid for fewer */}
              {props.length > 2 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
                  {props.map(p => (
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
              ) : (
                <View style={styles.gridRow}>
                  {props.map(p => (
                    <PropertyCard
                      key={p._id}
                      property={p}
                      onPress={() => nav.navigate('PropertyDetail', { propertyId: p._id })}
                      isFavorite={favoriteIds.has(p._id)}
                      onFavoritePress={() => toggleFavorite(p._id)}
                    />
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* Why Choose Us */}
        <View style={styles.whySection}>
          <Text style={styles.whyTitle}>Why Choose Ivanta</Text>
          <Text style={styles.whySub}>Experience the difference with our customer-first approach</Text>
          <View style={styles.whyGrid}>
            {[
              { icon: 'gift-outline', title: 'Free Service', desc: 'No hidden charges for buyers & renters.' },
              { icon: 'eye-outline', title: 'Fully Transparent', desc: 'Every detail upfront — pricing & history.' },
              { icon: 'sparkles-outline', title: 'Seamless Experience', desc: 'From search to keys, smooth at every step.' },
              { icon: 'layers-outline', title: 'One Stop Solution', desc: 'Buy, rent, loan — everything under one roof.' },
            ].map(f => (
              <View key={f.title} style={styles.whyCard}>
                <View style={styles.whyIconWrap}>
                  <Ionicons name={f.icon as any} size={22} color="#fff" />
                </View>
                <Text style={styles.whyCardTitle}>{f.title}</Text>
                <Text style={styles.whyCardDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer strip */}
        <View style={styles.footerStrip}>
          <Text style={styles.footerText}>© {new Date().getFullYear()} Ivanta Ventures LLP</Text>
          <TouchableOpacity onPress={() => nav.navigate('Profile')}>
            <Text style={styles.footerLink}>Contact Us</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },

  // Hero
  hero: { backgroundColor: '#fff' },
  heroContent: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 },
  trustBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 16,
  },
  trustText: { fontSize: 11, fontWeight: '600', color: '#1f2937' },
  heroLogo: { height: 56, width: 200, marginBottom: 12 },
  heroTagline: { fontSize: 16, fontWeight: '500', color: '#1f2937', marginBottom: 18, textAlign: 'center' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, width: '100%',
  },
  searchText: { color: '#9ca3af', fontSize: 14 },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1, borderTopColor: '#f3f4f6',
    borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  statCard: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    borderRightWidth: 1, borderRightColor: '#f3f4f6',
  },
  statNum: { fontSize: 14, fontWeight: '800', color: '#1f2937', marginTop: 4 },
  statLabel: { fontSize: 9, color: '#9ca3af', marginTop: 1, textAlign: 'center' },

  // Browse types
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1f2937' },
  sectionSub: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  seeAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: '#c0392b',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6,
  },
  seeAllText: { fontSize: 12, fontWeight: '600', color: '#c0392b' },
  typeChip: { alignItems: 'center', marginRight: 14, width: 68 },
  typeIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#fef2f2', justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  typeLabel: { fontSize: 11, fontWeight: '600', color: '#374151', textAlign: 'center' },
  gridRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },

  // Why Choose Us
  whySection: { marginTop: 32, paddingHorizontal: 16, paddingBottom: 8 },
  whyTitle: { fontSize: 20, fontWeight: '800', color: '#1f2937', textAlign: 'center' },
  whySub: { fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 4, marginBottom: 16 },
  whyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  whyCard: {
    width: '47%', backgroundColor: '#fff', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#e5e7eb',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  whyIconWrap: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: '#c0392b',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  whyCardTitle: { fontSize: 13, fontWeight: '700', color: '#1f2937', marginBottom: 4 },
  whyCardDesc: { fontSize: 11, color: '#6b7280', lineHeight: 16 },

  // Footer
  footerStrip: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 16, marginTop: 16,
    borderTopWidth: 1, borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  footerText: { fontSize: 11, color: '#9ca3af' },
  footerLink: { fontSize: 11, color: '#c0392b', fontWeight: '600' },
});
