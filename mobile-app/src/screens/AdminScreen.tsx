import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, RefreshControl, ActivityIndicator, Modal, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import {
  adminLogin, adminGetAllProperties, adminDeleteProperty,
  adminMarkSold, adminGetUsers, adminUpdateUserRole, getAnalytics, getAdminCookie,
} from '../services/api';
import { Property } from '../types/Property';
import type { UserRole } from '../auth/types';

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Ionicons name={icon as any} size={22} color={color} />
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── PROPERTY ROW ─────────────────────────────────────────────────────────────
function PropertyRow({ property, onDelete, onMarkSold }: {
  property: Property;
  onDelete: () => void;
  onMarkSold: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const img = property.images?.[0];

  return (
    <View style={styles.propRow}>
      {img ? (
        <Image source={{ uri: img }} style={styles.propThumb} contentFit="cover" />
      ) : (
        <View style={[styles.propThumb, styles.propThumbEmpty]}>
          <Ionicons name="home-outline" size={20} color="#9ca3af" />
        </View>
      )}
      <View style={styles.propInfo}>
        <Text style={styles.propTitle} numberOfLines={1}>{property.title || '(No title)'}</Text>
        <Text style={styles.propMeta}>
          {property.propertyType?.toUpperCase()} · {property.area}, {property.city}
        </Text>
        <View style={styles.propBadgeRow}>
          <View style={[styles.badge, { backgroundColor: property.isSold ? '#fef3c7' : '#dcfce7' }]}>
            <Text style={[styles.badgeText, { color: property.isSold ? '#92400e' : '#166534' }]}>
              {property.isSold ? 'SOLD' : 'ACTIVE'}
            </Text>
          </View>
          {property.category && property.category !== 'None' && (
            <View style={styles.catBadge}>
              <Text style={styles.catBadgeText}>{property.category}</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity onPress={() => setMenuOpen(true)} style={styles.menuBtn}>
        <Ionicons name="ellipsis-vertical" size={18} color="#6b7280" />
      </TouchableOpacity>

      {/* Action menu */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)} />
        <View style={styles.menuSheet}>
          <Text style={styles.menuTitle} numberOfLines={1}>{property.title}</Text>
          {!property.isSold && (
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); onMarkSold(); }}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#f59e0b" />
              <Text style={[styles.menuItemText, { color: '#f59e0b' }]}>Mark as Sold</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); onDelete(); }}>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text style={[styles.menuItemText, { color: '#ef4444' }]}>Delete Property</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => setMenuOpen(false)}>
            <Ionicons name="close-outline" size={20} color="#6b7280" />
            <Text style={styles.menuItemText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function AdminScreen() {
  type AdminUser = { _id: string; name: string; email: string; role: UserRole; phone?: string };

  const [loggedIn, setLoggedIn] = useState(false);
  const [logging, setLogging] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [filtered, setFiltered] = useState<Property[]>([]);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersFilter, setUsersFilter] = useState<'All' | 'User' | 'Broker' | 'Builder'>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'properties' | 'analytics' | 'users'>('properties');
  const [analytics, setAnalytics] = useState<any>(null);
  const [typeFilter, setTypeFilter] = useState('all');

  const TYPE_FILTERS = ['all', 'buy', 'rent', 'commercial', 'plot', 'pg'];
  const USER_FILTERS: AdminUser['role'][] | ['All', ...AdminUser['role'][]] = ['All', 'User', 'Broker', 'Builder'];

  // Auto-login on mount if cookie already set
  useEffect(() => {
    if (getAdminCookie()) setLoggedIn(true);
  }, []);

  const login = async () => {
    setLogging(true);
    const ok = await adminLogin();
    setLogging(false);
    if (ok) { setLoggedIn(true); loadData(); }
    else Alert.alert('Login Failed', 'Could not connect to server.');
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    const [props, stats, userList] = await Promise.all([adminGetAllProperties(), getAnalytics(), adminGetUsers()]);
    setProperties(props);
    setFiltered(props);
    setAnalytics(stats);
    setUsers(userList);
    setFilteredUsers(userList);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    let list = [...users];
    if (usersFilter !== 'All') list = list.filter((userItem) => userItem.role === usersFilter);
    if (usersSearch.trim()) {
      list = list.filter((userItem) =>
        userItem.name.toLowerCase().includes(usersSearch.toLowerCase()) ||
        userItem.email.toLowerCase().includes(usersSearch.toLowerCase())
      );
    }
    setFilteredUsers(list);
  }, [users, usersFilter, usersSearch]);

  useEffect(() => { if (loggedIn) loadData(); }, [loggedIn]);

  // Filter by search + type
  useEffect(() => {
    let list = [...properties];
    if (typeFilter !== 'all') list = list.filter(p => p.propertyType === typeFilter);
    if (search.trim()) list = list.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()) || p.area?.toLowerCase().includes(search.toLowerCase()));
    setFiltered(list);
  }, [search, typeFilter, properties]);

  const handleRoleChange = async (id: string, newRole: UserRole) => {
    const userToUpdate = users.find((item) => item._id === id);
    if (!userToUpdate || userToUpdate.role === newRole) return;

    const res = await adminUpdateUserRole(id, newRole);
    if (res.success && res.data) {
      const updated = res.data;
      setUsers((prev) => prev.map((item) => (item._id === id ? updated : item)));
      setFilteredUsers((prev) => prev.map((item) => (item._id === id ? updated : item)));
      Alert.alert('Role updated', `${updated.name} is now ${updated.role}`);
      return;
    }

    Alert.alert('Update failed', res.error ?? 'Could not update user role');
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete Property', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const res = await adminDeleteProperty(id);
          if (res?.success) {
            setProperties(prev => prev.filter(p => p._id !== id));
          } else {
            Alert.alert('Error', res?.error ?? 'Failed to delete');
          }
        }
      }
    ]);
  };

  const handleMarkSold = (id: string, title: string) => {
    Alert.alert('Mark as Sold', `Mark "${title}" as sold?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark Sold', onPress: async () => {
          const res = await adminMarkSold(id);
          if (res?.success) {
            setProperties(prev => prev.map(p => p._id === id ? { ...p, isSold: true } : p));
          } else {
            Alert.alert('Error', res?.error ?? 'Failed to mark sold');
          }
        }
      }
    ]);
  };

  // ── LOGIN SCREEN ────────────────────────────────────────────────────────────
  if (!loggedIn) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loginWrap}>
          <View style={styles.loginIcon}>
            <Ionicons name="shield-checkmark" size={40} color="#c0392b" />
          </View>
          <Text style={styles.loginTitle}>Admin Panel</Text>
          <Text style={styles.loginSub}>Ivanta Properties</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={login} disabled={logging}>
            {logging ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="log-in-outline" size={20} color="#fff" />
                <Text style={styles.loginBtnText}>Login as Admin</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.loginNote}>Connects to local server at{'\n'}192.168.1.66:3000</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── DASHBOARD ───────────────────────────────────────────────────────────────
  const total = properties.length;
  const active = properties.filter(p => !p.isSold).length;
  const sold = properties.filter(p => p.isSold).length;
  const byType = TYPE_FILTERS.slice(1).reduce((acc, t) => {
    acc[t] = properties.filter(p => p.propertyType === t).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <Text style={styles.headerSub}>Ivanta Properties</Text>
        </View>
        <TouchableOpacity onPress={() => { setLoggedIn(false); }} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color="#c0392b" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'properties' && styles.tabActive]} onPress={() => setTab('properties')}>
          <Text style={[styles.tabText, tab === 'properties' && styles.tabTextActive]}>Properties</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'users' && styles.tabActive]} onPress={() => setTab('users')}>
          <Text style={[styles.tabText, tab === 'users' && styles.tabTextActive]}>Users</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'analytics' && styles.tabActive]} onPress={() => setTab('analytics')}>
          <Text style={[styles.tabText, tab === 'analytics' && styles.tabTextActive]}>Analytics</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#c0392b" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : tab === 'analytics' ? (
        // ── ANALYTICS TAB ──────────────────────────────────────────────────────
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor="#c0392b" />}
          contentContainerStyle={{ padding: 16, gap: 12 }}
        >
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard icon="home" label="Total" value={total} color="#c0392b" />
            <StatCard icon="checkmark-circle" label="Active" value={active} color="#16a34a" />
            <StatCard icon="pricetag" label="Sold" value={sold} color="#f59e0b" />
            <StatCard icon="eye" label="Views" value={analytics?.totalViews ?? '—'} color="#6366f1" />
          </View>

          <Text style={styles.sectionTitle}>By Property Type</Text>
          {TYPE_FILTERS.slice(1).map(t => (
            <View key={t} style={styles.typeRow}>
              <Text style={styles.typeLabel}>{t.toUpperCase()}</Text>
              <View style={styles.typeBar}>
                <View style={[styles.typeBarFill, { width: `${total > 0 ? (byType[t] / total) * 100 : 0}%` }]} />
              </View>
              <Text style={styles.typeCount}>{byType[t]}</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>By Category</Text>
          {['Featured Property', 'Luxury Property', 'Popular Property', 'Upcoming Projects', 'None'].map(cat => {
            const count = properties.filter(p => (p as any).category === cat).length;
            return (
              <View key={cat} style={styles.typeRow}>
                <Text style={[styles.typeLabel, { flex: 2 }]} numberOfLines={1}>{cat}</Text>
                <View style={styles.typeBar}>
                  <View style={[styles.typeBarFill, { width: `${total > 0 ? (count / total) * 100 : 0}%`, backgroundColor: '#6366f1' }]} />
                </View>
                <Text style={styles.typeCount}>{count}</Text>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        // ── PROPERTIES TAB ─────────────────────────────────────────────────────
        <View style={{ flex: 1 }}>
          {/* Search */}
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={16} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              placeholder={tab === 'users' ? 'Search users by name or email...' : 'Search by title or area...'}
              placeholderTextColor="#9ca3af"
              value={tab === 'users' ? usersSearch : search}
              onChangeText={tab === 'users' ? setUsersSearch : setSearch}
            />
            {(tab === 'users' ? usersSearch.length : search.length) > 0 && (
              <TouchableOpacity onPress={() => tab === 'users' ? setUsersSearch('') : setSearch('')}>
                <Ionicons name="close-circle" size={16} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>

          {tab === 'users' ? (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 12 }}>
                {USER_FILTERS.map((role) => (
                  <TouchableOpacity key={role} style={[styles.chip, usersFilter === role && styles.chipActive]} onPress={() => setUsersFilter(role)}>
                    <Text style={[styles.chipText, usersFilter === role && styles.chipTextActive]}>{role}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.resultCount}>{filteredUsers.length} users</Text>
            </>
          ) : (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 12 }}>
                {TYPE_FILTERS.map(t => (
                  <TouchableOpacity key={t} style={[styles.chip, typeFilter === t && styles.chipActive]} onPress={() => setTypeFilter(t)}>
                    <Text style={[styles.chipText, typeFilter === t && styles.chipTextActive]}>
                      {t === 'all' ? `All (${total})` : `${t.toUpperCase()} (${byType[t] ?? 0})`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.resultCount}>{filtered.length} properties</Text>
            </>
          )}

          <ScrollView
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor="#c0392b" />}
          >
            {tab === 'users' ? (
              filteredUsers.length === 0 ? (
                <View style={styles.empty}>
                  <Ionicons name="people-outline" size={48} color="#d1d5db" />
                  <Text style={styles.emptyText}>No users found</Text>
                </View>
              ) : (
                filteredUsers.map((userItem) => (
                  <View key={userItem._id} style={styles.userCard}>
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{userItem.name}</Text>
                      <Text style={styles.userEmail}>{userItem.email}</Text>
                      <Text style={styles.userRoleLabel}>Current role: {userItem.role}</Text>
                    </View>
                    <View style={styles.userActions}>
                      {['User', 'Broker', 'Builder'].map((roleOption) => (
                        <TouchableOpacity
                          key={roleOption}
                          style={[styles.roleButton, userItem.role === roleOption && styles.roleButtonActive]}
                          onPress={() => handleRoleChange(userItem._id, roleOption as UserRole)}
                        >
                          <Text style={[styles.roleButtonText, userItem.role === roleOption && styles.roleButtonTextActive]}>{roleOption}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))
              )
            ) : filtered.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="home-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>No properties found</Text>
              </View>
            ) : (
              filtered.map(p => (
                <PropertyRow
                  key={p._id}
                  property={p}
                  onDelete={() => handleDelete(p._id, p.title)}
                  onMarkSold={() => handleMarkSold(p._id, p.title)}
                />
              ))
            )}
            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },

  // Login
  loginWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  loginIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fef2f2', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  loginTitle: { fontSize: 24, fontWeight: '800', color: '#1f2937' },
  loginSub: { fontSize: 14, color: '#9ca3af', marginBottom: 32 },
  loginBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#c0392b', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 10 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loginNote: { marginTop: 24, fontSize: 11, color: '#9ca3af', textAlign: 'center', lineHeight: 18 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1f2937' },
  headerSub: { fontSize: 11, color: '#9ca3af' },
  logoutBtn: { padding: 8 },

  // Tabs
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#c0392b' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#9ca3af' },
  tabTextActive: { color: '#c0392b' },

  // Loading
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#9ca3af', fontSize: 14 },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '47%', backgroundColor: '#fff', borderRadius: 10, padding: 14, borderLeftWidth: 3, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  statVal: { fontSize: 24, fontWeight: '800', color: '#1f2937', marginTop: 6 },
  statLabel: { fontSize: 11, color: '#9ca3af', marginTop: 2 },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1f2937', marginTop: 8 },

  // Type bar chart
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  typeLabel: { fontSize: 11, fontWeight: '700', color: '#6b7280', width: 80 },
  typeBar: { flex: 1, height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' },
  typeBarFill: { height: '100%', backgroundColor: '#c0392b', borderRadius: 4 },
  typeCount: { fontSize: 12, fontWeight: '700', color: '#1f2937', width: 24, textAlign: 'right' },

  // Search
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', margin: 12, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: '#e5e7eb' },
  searchInput: { flex: 1, fontSize: 14, color: '#1f2937', padding: 0 },

  // Chips
  chipRow: { paddingVertical: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: '#f3f4f6' },
  chipActive: { backgroundColor: '#c0392b' },
  chipText: { fontSize: 11, fontWeight: '600', color: '#6b7280' },
  chipTextActive: { color: '#fff' },

  resultCount: { fontSize: 11, color: '#9ca3af', paddingHorizontal: 14, paddingVertical: 6 },

  // Property row
  propRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 8, borderRadius: 10, padding: 10, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  propThumb: { width: 56, height: 56, borderRadius: 8, marginRight: 10 },
  propThumbEmpty: { backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  propInfo: { flex: 1 },
  propTitle: { fontSize: 13, fontWeight: '700', color: '#1f2937', marginBottom: 2 },
  propMeta: { fontSize: 11, color: '#9ca3af', marginBottom: 4 },
  propBadgeRow: { flexDirection: 'row', gap: 6 },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 9, fontWeight: '700' },
  catBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 },
  catBadgeText: { fontSize: 9, fontWeight: '600', color: '#1d4ed8' },
  menuBtn: { padding: 6 },

  // Action menu modal
  menuBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  menuSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36 },
  menuTitle: { fontSize: 14, fontWeight: '700', color: '#1f2937', marginBottom: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  menuItemText: { fontSize: 15, fontWeight: '600', color: '#374151' },

  // User role manager
  userCard: { backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 10, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#e5e7eb' },
  userDetails: { marginBottom: 12 },
  userName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  userEmail: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  userRoleLabel: { fontSize: 11, color: '#6b7280', marginTop: 6 },
  userActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#f3f4f6' },
  roleButtonActive: { backgroundColor: '#c0392b' },
  roleButtonText: { fontSize: 11, fontWeight: '700', color: '#6b7280' },
  roleButtonTextActive: { color: '#fff' },

  // Empty
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14, color: '#9ca3af', marginTop: 10 },
});
