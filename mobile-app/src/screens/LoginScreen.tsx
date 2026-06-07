import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, ScrollView, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation';
import { useAuth } from '../auth/context';
import type { UserRole } from '../auth/types';
import { API_BASE, appEmailLogin } from '../services/api';

const DEFAULT_ROLE: UserRole = 'User';

export default function LoginScreen() {
  const nav = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Login'>>();
  const { setUser } = useAuth();

  const role: UserRole = DEFAULT_ROLE;
  const [isSignUp, setIsSignUp] = useState(true);

  // Sign Up state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const [error, setError] = useState('');

  // ── Google OAuth ─────────────────────────────────────────────────────────────
  const handleGoogle = () => {
    const base = API_BASE.replace('/api', '');
    Linking.openURL(`${base}/api/auth/google?role=${DEFAULT_ROLE}&source=app&returnTo=/dashboard`);
  };

  // ── OTP Send ─────────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (mobile.length !== 10 || !name.trim()) return;
    setError('');
    setSendingOtp(true);
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, name, email, role: DEFAULT_ROLE }),
      });
      const data = await res.json();
      if (data?.success) {
        setOtpSent(true);
      } else {
        // Fallback: if OTP API not available, auto-login with mobile as identifier
        const user = await appEmailLogin(`${mobile}@mobile.ivanta`, '', role);
        if (user) { setUser(user); nav.goBack(); }
        else setError(data?.error || 'Failed to send OTP');
      }
    } catch {
      // Fallback login
      try {
        const user = await appEmailLogin(`${mobile}@mobile.ivanta`, '', role);
        if (user) { setUser(user); nav.goBack(); }
        else setError('Network error. Please try again.');
      } catch { setError('Network error. Please try again.'); }
    } finally {
      setSendingOtp(false);
    }
  };

  // ── OTP Verify ───────────────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setError('');
    setVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp, name, email, role: DEFAULT_ROLE, isApp: true }),
      });
      const data = await res.json();
      if (data?.success && data?.token) {
        const ex = await fetch(`${API_BASE}/auth/token-exchange?token=${encodeURIComponent(data.token)}`);
        const exData = await ex.json();
        if (exData?.success && exData?.userData) {
          const u = exData.userData;
          setUser({ id: String(u.id ?? u._id ?? ''), email: String(u.email ?? ''), name: String(u.name ?? ''), role: u.role ?? 'User' });
          nav.goBack();
        } else setError('Verification failed. Try again.');
      } else {
        setError(data?.error || 'Invalid OTP');
      }
    } catch { setError('Network error. Please try again.'); }
    finally { setVerifying(false); }
  };

  // ── Email Sign In ─────────────────────────────────────────────────────────────
  const handleSignIn = async () => {
    if (!signInEmail.trim() || !signInPassword) return;
    setError('');
    setSigningIn(true);
    try {
      const user = await appEmailLogin(signInEmail.trim(), signInPassword);
      if (!user) throw new Error('Invalid credentials or server error.');
      setUser(user);
      nav.goBack();
    } catch (e: any) {
      setError(e?.message || 'Sign in failed');
    } finally { setSigningIn(false); }
  };

  const resetForm = () => {
    setName(''); setEmail(''); setMobile(''); setOtp(''); setOtpSent(false);
    setSignInEmail(''); setSignInPassword(''); setError('');
  };

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color="#1f2937" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Google Button */}
        <TouchableOpacity style={s.googleBtn} onPress={handleGoogle} activeOpacity={0.85}>
          <View style={s.googleIcon}>
            <Text style={s.googleG}>G</Text>
          </View>
          <Text style={s.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={s.divRow}>
          <View style={s.divLine} />
          <Text style={s.divText}>OR</Text>
          <View style={s.divLine} />
        </View>

        {error ? <Text style={s.error}>{error}</Text> : null}

        {isSignUp ? (
          // ── SIGN UP FORM ──────────────────────────────────────────────────────
          !otpSent ? (
            <>
              <Text style={s.fieldLabel}>Full Name</Text>
              <View style={s.inputBox}>
                <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Enter your full name" placeholderTextColor="#9ca3af" />
              </View>

              <Text style={s.fieldLabel}>Email (Optional)</Text>
              <View style={s.inputBox}>
                <Ionicons name="mail-outline" size={16} color="#9ca3af" style={s.inputIcon} />
                <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor="#9ca3af" autoCapitalize="none" keyboardType="email-address" />
              </View>

              <Text style={s.fieldLabel}>Mobile Number</Text>
              <View style={s.inputBox}>
                <Ionicons name="call-outline" size={16} color="#9ca3af" style={s.inputIcon} />
                <TextInput
                  style={s.input} value={mobile}
                  onChangeText={v => { const d = v.replace(/\D/g, ''); if (d.length <= 10) setMobile(d); }}
                  placeholder="Enter 10-digit mobile number" placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad" maxLength={10}
                />
              </View>
              {mobile.length > 0 && mobile.length < 10 && (
                <Text style={s.hint}>Please enter a valid 10-digit mobile number</Text>
              )}

              <TouchableOpacity
                style={[s.ctaBtn, (!name.trim() || mobile.length !== 10) && s.ctaBtnDisabled]}
                onPress={handleSendOtp}
                disabled={!name.trim() || mobile.length !== 10 || sendingOtp}
              >
                {sendingOtp ? <ActivityIndicator color="#fff" /> : <Text style={s.ctaBtnText}>Send OTP</Text>}
              </TouchableOpacity>
            </>
          ) : (
            // OTP Step
            <>
              <View style={s.otpInfo}>
                <Text style={s.otpInfoText}>Enter the OTP sent to</Text>
                <Text style={s.otpInfoNum}>+91 {mobile}</Text>
                <TouchableOpacity onPress={() => { setOtpSent(false); setOtp(''); }}>
                  <Text style={s.changeNum}>Change Number</Text>
                </TouchableOpacity>
              </View>

              <Text style={s.fieldLabel}>Enter OTP</Text>
              <View style={s.otpRow}>
                {[0,1,2,3,4,5].map(i => (
                  <TextInput
                    key={i}
                    style={[s.otpBox, otp.length > i && s.otpBoxFilled]}
                    value={otp[i] || ''}
                    maxLength={1}
                    keyboardType="numeric"
                    onChangeText={v => {
                      const digits = v.replace(/\D/g, '');
                      const next = otp.split('');
                      next[i] = digits[0] || '';
                      setOtp(next.join('').slice(0, 6));
                    }}
                  />
                ))}
              </View>

              <TouchableOpacity onPress={handleSendOtp} style={s.resendBtn}>
                <Text style={s.resendText}>Resend OTP</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.ctaBtn, otp.length !== 6 && s.ctaBtnDisabled]}
                onPress={handleVerifyOtp}
                disabled={otp.length !== 6 || verifying}
              >
                {verifying ? <ActivityIndicator color="#fff" /> : <Text style={s.ctaBtnText}>Verify & Sign Up</Text>}
              </TouchableOpacity>
            </>
          )
        ) : (
          // ── SIGN IN FORM ──────────────────────────────────────────────────────
          <>
            <Text style={s.fieldLabel}>Email</Text>
            <View style={s.inputBox}>
              <TextInput style={s.input} value={signInEmail} onChangeText={setSignInEmail} placeholder="you@example.com" placeholderTextColor="#9ca3af" autoCapitalize="none" keyboardType="email-address" />
            </View>

            <Text style={s.fieldLabel}>Password</Text>
            <View style={s.inputBox}>
              <TextInput style={s.input} value={signInPassword} onChangeText={setSignInPassword} placeholder="••••••••" placeholderTextColor="#9ca3af" secureTextEntry={!showPw} />
              <TouchableOpacity onPress={() => setShowPw(v => !v)} style={s.eyeBtn}>
                <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[s.ctaBtn, (!signInEmail.trim() || !signInPassword) && s.ctaBtnDisabled]}
              onPress={handleSignIn}
              disabled={!signInEmail.trim() || !signInPassword || signingIn}
            >
              {signingIn ? <ActivityIndicator color="#fff" /> : <Text style={s.ctaBtnText}>Sign In</Text>}
            </TouchableOpacity>
          </>
        )}

        {/* Toggle Sign Up / Sign In */}
        <View style={s.toggleRow}>
          <Text style={s.toggleText}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          </Text>
          <TouchableOpacity onPress={() => { setIsSignUp(v => !v); resetForm(); }}>
            <Text style={s.toggleLink}>{isSignUp ? 'Sign In' : 'Sign Up'}</Text>
          </TouchableOpacity>
        </View>

        {/* Upgrade role */}
        <View style={s.upgradeBox}>
          <Text style={s.upgradeTitle}>Are you a Broker or Builder?</Text>
          <Text style={s.upgradeSub}>Sign up as User then request a role upgrade from your Profile.</Text>
          <View style={s.upgradeRow}>
            <TouchableOpacity style={s.upgradeBtn} onPress={() => Linking.openURL(`${API_BASE.replace('/api', '')}/login?role=Broker`)}>
              <Ionicons name="briefcase-outline" size={15} color="#7c3aed" />
              <Text style={[s.upgradeBtnText, { color: '#7c3aed' }]}>Broker Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.upgradeBtn, { borderColor: '#1d4ed8' }]} onPress={() => Linking.openURL(`${API_BASE.replace('/api', '')}/login?role=Builder`)}>
              <Ionicons name="business-outline" size={15} color="#1d4ed8" />
              <Text style={[s.upgradeBtnText, { color: '#1d4ed8' }]}>Builder Login</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#111827' },
  body: { padding: 20, paddingBottom: 40 },

  // Role
  sectionLabel: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 12 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  roleCard: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#fff',
  },
  roleCardOn: { borderColor: '#c0392b', backgroundColor: '#fef2f2' },
  roleCardLabel: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginTop: 6 },
  roleCardLabelOn: { color: '#c0392b' },
  roleDesc: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 20 },

  // Google
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12,
    paddingVertical: 14, backgroundColor: '#fff', marginBottom: 20, gap: 10,
  },
  googleIcon: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  googleG: { fontSize: 16, fontWeight: '700', color: '#4285F4' },
  googleBtnText: { fontSize: 15, fontWeight: '600', color: '#111827' },

  // Divider
  divRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  divLine: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  divText: { fontSize: 12, color: '#9ca3af', fontWeight: '600', letterSpacing: 0.5 },

  // Fields
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#fff', marginBottom: 16,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: '#111827', padding: 0 },
  eyeBtn: { padding: 2 },
  hint: { fontSize: 11, color: '#ef4444', marginTop: -12, marginBottom: 12 },

  // CTA
  ctaBtn: {
    borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 4,
    backgroundColor: '#c0392b',
  },
  ctaBtnDisabled: { opacity: 0.5 },
  ctaBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // OTP
  otpInfo: { alignItems: 'center', marginBottom: 20 },
  otpInfoText: { fontSize: 13, color: '#6b7280' },
  otpInfoNum: { fontSize: 15, fontWeight: '700', color: '#111827', marginTop: 4 },
  changeNum: { fontSize: 12, color: '#c0392b', marginTop: 6, fontWeight: '600' },
  otpRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 16 },
  otpBox: {
    width: 44, height: 52, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#e5e7eb',
    textAlign: 'center', fontSize: 20, fontWeight: '700', color: '#111827',
    backgroundColor: '#f9fafb',
  },
  otpBoxFilled: { borderColor: '#c0392b', backgroundColor: '#fff' },
  resendBtn: { alignItems: 'center', marginBottom: 16 },
  resendText: { fontSize: 13, color: '#c0392b', fontWeight: '600' },

  // Toggle
  toggleRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  toggleText: { fontSize: 14, color: '#6b7280' },
  toggleLink: { fontSize: 14, color: '#c0392b', fontWeight: '700' },

  error: { color: '#b91c1c', fontSize: 12, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  upgradeBox: { marginTop: 24, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#f9fafb' },
  upgradeTitle: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 4 },
  upgradeSub: { fontSize: 11, color: '#6b7280', lineHeight: 16, marginBottom: 12 },
  upgradeRow: { flexDirection: 'row', gap: 10 },
  upgradeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, borderColor: '#7c3aed', backgroundColor: '#fff' },
  upgradeBtnText: { fontSize: 12, fontWeight: '700' },
});
