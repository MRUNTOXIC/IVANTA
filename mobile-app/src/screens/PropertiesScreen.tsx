import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import PropertyCard from '../components/PropertyCard';
import { getProperties, getFavorites, addFavorite, removeFavorite } from '../services/api';
import { Property } from '../types/Property';
import { RootStackParamList } from '../navigation';
import type { MobileFilters } from '../filters/types';
import { useAuth } from '../auth/context';

const BUDGET_RANGES = [
  { label: 'Below 5 Lakhs', min: 0, max: 500000 },
  { label: '5L – 25L', min: 500000, max: 2500000 },
  { label: '25L – 50L', min: 2500000, max: 5000000 },
  { label: '50L – 1Cr', min: 5000000, max: 10000000 },
  { label: '1Cr – 5Cr', min: 10000000, max: 50000000 },
  { label: 'Above 5Cr', min: 50000000, max: Infinity },
];

const PROP_TYPES = [
  { label: 'Buy (Residential)', value: 'buy' },
  { label: 'Rent', value: 'rent' },
  { label: 'Commercial', value: 'commercial' },
  { label: 'Plots', value: 'plot' },
  { label: 'PG / Hostel', value: 'pg' },
  { label: 'Projects', value: 'new' },
];

function extractPrice(price: string, priceFrom?: string): number | null {
  const str = priceFrom || price;
  if (!str) return null;
  const clean = str.replace(/[₹,\s]/g, '').toLowerCase();
  let mul = 1, num = clean;
  if (clean.includes('cr')) { mul = 10000000; num = clean.replace(/cr(ore)?/g, ''); }
  else if (clean.includes('l') || clean.includes('lakh')) { mul = 100000; num = clean.replace(/l(akh)?/g, ''); }
  else if (clean.includes('k')) { mul = 1000; num = clean.replace(/k/g, ''); }
  const n = parseFloat(num);
  return isNaN(n) ? null : n * mul;
}

