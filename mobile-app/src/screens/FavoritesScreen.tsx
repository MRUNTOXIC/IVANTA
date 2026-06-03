import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AppHeader from '../components/AppHeader';
import PropertyCard from '../components/PropertyCard';
import { useDrawer, RootStackParamList } from '../navigation';
import { useAuth } from '../auth/context';
import { getFavorites, removeFavorite } from '../services/api';
import { Property } from '../types/Property';

export default function FavoritesScreen() {
  const nav = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { openDrawer } = useDrawer();
  const { user } = useAuth();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!user) return;
    isRefresh ? setRefreshing(true) : setLoading(true);
    const data = await getFavorites(user.id);
    setProperties(data);
    isRefresh ? setRefreshing(false) : setLoading(false);
  }, [user]);

  // Reload every time screen comes into focus
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleRemove = async (propertyId: string) => {
    if (!user) return;
    setProperties(prev => prev.filter(p => p._id !== propertyId));
    await removeFavorite(user.id, propertyId);
  };

  if (!user) {
    return (
      <View style={s.container}>
        <AppHeader onMenuPress={openDrawer} title="Saved Properties" />
        <View style={s.center}>
          <Ionicons name="heart-outline" size={56} color="#fecaca" />
          <Text style={s.emptyTitle}>Sign in to see saved properties</Text>
          <Text style={s.emptyText}>Your saved properties will appear here after you sign in.</Text>
          <TouchableOpacity style={s.btn} onPress={() => nav.navigate('Login')}>
            <Text style={s.btnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={s.container}>
        <AppHeader onMenuPress={openDrawer} title="Saved Properties" />
        <View style={s.center}>
          <ActivityIndicator size="large" color="#c0392b" />
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <AppHeader onMenuPress={openDrawer} title="Saved Properties" />
      <FlatList
        data={properties}
        keyExtractor={p => p._id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 12 }}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#c0392b" />
        }
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() => nav.navigate('PropertyDetail', { propertyId: item._id })}
            isFavorite
            onFavoritePress={() => handleRemove(item._id)}
          />
        )}
        ListEmptyComponent={
          <View style={s.center}>
            <Ionicons name="heart-outline" size={56} color="#fecaca" />
            <Text style={s.emptyTitle}>No saved properties yet</Text>
            <Text style={s.emptyText}>Tap the heart on any property to save it here.</Text>
            <TouchableOpacity style={s.btn} onPress={() => nav.navigate('Properties')}>
              <Text style={s.btnText}>Browse Properties</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#374151', marginTop: 16 },
  emptyText: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginTop: 6, lineHeight: 20 },
  btn: { backgroundColor: '#c0392b', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 8, marginTop: 20 },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
