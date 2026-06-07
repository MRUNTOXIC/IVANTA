import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation';
import type { BudgetMode, FilterPropertyLite, MobileFilters } from '../filters/types';

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

const FACING = ['North', 'South', 'East', 'West'];

function extractPrice(price?: string, priceFrom?: string): number | null {
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

function extractSqft(sqft?: string): number | null {
  if (!sqft) return null;
  const clean = sqft.replace(/[,\s]/g, '').match(/[\d.]+/);
  if (!clean) return null;
  const n = parseFloat(clean[0]);
  return isNaN(n) ? null : n;
}

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
}

export default function FiltersScreen() {
  const nav = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Filters'>>();

  const properties = (route.params?.properties ?? []) as FilterPropertyLite[];
  const initial = route.params?.initial;
  const lockedType = route.params?.type;

  const [searchQuery, setSearchQuery] = useState(initial?.searchQuery ?? '');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(initial?.selectedTypes ?? (lockedType ? [lockedType] : []));
  const [selectedSubTypes, setSelectedSubTypes] = useState<string[]>(initial?.selectedSubTypes ?? []);
  const [selectedBedrooms, setSelectedBedrooms] = useState<string[]>(initial?.selectedBedrooms ?? []);
  const [budgetMode, setBudgetMode] = useState<BudgetMode>(initial?.budgetMode ?? 'ranges');
  const [selectedBudgetRanges, setSelectedBudgetRanges] = useState<string[]>(initial?.selectedBudgetRanges ?? []);
  const [minPrice, setMinPrice] = useState(initial?.minPrice ?? '');
  const [maxPrice, setMaxPrice] = useState(initial?.maxPrice ?? '');
  const [minSqft, setMinSqft] = useState(initial?.minSqft ?? '');
  const [maxSqft, setMaxSqft] = useState(initial?.maxSqft ?? '');
  const [selectedFacing, setSelectedFacing] = useState<string[]>(initial?.selectedFacing ?? []);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(initial?.selectedAreas ?? []);
  const [areaSearch, setAreaSearch] = useState('');

  const availableAreas = useMemo(() => [...new Set(properties.map(p => p.area))].filter(Boolean).sort(), [properties]);
  const availableSubTypes = useMemo(() => [...new Set(properties.map(p => p.subType).filter(Boolean))].sort(), [properties]);
  const availableBedrooms = useMemo(() => {
    const out: string[] = [];
    properties.forEach(p => {
      if (Array.isArray(p.beds)) p.beds.forEach(b => b && out.push(b));
    });
    return [...new Set(out)].sort();
  }, [properties]);

  const filteredAreas = areaSearch.trim()
    ? availableAreas.filter(a => a.toLowerCase().includes(areaSearch.toLowerCase()))
    : availableAreas;

  const countByType = (t: string) =>
    t === 'new'
      ? properties.filter(p => p.isNewProject === true).length
      : properties.filter(p => p.propertyType === t).length;
  const countBySubType = (st: string) => properties.filter(p => p.subType === st).length;
  const countByBedroom = (b: string) => properties.filter(p => Array.isArray(p.beds) && p.beds.includes(b)).length;
  const countByFacing = (f: string) => properties.filter(p => p.facing === f).length;
  const countByArea = (a: string) => properties.filter(p => p.area === a).length;
  const countByBudget = (min: number, max: number) =>
    properties.filter(p => {
      const v = extractPrice(p.price, p.priceFrom);
      return v !== null && v >= min && v < max;
    }).length;

  const previewCount = useMemo(() => {
    let list: FilterPropertyLite[] = [...properties];

    if (searchQuery.trim()) list = list.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedTypes.length) {
      list = list.filter(p => selectedTypes.some(t => (t === 'new' ? p.isNewProject === true : p.propertyType === t)));
    }

    if (selectedSubTypes.length) list = list.filter(p => selectedSubTypes.includes(p.subType));

    if (selectedBedrooms.length) {
      list = list.filter(p => Array.isArray(p.beds) && p.beds.some(b => selectedBedrooms.includes(b)));
    }

    if (budgetMode === 'ranges' && selectedBudgetRanges.length) {
      list = list.filter(p => {
        const v = extractPrice(p.price, p.priceFrom);
        if (v === null) return false;
        return selectedBudgetRanges.some(label => {
          const r = BUDGET_RANGES.find(b => b.label === label);
          return r ? v >= r.min && v < r.max : false;
        });
      });
    }

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

    if (selectedFacing.length) list = list.filter(p => p.facing && selectedFacing.includes(p.facing));

    if (selectedAreas.length) list = list.filter(p => selectedAreas.includes(p.area));

    return list.length;
  }, [properties, searchQuery, selectedTypes, selectedSubTypes, selectedBedrooms, budgetMode, selectedBudgetRanges, minPrice, maxPrice, minSqft, maxSqft, selectedFacing, selectedAreas]);

  const apply = () => {
    const filters: MobileFilters = {
      searchQuery,
      selectedTypes,
      selectedSubTypes,
      selectedBedrooms,
      budgetMode,
      selectedBudgetRanges,
      minPrice,
      maxPrice,
      minSqft,
      maxSqft,
      selectedFacing,
      selectedAreas,
    };

    nav.navigate('Properties', { ...(route.params?.returnParams ?? {}), filters });
  };

  const clear = () => {
    setSearchQuery('');
    setSelectedTypes(lockedType ? [lockedType] : []);
    setSelectedSubTypes([]);
    setSelectedBedrooms([]);
    setBudgetMode('ranges');
    setSelectedBudgetRanges([]);
    setMinPrice('');
    setMaxPrice('');
    setMinSqft('');
    setMaxSqft('');
    setSelectedFacing([]);
    setSelectedAreas([]);
    setAreaSearch('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Filters</Text>
        <TouchableOpacity onPress={clear}>
          <Text style={styles.clear}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        <Section title="Search">
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={16} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by property name..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.trim() ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#9ca3af" />
              </TouchableOpacity>
            ) : null}
          </View>
        </Section>

        {!lockedType && (
          <Section title="Property Type">
            {PROP_TYPES.map(pt => (
              <CheckRow
                key={pt.value}
                label={pt.label}
                rightText={String(countByType(pt.value))}
                checked={selectedTypes.includes(pt.value)}
                onPress={() => setSelectedTypes(toggle(selectedTypes, pt.value))}
              />
            ))}
          </Section>
        )}

        {availableSubTypes.length > 0 && (
          <Section title="Sub Type">
            {availableSubTypes.map(st => (
              <CheckRow key={st} label={st} rightText={String(countBySubType(st))} checked={selectedSubTypes.includes(st)} onPress={() => setSelectedSubTypes(toggle(selectedSubTypes, st))} />
            ))}
          </Section>
        )}

        {availableBedrooms.length > 0 && (
          <Section title="Bedrooms">
            {availableBedrooms.map(b => (
              <CheckRow key={b} label={b} rightText={String(countByBedroom(b))} checked={selectedBedrooms.includes(b)} onPress={() => setSelectedBedrooms(toggle(selectedBedrooms, b))} />
            ))}
          </Section>
        )}

        <Section title="Budget">
          <View style={styles.segment}>
            <TouchableOpacity style={[styles.segBtn, budgetMode === 'ranges' && styles.segBtnOn]} onPress={() => setBudgetMode('ranges')}>
              <Text style={[styles.segText, budgetMode === 'ranges' && styles.segTextOn]}>Ranges</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.segBtn, budgetMode === 'custom' && styles.segBtnOn]} onPress={() => setBudgetMode('custom')}>
              <Text style={[styles.segText, budgetMode === 'custom' && styles.segTextOn]}>Custom</Text>
            </TouchableOpacity>
          </View>
          {budgetMode === 'ranges' ? (
            BUDGET_RANGES.map(r => (
              <CheckRow key={r.label} label={r.label} rightText={String(countByBudget(r.min, r.max))} checked={selectedBudgetRanges.includes(r.label)} onPress={() => setSelectedBudgetRanges(toggle(selectedBudgetRanges, r.label))} />
            ))
          ) : (
            <View style={styles.row2}>
              <TextInput value={minPrice} onChangeText={setMinPrice} placeholder="Min (number)" placeholderTextColor="#9ca3af" keyboardType="numeric" style={styles.input} />
              <TextInput value={maxPrice} onChangeText={setMaxPrice} placeholder="Max (number)" placeholderTextColor="#9ca3af" keyboardType="numeric" style={styles.input} />
            </View>
          )}
        </Section>

        <Section title="Area (Sq.ft.)">
          <View style={styles.row2}>
            <TextInput value={minSqft} onChangeText={setMinSqft} placeholder="Min sqft" placeholderTextColor="#9ca3af" keyboardType="numeric" style={styles.input} />
            <TextInput value={maxSqft} onChangeText={setMaxSqft} placeholder="Max sqft" placeholderTextColor="#9ca3af" keyboardType="numeric" style={styles.input} />
          </View>
        </Section>

        {FACING.some(f => countByFacing(f) > 0) && (
          <Section title="Facing Direction">
            {FACING.filter(f => countByFacing(f) > 0).map(f => (
              <CheckRow key={f} label={f} rightText={String(countByFacing(f))} checked={selectedFacing.includes(f)} onPress={() => setSelectedFacing(toggle(selectedFacing, f))} />
            ))}
          </Section>
        )}

        {availableAreas.length > 0 && (
          <Section title="Filter by Area">
            <View style={styles.searchBox}>
              <Ionicons name="location-outline" size={16} color="#9ca3af" />
              <TextInput style={styles.searchInput} placeholder="Search area..." placeholderTextColor="#9ca3af" value={areaSearch} onChangeText={setAreaSearch} />
            </View>
            <View style={{ marginTop: 4 }}>
              {filteredAreas.slice(0, 40).map(a => (
                <CheckRow key={a} label={a} rightText={String(countByArea(a))} checked={selectedAreas.includes(a)} onPress={() => setSelectedAreas(toggle(selectedAreas, a))} />
              ))}
            </View>
          </Section>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyBtn} onPress={apply}>
          <Text style={styles.applyText}>Show {previewCount} Properties</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>
        {children}
      </View>
    </View>
  );
}

