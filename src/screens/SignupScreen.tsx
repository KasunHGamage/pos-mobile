import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { registerShop } from '../services/authService';

type SignupNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;
interface Props { navigation: SignupNavigationProp; }

// ─── Input Row ────────────────────────────────────────────────────────────────

interface InputRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  rightElement?: React.ReactNode;
}

function InputRow({
  icon, placeholder, value, onChangeText,
  keyboardType = 'default', secureTextEntry = false,
  autoCapitalize = 'sentences', rightElement,
}: InputRowProps) {
  return (
    <View style={styles.inputContainer}>
      <Ionicons name={icon} size={20} color="#94A3B8" style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
      />
      {rightElement}
    </View>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SignupScreen({ navigation }: Props) {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 — Credentials
  const [phone, setPhone]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd]       = useState(false);
  const [showCPwd, setShowCPwd]     = useState(false);

  // Step 2 — Shop info
  const [shopName, setShopName]         = useState('');
  const [ownerName, setOwnerName]       = useState('');
  const [shopAddress, setShopAddress]   = useState('');
  const [regNumber, setRegNumber]       = useState('');
  const [dealerCode, setDealerCode]     = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateStep = (nextStep: 1 | 2) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setStep(nextStep);
  };

  // ── Validation & Navigation ───────────────────────────────────────────────

  const handleNext = () => {
    if (!phone.trim())          { Alert.alert('Required', 'Please enter your phone number.'); return; }
    if (phone.length < 9)       { Alert.alert('Invalid', 'Please enter a valid phone number.'); return; }
    if (password.length < 6)    { Alert.alert('Weak Password', 'Password must be at least 6 characters.'); return; }
    if (password !== confirmPwd){ Alert.alert('Mismatch', 'Passwords do not match.'); return; }
    animateStep(2);
  };

  const handleCreate = async () => {
    if (!shopName.trim()) { Alert.alert('Required', 'Please enter your shop name.'); return; }

    setIsLoading(true);
    try {
      await registerShop({
        shopName: shopName.trim(),
        phone:    phone.trim(),
        password,
      });

      Alert.alert(
        '🎉 Account Created!',
        'Your shop has been registered successfully. Please sign in.',
        [{ text: 'Sign In', onPress: () => navigation.replace('Login') }],
      );
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message ?? 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 2) { animateStep(1); }
    else            { navigation.goBack(); }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>

      {/* Gradient top strip */}
      <View style={styles.topStrip}>
        <LinearGradient colors={colors.gradients.primary} style={StyleSheet.absoluteFill} />
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>POS</Text>
          </View>
        </View>
        <Text style={styles.topTitle}>Create Account</Text>
        <Text style={styles.topSubtitle}>Get your shop up and running in minutes</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.card, { opacity: fadeAnim }]}>

            {/* Card title */}
            <Text style={styles.cardTitle}>
              {step === 1 ? 'Account Credentials' : 'Create Your Shop'}
            </Text>

            {/* ── STEP 1: Phone + Password ──────────────────────────── */}
            {step === 1 && (
              <>
                <InputRow
                  icon="call-outline"
                  placeholder="Phone Number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
                <InputRow
                  icon="lock-closed-outline"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPwd}
                  autoCapitalize="none"
                  rightElement={
                    <TouchableOpacity onPress={() => setShowPwd(v => !v)}>
                      <Ionicons
                        name={showPwd ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  }
                />
                <InputRow
                  icon="lock-closed-outline"
                  placeholder="Confirm Password"
                  value={confirmPwd}
                  onChangeText={setConfirmPwd}
                  secureTextEntry={!showCPwd}
                  autoCapitalize="none"
                  rightElement={
                    <TouchableOpacity onPress={() => setShowCPwd(v => !v)}>
                      <Ionicons
                        name={showCPwd ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  }
                />
                {/* Password strength hint */}
                {password.length > 0 && (
                  <View style={styles.strengthBar}>
                    <View style={[
                      styles.strengthFill,
                      {
                        width: `${Math.min((password.length / 12) * 100, 100)}%` as any,
                        backgroundColor: password.length < 6 ? '#F43F5E'
                          : password.length < 10 ? '#F59E0B' : '#10B981',
                      },
                    ]} />
                  </View>
                )}
              </>
            )}

            {/* ── STEP 2: Shop Info ──────────────────────────────────── */}
            {step === 2 && (
              <>
                <InputRow
                  icon="storefront-outline"
                  placeholder="Shop Name *"
                  value={shopName}
                  onChangeText={setShopName}
                  autoCapitalize="words"
                />
                <InputRow
                  icon="barcode-outline"
                  placeholder="Shop Register Number"
                  value={regNumber}
                  onChangeText={setRegNumber}
                  autoCapitalize="characters"
                />
                <InputRow
                  icon="person-outline"
                  placeholder="Owner Name"
                  value={ownerName}
                  onChangeText={setOwnerName}
                  autoCapitalize="words"
                />
                <InputRow
                  icon="location-outline"
                  placeholder="Shop Address"
                  value={shopAddress}
                  onChangeText={setShopAddress}
                />
                <InputRow
                  icon="pricetag-outline"
                  placeholder="Dealer Code (Optional)"
                  value={dealerCode}
                  onChangeText={setDealerCode}
                  autoCapitalize="characters"
                />
                <Text style={styles.dealerNote}>
                  (If you don't have the Dealer Code, Please disregard this field.)
                </Text>

                {/* API payload preview (subtle info) */}
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle-outline" size={14} color="#6366F1" />
                  <Text style={styles.infoText}>
                    Shop name, phone & password will be used to create your account.
                  </Text>
                </View>
              </>
            )}

            {/* ── Action Row ───────────────────────────────────────────── */}
            <View style={styles.actionRow}>
              {/* Step dots */}
              <View style={styles.dotsRow}>
                <View style={[styles.dot, step === 1 && styles.dotActive]} />
                <View style={[styles.dot, step === 2 && styles.dotActive]} />
              </View>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleBack}
                disabled={isLoading}
              >
                <Text style={styles.cancelBtnText}>{step === 2 ? 'Back' : 'Cancel'}</Text>
              </TouchableOpacity>

              {step === 1 ? (
                <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
                  <LinearGradient colors={colors.gradients.primary} style={styles.primaryBtn}>
                    <Text style={styles.primaryBtnText}>Next</Text>
                    <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 4 }} />
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleCreate}
                  activeOpacity={0.85}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={colors.gradients.primary}
                    style={[styles.primaryBtn, isLoading && { opacity: 0.7 }]}
                  >
                    {isLoading
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <>
                          <Text style={styles.primaryBtnText}>Create</Text>
                          <Ionicons name="checkmark" size={16} color="#fff" style={{ marginLeft: 4 }} />
                        </>
                    }
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          {/* Sign in link */}
          <View style={styles.signInRow}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  topStrip: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 28,
    overflow: 'hidden',
  },
  logoRow: {
    marginBottom: 14,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoBox: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
  },
  logoText: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: 1 },
  topTitle:    { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  topSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 5,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 19, fontWeight: '800', color: '#1E293B',
    marginBottom: 22, textAlign: 'center', letterSpacing: -0.3,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#1E293B', fontWeight: '500' },

  strengthBar: {
    height: 4, backgroundColor: '#E2E8F0', borderRadius: 2,
    marginBottom: 12, overflow: 'hidden',
  },
  strengthFill: { height: '100%', borderRadius: 2 },

  dealerNote: {
    fontSize: 12, color: '#A855F7',
    marginTop: 2, marginBottom: 8, marginLeft: 4, lineHeight: 17,
  },

  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: '#EEF2FF', borderRadius: 10,
    padding: 10, marginTop: 8,
  },
  infoText: { fontSize: 12, color: '#4338CA', flex: 1, lineHeight: 17 },

  actionRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'flex-end', marginTop: 20, gap: 10,
  },
  dotsRow: { flexDirection: 'row', gap: 6, flex: 1, alignItems: 'center' },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  dotActive: { backgroundColor: '#A855F7', width: 22, borderRadius: 4 },

  cancelBtn: {
    borderWidth: 1.5, borderColor: '#A855F7',
    borderRadius: 30, paddingVertical: 11, paddingHorizontal: 20,
  },
  cancelBtnText: { color: '#A855F7', fontWeight: '700', fontSize: 14 },

  primaryBtn: {
    borderRadius: 30, paddingVertical: 12, paddingHorizontal: 22,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 90, justifyContent: 'center',
  },
  primaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },

  signInRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  signInText: { fontSize: 14, color: '#64748B' },
  signInLink: { fontSize: 14, color: '#A855F7', fontWeight: '700' },
});
