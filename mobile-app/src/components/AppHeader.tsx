import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  onMenuPress: () => void;
  onSearchPress?: () => void;
  title?: string;
}

export default function AppHeader({ onMenuPress, onSearchPress, title }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        {/* Hamburger */}
        <TouchableOpacity onPress={onMenuPress} style={styles.iconBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="menu" size={26} color="#1f2937" />
        </TouchableOpacity>

        {/* Logo / Title */}
        <View style={styles.center}>
          {title ? (
            <Text style={styles.title}>{title}</Text>
          ) : (
            <Image
              source={require('../../assets/IvantaLogo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          )}
        </View>

        {/* Search or spacer */}
        {onSearchPress ? (
          <TouchableOpacity onPress={onSearchPress} style={styles.iconBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="search-outline" size={22} color="#1f2937" />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>
      {/* Brand gradient accent line */}
      <View style={styles.gradientLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  iconBtn: { width: 36, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center' },
  logo: { height: 36, width: 140 },
  title: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
  gradientLine: {
    height: 2,
    backgroundColor: '#c0392b',
    // We simulate the gradient with a solid brand red since RN LinearGradient needs expo-linear-gradient
  },
});