export default function PropertiesScreen() {
  const nav = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Properties'>>();
  const { user } = useAuth();

  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSubTypes, setSelectedSubTypes] = useState<string[]>([]);
  const [selectedBedrooms, setSelectedBedrooms] = useState<string[]>([]);
  const [budgetMode, setBudgetMode] = useState<'ranges' | 'custom'>('ranges');
  const [selectedBudgets, setSelectedBudgets] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minSqft, setMinSqft] = useState('');
  const [maxSqft, setMaxSqft] = useState('');
  const [selectedFacing, setSelectedFacing] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const load = async () => {
    const type = route.params?.type;
    const data = await getProperties(type ? { type } : undefined);
    const category = (route.params as any)?.category as string | undefined;
    const list = category ? data.filter(p => (p as any).category === category) : data;
    setAllProperties(list);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!user) return;
    getFavorites(user.id).then(favs => setFavoriteIds(new Set(favs.map(p => p._id))));
  }, [user]);

  const toggleFavorite = async (propertyId: string) => {
    if (!user) { nav.navigate('Login'); return; }
    const isFav = favoriteIds.has(propertyId);
    setFavoriteIds(prev => { const n = new Set(prev); isFav ? n.delete(propertyId) : n.add(propertyId); return n; });
    isFav ? await removeFavorite(user.id, propertyId) : await addFavorite(user.id, propertyId);
  };

  // Preselect type when opened from Home chips
  useEffect(() => {
    const routeType = route.params?.type;
    if (routeType && !selectedTypes.length) setSelectedTypes([routeType]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.type]);

  // Apply filters returned from Filters screen
  useEffect(() => {
    const incoming = (route.params as any)?.filters as MobileFilters | undefined;
    if (!incoming) return;
    setSearchQuery(incoming.searchQuery || '');
    setSelectedTypes(incoming.selectedTypes || []);
    setSelectedSubTypes(incoming.selectedSubTypes || []);
    setSelectedBedrooms(incoming.selectedBedrooms || []);
    setBudgetMode(incoming.budgetMode || 'ranges');
    setSelectedBudgets(incoming.selectedBudgetRanges || []);
    setMinPrice(incoming.minPrice || '');
    setMaxPrice(incoming.maxPrice || '');
    setMinSqft(incoming.minSqft || '');
    setMaxSqft(incoming.maxSqft || '');
    setSelectedFacing(incoming.selectedFacing || []);
    setSelectedAreas(incoming.selectedAreas || []);
  }, [(route.params as any)?.filters]);

  // Apply all filters
  function extractSqft(sqft?: string): number | null {
    if (!sqft) return null;
    const clean = sqft.replace(/[,\s]/g, '').match(/[\d.]+/);
    if (!clean) return null;
    const n = parseFloat(clean[0]);
    return isNaN(n) ? null : n;
  }

  const filtered = useMemo(() => {
    let list = [...allProperties];
    if (searchQuery.trim())
      list = list.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedTypes.length)
      list = list.filter(p => selectedTypes.some(t => (t === 'new' ? (p as any).isNewProject === true : p.propertyType === t)));
    if (selectedSubTypes.length)
      list = list.filter(p => selectedSubTypes.includes(p.subType));
    if (selectedBedrooms.length)
      list = list.filter(p => Array.isArray(p.beds) && p.beds.some(b => selectedBedrooms.includes(b)));
    if (selectedBudgets.length)
      list = list.filter(p => {
        const v = extractPrice(p.price, p.priceFrom);
        if (v === null) return false;
        if (budgetMode === 'custom') {
          const min = minPrice.trim() ? parseFloat(minPrice) : 0;
          const max = maxPrice.trim() ? parseFloat(maxPrice) : Infinity;
          return v >= min && v <= max;
        }
        return selectedBudgets.some(label => {
          const r = BUDGET_RANGES.find(b => b.label === label);
          return r ? v >= r.min && v < r.max : false;
        });
      });
    if (budgetMode === 'custom' && (minPrice.trim() || maxPrice.trim())) {
      const min = minPrice.trim() ? parseFloat(minPrice) : 0;
      const max = maxPrice.trim() ? parseFloat(maxPrice) : Infinity;
      list = list.filter(p => {
        const v = extractPrice(p.price, p.priceFrom);
        return v !== null && v >= min && v <= max;
      });
    }
    if (minSqft.trim() || maxSqft.trim()) {
      const min = minSqft.trim() ? parseFloat(minSqft) : 0;
      const max = maxSqft.trim() ? parseFloat(maxSqft) : Infinity;
      list = list.filter(p => {
        const v = extractSqft(p.sqft);
        return v !== null && v >= min && v <= max;
      });
    }
    if (selectedFacing.length)
      list = list.filter(p => selectedFacing.includes((p as any).facing));
    if (selectedAreas.length)
      list = list.filter(p => selectedAreas.includes(p.area));
    return list;
  }, [allProperties, searchQuery, selectedTypes, selectedSubTypes, selectedBedrooms, budgetMode, selectedBudgets, minPrice, maxPrice, minSqft, maxSqft, selectedFacing, selectedAreas]);

  const toggle = <T,>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  const activeCount =
    (searchQuery.trim() ? 1 : 0) +
    selectedTypes.length +
    selectedSubTypes.length +
    selectedBedrooms.length +
    (budgetMode === 'ranges' ? selectedBudgets.length : (minPrice || maxPrice ? 1 : 0)) +
    (minSqft || maxSqft ? 1 : 0) +
    selectedFacing.length +
    selectedAreas.length;

  const clearAll = () => {
    setSearchQuery('');
    setSelectedTypes([]);
    setSelectedSubTypes([]);
    setSelectedBedrooms([]);
    setBudgetMode('ranges');
    setSelectedBudgets([]);
    setMinPrice('');
    setMaxPrice('');
    setMinSqft('');
    setMaxSqft('');
    setSelectedFacing([]);
    setSelectedAreas([]);
  };

  const routeType = route.params?.type;
  const screenTitle = routeType
    ? { buy: 'Buy', rent: 'Rent', commercial: 'Commercial', plot: 'Plots', pg: 'PG / Hostel', new: 'Projects' }[routeType] ?? 'Properties'
    : 'Properties';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{screenTitle}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => nav.navigate('Search')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="search-outline" size={20} color="#1f2937" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() =>
              nav.navigate('Filters', {
                type: route.params?.type,
                properties: allProperties.map(p => ({
                  title: p.title,
                  propertyType: p.propertyType,
                  subType: p.subType,
                  beds: p.beds,
                  price: p.price,
                  priceFrom: p.priceFrom,
                  sqft: p.sqft,
                  area: p.area,
                  facing: (p as any).facing,
                  isNewProject: (p as any).isNewProject,
                })),
                initial: {
                  searchQuery,
                  selectedTypes,
                  selectedSubTypes,
                  selectedBedrooms,
                  budgetMode,
                  selectedBudgetRanges: selectedBudgets,
                  minPrice,
                  maxPrice,
                  minSqft,
                  maxSqft,
                  selectedFacing,
                  selectedAreas,
                },
                returnParams: { type: route.params?.type, category: (route.params as any)?.category },
              })
            }
          >
            <Ionicons name="options-outline" size={16} color="#fff" />
            <Text style={styles.filterBtnText}>Filter{activeCount > 0 ? ` (${activeCount})` : ''}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Result count + active filter pills */}
      <View style={styles.resultBar}>
        <Text style={styles.resultCount}>{filtered.length} properties found</Text>
        {activeCount > 0 && (
          <TouchableOpacity onPress={clearAll}>
            <Text style={styles.clearAll}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Active pills */}
      {activeCount > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillsRow}
          contentContainerStyle={styles.pillsContent}
        >
          {searchQuery.trim() ? (
            <TouchableOpacity style={styles.pill} onPress={() => setSearchQuery('')}>
              <Text style={styles.pillText}>Search: {searchQuery.trim()}</Text>
              <Ionicons name="close" size={11} color="#c0392b" />
            </TouchableOpacity>
          ) : null}
          {selectedTypes.map(t => (
            <TouchableOpacity key={t} style={styles.pill} onPress={() => setSelectedTypes(toggle(selectedTypes, t))}>
              <Text style={styles.pillText}>{PROP_TYPES.find(p => p.value === t)?.label ?? t}</Text>
              <Ionicons name="close" size={11} color="#c0392b" />
            </TouchableOpacity>
          ))}
          {selectedSubTypes.map(st => (
            <TouchableOpacity key={st} style={styles.pill} onPress={() => setSelectedSubTypes(toggle(selectedSubTypes, st))}>
              <Text style={styles.pillText}>Sub: {st}</Text>
              <Ionicons name="close" size={11} color="#c0392b" />
            </TouchableOpacity>
          ))}
          {selectedBedrooms.map(b => (
            <TouchableOpacity key={b} style={styles.pill} onPress={() => setSelectedBedrooms(toggle(selectedBedrooms, b))}>
              <Text style={styles.pillText}>Bed: {b}</Text>
              <Ionicons name="close" size={11} color="#c0392b" />
            </TouchableOpacity>
          ))}
          {selectedBudgets.map(b => (
            <TouchableOpacity key={b} style={styles.pill} onPress={() => setSelectedBudgets(toggle(selectedBudgets, b))}>
              <Text style={styles.pillText}>{b}</Text>
              <Ionicons name="close" size={11} color="#c0392b" />
            </TouchableOpacity>
          ))}
          {budgetMode === 'custom' && (minPrice.trim() || maxPrice.trim()) ? (
            <TouchableOpacity style={styles.pill} onPress={() => { setMinPrice(''); setMaxPrice(''); }}>
              <Text style={styles.pillText}>₹ {minPrice || '0'} - {maxPrice || '∞'}</Text>
              <Ionicons name="close" size={11} color="#c0392b" />
            </TouchableOpacity>
          ) : null}
          {(minSqft.trim() || maxSqft.trim()) ? (
            <TouchableOpacity style={styles.pill} onPress={() => { setMinSqft(''); setMaxSqft(''); }}>
              <Text style={styles.pillText}>{minSqft || '0'} - {maxSqft || '∞'} sqft</Text>
              <Ionicons name="close" size={11} color="#c0392b" />
            </TouchableOpacity>
          ) : null}
          {selectedFacing.map(f => (
            <TouchableOpacity key={f} style={styles.pill} onPress={() => setSelectedFacing(toggle(selectedFacing, f))}>
              <Text style={styles.pillText}>{f}</Text>
              <Ionicons name="close" size={11} color="#c0392b" />
            </TouchableOpacity>
          ))}
          {selectedAreas.map(a => (
            <TouchableOpacity key={a} style={styles.pill} onPress={() => setSelectedAreas(toggle(selectedAreas, a))}>
              <Text style={styles.pillText}>{a}</Text>
              <Ionicons name="close" size={11} color="#c0392b" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Grid */}
      <FlatList
        data={filtered}
        keyExtractor={i => i._id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 12 }}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#c0392b" />}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() => nav.navigate('PropertyDetail', { propertyId: item._id })}
            isFavorite={favoriteIds.has(item._id)}
            onFavoritePress={() => toggleFavorite(item._id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="home-outline" size={56} color="#d1d5db" />
            <Text style={styles.emptyText}>No properties found</Text>
          </View>
        }
      />

      {/* Filters are handled via the Filters screen (Modal was unreliable on some devices). */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
  },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#1f2937' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#c0392b', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
  },
  filterBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  resultBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  resultCount: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  clearAll: { fontSize: 12, color: '#c0392b', fontWeight: '600' },

  pillsRow: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', height: 44 },
  pillsContent: { paddingHorizontal: 12, paddingVertical: 7, alignItems: 'center', gap: 6 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
    height: 28,
  },
  pillText: { fontSize: 11, fontWeight: '600', color: '#c0392b' },

  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 15, color: '#9ca3af', marginTop: 12 },

});
