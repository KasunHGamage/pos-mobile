import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

type OtpNavProp = NativeStackNavigationProp<RootStackParamList, 'OtpVerify'>;
type OtpRouteProp = RouteProp<RootStackParamList, 'OtpVerify'>;

interface Props {
  navigation: OtpNavProp;
  route: OtpRouteProp;
}

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function OtpVerifyScreen({ navigation, route }: Props) {
  const { phone, context } = route.params;
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleChange = (text: string, index: number) => {
    setError('');
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    // Auto-advance to next box
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setError('Please enter the complete 6-digit code.');
      shake();
      return;
    }
    // TODO: Call API to verify OTP
    // For now simulate success and navigate to correct place
    if (context === 'signup') {
      navigation.replace('Login');
    } else {
      navigation.replace('MainTabs', { screen: 'Shop' });
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    setCountdown(RESEND_SECONDS);
    setCanResend(false);
    inputRefs.current[0]?.focus();
    // TODO: Call API to resend OTP
  };

  const filled = otp.filter(Boolean).length;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        {/* Header */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Icon */}
        <View style={styles.iconWrap}>
          <LinearGradient colors={colors.gradients.primary} style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={38} color="#FFF" />
          </LinearGradient>
        </View>

        <Text style={styles.title}>Verify Your Number</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.phoneHighlight}>{phone}</Text>
        </Text>

        {/* OTP Boxes */}
        <Animated.View style={[styles.otpRow, { transform: [{ translateX: shakeAnim }] }]}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={ref => { inputRefs.current[i] = ref; }}
              style={[
                styles.otpBox,
                digit ? styles.otpBoxFilled : {},
                error ? styles.otpBoxError : {},
              ]}
              value={digit}
              onChangeText={text => handleChange(text, i)}
              onKeyPress={e => handleKeyPress(e, i)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              selectionColor={colors.primary}
              autoFocus={i === 0}
            />
          ))}
        </Animated.View>

        {/* Error */}
        {!!error && (
          <Text style={styles.errorText}>
            <Ionicons name="alert-circle-outline" size={13} /> {error}
          </Text>
        )}

        {/* Verify Button */}
        <TouchableOpacity
          onPress={handleVerify}
          activeOpacity={0.85}
          style={styles.verifyBtnWrap}
        >
          <LinearGradient
            colors={colors.gradients.primary}
            style={[styles.verifyBtn, filled < OTP_LENGTH && styles.verifyBtnDisabled]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.verifyBtnText}>Verify & Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 6 }} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Resend */}
        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Didn't receive the code?  </Text>
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>Resend OTP</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendCountdown}>Resend in {countdown}s</Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    padding: 8,
  },
  iconWrap: {
    marginBottom: 28,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textDark,
    letterSpacing: -0.3,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
  },
  phoneHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },

  // OTP Row
  otpRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  otpBox: {
    width: 48,
    height: 58,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontSize: 22,
    fontWeight: '700',
    color: colors.textDark,
  },
  otpBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '18',
  },
  otpBoxError: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },

  errorText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 20,
  },

  // Verify Button
  verifyBtnWrap: {
    width: '100%',
    marginTop: 8,
    marginBottom: 24,
  },
  verifyBtn: {
    height: 56,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  verifyBtnDisabled: {
    opacity: 0.55,
  },
  verifyBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Resend
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  resendLink: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  resendCountdown: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
});
