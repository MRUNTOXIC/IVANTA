import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import { useDrawer } from '../navigation';
import { useAuth } from '../auth/context';
import { useNavigation } from '@react-navigation/native';

const MenuItem = ({ icon, title, subtitle, onPress, iconColor = '#c0392b', iconBg = '#fef2f2' }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>
      <Ionicons name={icon} size={19} color={iconColor} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.menuTitle}>{title}</Text>
      {subtitle && <Text style={styles.menuSub}>{subtitle}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
  </TouchableOpacity>
);

const StatCard = ({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) => (
  <View style={[styles.statCard, { borderTopColor: color }]}>
    <Ionicons name={icon as any} size={20} color={color} />
    <Text style={[styles.statVal, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ── ROLE BADGE COLORS ─────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  Builder: { color: '#1d4ed8', bg: '#eff6ff', icon: 'business-outline', label: 'Builder' },
  Broker:  { color: '#7c3aed', bg: '#f5f3ff', icon: 'briefcase-outline', label: 'Broker' },
  User:    { color: '#c0392b', bg: '#fef2f2', icon: 'person-outline',    label: 'User' },
};

export default function ProfileScreen() {
  const { openDrawer } = useDrawer();
  const { user, setUser } = useAuth();
  const nav = useNavigation<any>();

  const role = user?.role ?? 'User';
  const rc = ROLE_CONFIG[role] ?? ROLE_CONFIG.User;

  return (
    <View style={styles.container}>
      <AppHeader onMenuPress={openDrawer} title="Profile" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: rc.bg }]}>
            <Ionicons name={rc.icon as any} size={30} color={rc.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user ? user.name : 'Guest User'}</Text>
            <Text style={styles.email}>
              {user ? user.email : 'Sign in to access more features'}
            </Text>
            {user && (
              <View style={[styles.roleBadge, { backgroundColor: rc.bg }]}>
                <Text style={[styles.roleBadgeText, { color: rc.color }]}>{rc.label}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Sign In / Logout */}
        {user ? (
          <TouchableOpacity style={styles.logoutBtn} onPress={() => setUser(null)}>
            <Ionicons name="log-out-outline" size={16} color="#c0392b" />
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.loginBtn} onPress={() => nav.navigate('Login')}>
            <Text style={styles.loginBtnText}>Sign In / Register</Text>
          </TouchableOpacity>
        )}

        {/* ── BUILDER DASHBOARD ─────────────────────────────────────────────── */}
        {user?.role === 'Builder' && (
          <>
            <View style={styles.dashHeader}>
              <Ionicons name="business" size={16} color="#1d4ed8" />
              <Text style={[styles.dashTitle, { color: '#1d4ed8' }]}>Builder Dashboard</Text>
            </View>

            <View style={styles.statsRow}>
              <StatCard icon="home-outline"       label="My Projects"   value="—" color="#1d4ed8" />
              <StatCard icon="eye-outline"         label="Total Views"   value="—" color="#7c3aed" />
              <StatCard icon="people-outline"      label="Enquiries"     value="—" color="#059669" />
              <StatCard icon="checkmark-circle-outline" label="Sold Units" value="—" color="#f59e0b" />
            </View>

            <View style={styles.group}>
              <Text style={styles.groupTitle}>My Projects</Text>
              <MenuItem icon="add-circle-outline" title="Post New Project" subtitle="Add a new builder project" onPress={() => nav.navigate('PostProperty')} iconColor="#1d4ed8" iconBg="#eff6ff" />
              <MenuItem icon="list-outline"       title="My Listed Projects" subtitle="View & manage your projects" onPress={() => nav.navigate('Properties')} iconColor="#1d4ed8" iconBg="#eff6ff" />
              <MenuItem icon="stats-chart-outline" title="Project Analytics" subtitle="Views, enquiries & leads" onPress={() => {}} iconColor="#1d4ed8" iconBg="#eff6ff" />
            </View>

            <View style={styles.group}>
              <Text style={styles.groupTitle}>Leads & Enquiries</Text>
              <MenuItem icon="mail-outline"       title="Buyer Enquiries"   subtitle="Messages from interested buyers" onPress={() => {}} iconColor="#059669" iconBg="#f0fdf4" />
              <MenuItem icon="call-outline"       title="Call Requests"     subtitle="Callback requests" onPress={() => {}} iconColor="#059669" iconBg="#f0fdf4" />
            </View>
          </>
        )}

        {/* ── BROKER DASHBOARD ──────────────────────────────────────────────── */}
        {user?.role === 'Broker' && (
          <>
            <View style={styles.dashHeader}>
              <Ionicons name="briefcase" size={16} color="#7c3aed" />
              <Text style={[styles.dashTitle, { color: '#7c3aed' }]}>Broker Dashboard</Text>
            </View>

            <View style={styles.statsRow}>
              <StatCard icon="home-outline"   label="Listings"    value="—" color="#7c3aed" />
              <StatCard icon="heart-outline"  label="Saved"       value="—" color="#c0392b" />
              <StatCard icon="people-outline" label="Clients"     value="—" color="#059669" />
              <StatCard icon="trending-up-outline" label="Deals"  value="—" color="#f59e0b" />
            </View>

            <View style={styles.group}>
              <Text style={styles.groupTitle}>My Listings</Text>
              <MenuItem icon="add-circle-outline" title="Post a Property"    subtitle="List a new property" onPress={() => nav.navigate('PostProperty')} iconColor="#7c3aed" iconBg="#f5f3ff" />
              <MenuItem icon="list-outline"       title="My Listed Properties" subtitle="Manage your listings" onPress={() => nav.navigate('Properties')} iconColor="#7c3aed" iconBg="#f5f3ff" />
              <MenuItem icon="heart-outline"      title="Saved Properties"   subtitle="Properties you've saved" onPress={() => nav.navigate('Favorites')} iconColor="#7c3aed" iconBg="#f5f3ff" />
            </View>

            <View style={styles.group}>
              <Text style={styles.groupTitle}>Client Tools</Text>
              <MenuItem icon="search-outline"     title="Search Properties"  subtitle="Find properties for clients" onPress={() => nav.navigate('Search')} iconColor="#7c3aed" iconBg="#f5f3ff" />
              <MenuItem icon="share-outline"      title="Share Listings"     subtitle="Share via WhatsApp or link" onPress={() => {}} iconColor="#7c3aed" iconBg="#f5f3ff" />
            </View>
          </>
        )}

        {/* ── USER DASHBOARD ────────────────────────────────────────────────── */}
        {(!user || user.role === 'User') && (
          <View style={styles.group}>
            <Text style={styles.groupTitle}>My Account</Text>
            <MenuItem icon="home-outline"         title="My Properties"     subtitle="Properties you've posted" onPress={() => nav.navigate('PostProperty')} />
            <MenuItem icon="heart-outline"        title="Saved Properties"  subtitle="Your saved properties" onPress={() => nav.navigate('Favorites')} />
            <MenuItem icon="notifications-outline" title="Notifications"    onPress={() => {}} />
          </View>
        )}

        {/* ── CONTACT ───────────────────────────────────────────────────────── */}
        <View style={styles.group}>
          <Text style={styles.groupTitle}>Contact Ivanta</Text>
          <MenuItem icon="call-outline"      title="Call Us"      subtitle="+91 84605 67890"          onPress={() => Linking.openURL('tel:+918460567890')} />
          <MenuItem icon="logo-whatsapp"     title="WhatsApp"     subtitle="+91 84605 67890"          iconColor="#25d366" iconBg="#f0fdf4" onPress={() => Linking.openURL('https://wa.me/918460567890')} />
          <MenuItem icon="mail-outline"      title="Email Us"     subtitle="ivantaproperty@gmail.com" onPress={() => Linking.openURL('mailto:ivantaproperty@gmail.com')} />
          <MenuItem icon="globe-outline"     title="Visit Website" subtitle="ivantaproperties.com"   onPress={() => Linking.openURL('https://ivantaproperties.com')} />
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>Social</Text>
          <MenuItem icon="logo-instagram" title="Instagram" subtitle="@ivantaproperty"    iconColor="#e1306c" iconBg="#fdf2f8" onPress={() => Linking.openURL('https://www.instagram.com/ivantaproperty/')} />
          <MenuItem icon="logo-facebook"  title="Facebook"  subtitle="ivantaproperty"     iconColor="#1877f2" iconBg="#eff6ff" onPress={() => Linking.openURL('https://www.facebook.com/ivantaproperty')} />
          <MenuItem icon="logo-linkedin"  title="LinkedIn"  subtitle="Ivanta Property"    iconColor="#0a66c2" iconBg="#eff6ff" onPress={() => Linking.openURL('https://www.linkedin.com/company/ivanta-property/')} />
        </View>

        <View style={styles.group}>
          <Text style={styles.groupTitle}>App</Text>
          <MenuItem icon="star-outline"          title="Rate App"       onPress={() => {}} />
          <MenuItem icon="document-text-outline" title="Privacy Policy" onPress={() => Linking.openURL('https://ivantaproperties.com')} />
        </View>

        <View style={styles.addressCard}>
          <Ionicons name="location-outline" size={16} color="#c0392b" />
          <Text style={styles.addressText}>
            903, Sanskar Heights, Umiya Circle, 150 Ft Ring Road, Mavdi, Rajkot - 360004
          </Text>
        </View>

        <Text style={styles.version}>
          Ivanta Properties v1.0.0{'\n'}© {new Date().getFullYear()} Ivanta Ventures LLP
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },

  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', padding: 20, gap: 14,
    borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
  },
  avatar: {
    width: 58, height: 58, borderRadius: 29,
    justifyContent: 'center', alignItems: 'center',
  },
  name: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
  email: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  roleBadge: {
    alignSelf: 'flex-start', marginTop: 6,
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
  },
  roleBadgeText: { fontSize: 11, fontWeight: '700' },

  loginBtn: {
    backgroundColor: '#c0392b', margin: 16,
    paddingVertical: 13, borderRadius: 10, alignItems: 'center',
  },
  loginBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    margin: 16, paddingVertical: 11, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#fecaca', backgroundColor: '#fef2f2',
  },
  logoutBtnText: { color: '#c0392b', fontSize: 14, fontWeight: '700' },

  // Dashboard
  dashHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10,
  },
  dashTitle: { fontSize: 15, fontWeight: '800' },
  statsRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, marginBottom: 4,
  },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 10,
    alignItems: 'center', borderTopWidth: 3,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 1 },
  },
  statVal: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  statLabel: { fontSize: 9, color: '#9ca3af', marginTop: 2, textAlign: 'center' },

  group: { backgroundColor: '#fff', marginTop: 14 },
  groupTitle: {
    fontSize: 11, fontWeight: '700', color: '#9ca3af',
    paddingHorizontal: 16, paddingVertical: 9,
    backgroundColor: '#f9fafb', textTransform: 'uppercase', letterSpacing: 0.8,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 12,
  },
  menuIcon: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  menuTitle: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  menuSub: { fontSize: 11, color: '#9ca3af', marginTop: 1 },

  addressCard: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: '#fff', margin: 14, padding: 14,
    borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb',
  },
  addressText: { flex: 1, fontSize: 12, color: '#6b7280', lineHeight: 18 },
  version: { textAlign: 'center', color: '#9ca3af', fontSize: 11, padding: 20, lineHeight: 18 },
});
