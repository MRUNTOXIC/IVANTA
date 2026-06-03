import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  ScrollView, Dimensions, Image, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const W = Dimensions.get('window').width;

interface Props {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string, params?: object) => void;
}

const BUY_OPTIONS = [
  { label: 'Residential', screen: 'Properties', params: { type: 'buy' }, icon: 'home-outline' },
  { label: 'Commercial', screen: 'Properties', params: { type: 'commercial' }, icon: 'business-outline' },
  { label: 'Plots / Lands', screen: 'Properties', params: { type: 'plot' }, icon: 'map-outline' },
];

const NAV_LINKS = [
  { label: 'Home', screen: 'Home', icon: 'home-outline' },
  { label: 'Rentals', screen: 'Properties', params: { type: 'rent' }, icon: 'key-outline' },
  { label: 'PG / Hostel', screen: 'Properties', params: { type: 'pg' }, icon: 'bed-outline' },
  { label: 'Builder Projects', screen: 'Properties', params: { type: 'new' }, icon: 'construct-outline' },
  { label: 'Search', screen: 'Search', icon: 'search-outline' },
  { label: 'Favorites', screen: 'Favorites', icon: 'heart-outline' },
  { label: 'Post Property', screen: 'PostProperty', icon: 'add-circle-outline' },
  { label: 'Profile', screen: 'Profile', icon: 'person-outline' },
];

export default function DrawerMenu({ visible, onClose, onNavigate }: Props) {
  const insets = useSafeAreaInsets();

  const go = (screen: string, params?: object) => {
    onNavigate(screen, params);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        {/* Drawer slides in from LEFT */}
        <View style={[styles.drawer, { paddingTop: insets.top }]}>

          {/* Header — logo + close */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/IvantaLogo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#1f2937" />
            </TouchableOpacity>
          </View>

          {/* Nav content */}
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

            {/* Home */}
            <TouchableOpacity style={styles.navItem} onPress={() => go('Home')}>
              <Ionicons name="home-outline" size={18} color="#6b7280" />
              <Text style={styles.navLabel}>Home</Text>
            </TouchableOpacity>

            {/* Buy section */}
            <View style={styles.sectionHead}>
              <Text style={styles.sectionLabel}>BUY</Text>
            </View>
            {BUY_OPTIONS.map(opt => (
              <TouchableOpacity key={opt.label} style={[styles.navItem, styles.indented]} onPress={() => go(opt.screen, opt.params)}>
                <Ionicons name={opt.icon as any} size={17} color="#6b7280" />
                <Text style={styles.navLabel}>{opt.label}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.divider} />

            {/* Rentals, PG, Builder, etc */}
            {NAV_LINKS.slice(1).map(link => (
              <TouchableOpacity key={link.label} style={[styles.navItem, link.screen === 'PostProperty' && styles.navItemPost]} onPress={() => go(link.screen, (link as any).params)}>
                <Ionicons name={link.icon as any} size={18} color={link.screen === 'PostProperty' ? '#16a34a' : '#6b7280'} />
                <Text style={[styles.navLabel, link.screen === 'PostProperty' && styles.navLabelPost]}>{link.label}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.divider} />

            {/* Contact */}
            <View style={styles.sectionHead}>
              <Text style={styles.sectionLabel}>CONTACT</Text>
            </View>
            <TouchableOpacity style={styles.navItem} onPress={() => Linking.openURL('tel:+918460567890')}>
              <Ionicons name="call-outline" size={18} color="#6b7280" />
              <Text style={styles.navLabel}>+91 84605 67890</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => Linking.openURL('https://wa.me/918460567890')}>
              <Ionicons name="logo-whatsapp" size={18} color="#25d366" />
              <Text style={styles.navLabel}>WhatsApp Us</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => Linking.openURL('https://ivantaproperties.com')}>
              <Ionicons name="globe-outline" size={18} color="#6b7280" />
              <Text style={styles.navLabel}>Visit Website</Text>
            </TouchableOpacity>

          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
            <Text style={styles.footerText}>© {new Date().getFullYear()} Ivanta Ventures LLP</Text>
            <Text style={styles.footerSub}>Rajkot's Trusted Property Platform</Text>
          </View>
        </View>

        {/* Backdrop on the RIGHT — tap to close */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  drawer: {
    width: W * 0.80,
    backgroundColor: '#fff',
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 4, height: 0 },
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  logo: { height: 32, width: 130 },
  scroll: { flex: 1 },
  sectionHead: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 1.2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 8,
  },
  indented: { paddingLeft: 28 },
  navLabel: { fontSize: 14, fontWeight: '500', color: '#374151' },
  navLabelPost: { color: '#16a34a', fontWeight: '700' },
  navItemPost: { backgroundColor: '#f0fdf4' },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 6, marginHorizontal: 16 },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingTop: 12,
    alignItems: 'center',
  },
  footerText: { fontSize: 12, color: '#6b7280', fontWeight: '600' },
  footerSub: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
});