function CheckRow({ label, rightText, checked, onPress }: { label: string; rightText?: string; checked: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.checkRow} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checkboxOn]}>
        {checked && <Ionicons name="checkmark" size={12} color="#fff" />}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
      {rightText ? <Text style={styles.countPill}>{rightText}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { flex: 1, fontSize: 16, fontWeight: '800', color: '#111827' },
  clear: { fontSize: 13, fontWeight: '700', color: '#c0392b' },

  section: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 2 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#111827', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },

  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, padding: 0, fontSize: 13, color: '#111827' },

  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: '#d1d5db', justifyContent: 'center', alignItems: 'center' },
  checkboxOn: { backgroundColor: '#c0392b', borderColor: '#c0392b' },
  checkLabel: { flex: 1, fontSize: 13, color: '#374151' },
  countPill: { fontSize: 11, color: '#9ca3af', backgroundColor: '#f3f4f6', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },

  segment: { flexDirection: 'row', backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, overflow: 'hidden', marginBottom: 10 },
  segBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  segBtnOn: { backgroundColor: '#c0392b' },
  segText: { fontSize: 12, fontWeight: '800', color: '#6b7280' },
  segTextOn: { color: '#fff' },

  row2: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#111827' },

  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 14, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  applyBtn: { backgroundColor: '#c0392b', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  applyText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
