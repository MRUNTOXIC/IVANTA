import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation';
import { useAuth } from '../auth/context';
import { adminCreateProperty } from '../services/api';

const PROPERTY_TYPES = ['buy', 'rent', 'commercial', 'plot', 'pg'];
const CATEGORIES = ['None', 'Featured Property', 'Luxury Property', 'Popular Property', 'Upcoming Projects'];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  return <TextInput style={styles.input} placeholderTextColor="#9ca3af" {...props} />;
}

function ChipRow({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt}
          style={[styles.chip, value === opt && styles.chipActive]}
          onPress={() => onChange(opt)}
        >
          <Text style={[styles.chipText, value === opt && styles.chipTextActive]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

export default function PostPropertyScreen() {
  const nav = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [propertyType, setPropertyType] = useState('buy');
  const [subType, setSubType] = useState('');
  const [category, setCategory] = useState('None');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Rajkot');
  const [state, setState] = useState('Gujarat');
  const [sqft, setSqft] = useState('');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.guestWrap}>
          <Ionicons name="lock-closed-outline" size={48} color="#c0392b" />
          <Text style={styles.guestTitle}>Sign In Required</Text>
          <Text style={styles.guestSub}>You need to be signed in to post a property.</Text>
          <TouchableOpacity style={styles.signInBtn} onPress={() => nav.navigate('Login')}>
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const canSubmit = title.trim() && price.trim() && area.trim() && city.trim();

  const submit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    try {
      const res = await adminCreateProperty({
        title: title.trim(),
        price: price.trim(),
        propertyType,
        subType: subType.trim() || propertyType,
        category,
        area: area.trim(),
        city: city.trim(),
        state: state.trim(),
        sqft: sqft.trim(),
        description: description.trim(),
        contactPhone: contactPhone.trim(),
        amenities: [],
        images: [],
        createdAt: new Date().toISOString(),
        slug: title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      });

      if (res?.success) {
        Alert.alert('Success!', 'Your property has been posted. It will appear on the website and app.', [
          { text: 'OK', onPress: () => nav.goBack() },
        ]);
      } else {
        Alert.alert('Error', res?.error || 'Failed to post property. Please try again.');
      }
    } catch {
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={16} color="#1d4ed8" />
          <Text style={styles.infoText}>
            Properties posted here will reflect on the website and app in real-time.
          </Text>
        </View>

        <Field label="Property Title *">
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. 3 BHK Apartment in Mavdi"
          />
        </Field>

        <Field label="Property Type *">
          <ChipRow options={PROPERTY_TYPES} value={propertyType} onChange={setPropertyType} />
        </Field>

        <Field label="Category">
          <ChipRow options={CATEGORIES} value={category} onChange={setCategory} />
        </Field>

        <Field label="Sub Type">
          <Input
            value={subType}
            onChangeText={setSubType}
            placeholder="e.g. Apartment, Villa, Shop..."
          />
        </Field>

        <Field label="Price *">
          <Input
            value={price}
            onChangeText={setPrice}
            placeholder="e.g. ₹45 Lakh or ₹12,000/month"
            keyboardType="default"
          />
        </Field>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Area / Locality *">
              <Input value={area} onChangeText={setArea} placeholder="e.g. Mavdi" />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="City *">
              <Input value={city} onChangeText={setCity} placeholder="Rajkot" />
            </Field>
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="State">
              <Input value={state} onChangeText={setState} placeholder="Gujarat" />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Area (sq.ft)">
              <Input value={sqft} onChangeText={setSqft} placeholder="e.g. 1200" keyboardType="numeric" />
            </Field>
          </View>
        </View>

        <Field label="Description">
          <TextInput
            style={[styles.input, styles.textarea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the property..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Field>

        <Field label="Contact Phone">
          <Input
            value={contactPhone}
            onChangeText={setContactPhone}
            placeholder="+91 XXXXX XXXXX"
            keyboardType="phone-pad"
          />
        </Field>

        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={submit}
          disabled={!canSubmit || loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : (
              <>
                <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
                <Text style={styles.submitBtnText}>Post Property</Text>
              </>
            )
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  body: { padding: 14, gap: 4, paddingBottom: 32 },
  guestWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  guestTitle: { fontSize: 20, fontWeight: '800', color: '#1f2937' },
  guestSub: { fontSize: 13, color: '#6b7280', textAlign: 'center' },
  signInBtn: { backgroundColor: '#c0392b', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 10, marginTop: 8 },
  signInBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  infoCard: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: '#eff6ff', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#bfdbfe', marginBottom: 8,
  },
  infoText: { flex: 1, fontSize: 12, color: '#1d4ed8', lineHeight: 18 },
  field: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 13, color: '#111827',
  },
  textarea: { minHeight: 90, paddingTop: 10 },
  row: { flexDirection: 'row', gap: 10 },
  chipRow: { gap: 8, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: '#f3f4f6',
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  chipActive: { backgroundColor: '#c0392b', borderColor: '#c0392b' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  chipTextActive: { color: '#fff' },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#c0392b', borderRadius: 12, paddingVertical: 15, marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
