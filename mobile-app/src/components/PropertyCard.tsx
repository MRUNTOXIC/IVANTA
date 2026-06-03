import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Property } from '../types/Property';

const cardWidth = (Dimensions.get('window').width - 40) / 2;

interface Props {
  property: Property;
  onPress: () => void;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
}

export default function PropertyCard({ property, onPress, isFavorite, onFavoritePress }: Props) {
  const image = property.images?.[0] ?? '';
  const location = `${property.area}, ${property.city}`;
  const beds = Array.isArray(property.beds) ? property.beds.join(', ') : property.beds;
  const showBeds = beds && property.propertyType !== 'commercial' && property.propertyType !== 'plot';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      {/* Image */}
      <View style={styles.imgWrap}>
        <Image
          source={image ? { uri: image } : require('../../assets/placeholder.png')}
          style={styles.img}
          contentFit="cover"
          transition={200}
        />

        {/* Sold overlay */}
        {property.isSold && (
          <View style={styles.soldOverlay}>
            <Text style={styles.soldText}>SOLD</Text>
          </View>
        )}

        {/* Badge — gradient style */}
        {property.badge && !property.isSold && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{property.badge}</Text>
          </View>
        )}

        {/* Verified */}
        {property.isVerified && !property.isSold && (
          <View style={styles.verified}>
            <Ionicons name="checkmark-circle" size={10} color="#fff" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}

        {/* Image count */}
        {property.images?.length > 1 && (
          <View style={styles.imgCount}>
            <Text style={styles.imgCountText}>1/{property.images.length}</Text>
          </View>
        )}

        {/* Heart */}
        {onFavoritePress && (
          <TouchableOpacity style={styles.heart} onPress={onFavoritePress}>
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={16} color={isFavorite ? '#ef4444' : '#6b7280'} />
          </TouchableOpacity>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        {/* Price */}
        {!property.price && !property.priceFrom ? (
          <View style={styles.priceRow}>
            <Ionicons name="call-outline" size={12} color="#c0392b" />
            <Text style={styles.price}>Call for Price</Text>
          </View>
        ) : (
          <Text style={styles.price}>
            {property.priceFrom
              ? `₹${property.priceFrom} – ₹${property.priceTo || '...'}`
              : `₹${property.price}`}
          </Text>
        )}

        <Text style={styles.title} numberOfLines={1}>{property.title}</Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={10} color="#9ca3af" />
          <Text style={styles.location} numberOfLines={1}>{location}</Text>
        </View>

        {/* PG tags */}
        {property.propertyType === 'pg' ? (
          <View style={styles.tagsRow}>
            {property.subType ? <Text style={styles.tag}>{property.subType}</Text> : null}
            {property.foodAvailable ? <Text style={[styles.tag, styles.tagGreen]}>🍽️ Food</Text> : null}
            {property.acAvailable ? <Text style={[styles.tag, styles.tagBlue]}>❄️ AC</Text> : null}
          </View>
        ) : (
          <View style={styles.statsRow}>
            {showBeds && (
              <View style={styles.stat}>
                <Ionicons name="bed-outline" size={11} color="#6b7280" />
                <Text style={styles.statText}>{beds}</Text>
              </View>
            )}
            <View style={styles.stat}>
              <Ionicons name="resize-outline" size={11} color="#6b7280" />
              <Text style={styles.statText}>{property.sqft}</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  imgWrap: { height: 120, position: 'relative', backgroundColor: '#f3f4f6' },
  img: { width: '100%', height: '100%' },
  soldOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldText: { color: '#fff', fontWeight: '800', fontSize: 14, backgroundColor: '#ea580c', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badge: {
    position: 'absolute', top: 7, left: 7,
    backgroundColor: '#c0392b',
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  verified: {
    position: 'absolute', bottom: 7, left: 7,
    backgroundColor: '#16a34a',
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20,
  },
  verifiedText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  imgCount: {
    position: 'absolute', bottom: 7, right: 7,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10,
  },
  imgCountText: { color: '#fff', fontSize: 9, fontWeight: '600' },
  heart: {
    position: 'absolute', top: 7, right: 7,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14, padding: 5,
  },
  info: { padding: 9 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  price: { fontSize: 13, fontWeight: '800', color: '#c0392b', marginBottom: 2 },
  title: { fontSize: 12, fontWeight: '600', color: '#1f2937', marginBottom: 3 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 6 },
  location: { fontSize: 10, color: '#9ca3af', flex: 1 },
  statsRow: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 6 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statText: { fontSize: 10, color: '#6b7280' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 6 },
  tag: { fontSize: 9, fontWeight: '600', color: '#c0392b', backgroundColor: '#fef2f2', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  tagGreen: { color: '#15803d', backgroundColor: '#f0fdf4' },
  tagBlue: { color: '#1d4ed8', backgroundColor: '#eff6ff' },
});
