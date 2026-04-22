import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TouchableWithoutFeedback, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useCurrency } from '../context/CurrencyContext';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { currency, setCurrency } = useCurrency();
  const { user, shop, logout } = useAuth();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  // Avatar initials derived from shop name
  const shopInitials = shop?.name
    ? shop.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            await logout();
            navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
          },
        },
      ]
    );
  };

  const MENU_ITEMS = [
    { id: '0',  title: 'Profile',                 icon: 'person-outline',     action: () => navigation.navigate('ShopProfile') as any },
    { id: '1',  title: 'Home',                    icon: 'home-outline',       action: () => navigation.navigate('MainTabs', { screen: 'Shop' }) as any },
    { id: '2',  title: 'Currency Settings',       icon: 'cash-outline',       action: () => setShowCurrencyModal(true) },
    { id: '3',  title: 'Sub admins',              icon: 'people-outline',     action: () => navigation.navigate('SubAdmins') as any },
    { id: '4',  title: 'Manage Customers',        icon: 'person-add-outline', action: () => navigation.navigate('Customers') },
    { id: '5',  title: 'Billing',                 icon: 'receipt-outline',    action: () => navigation.navigate('UserBilling') as any },
    { id: '7',  title: 'Bill & Inventory History',icon: 'time-outline',       action: () => navigation.navigate('BillInventoryHistory') as any },
    { id: '8',  title: 'User Settings',           icon: 'person-outline',     action: () => navigation.navigate('UserSettings') as any },
    { id: '9',  title: 'App Settings',            icon: 'settings-outline',   action: () => navigation.navigate('AppSettings') as any },
    { id: '11', title: 'About App',               icon: 'apps-outline',       action: () => navigation.navigate('AboutApp') as any },
    { id: '12', title: 'Logout',                  icon: 'log-out-outline',    action: handleLogout },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.navigate('MainTabs', { screen: 'Shop' } as any)}>
          <Ionicons name="close" size={28} color="#666" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <Text style={styles.langText}>ENG</Text>
          <Ionicons name="globe-outline" size={22} color={colors.primary} style={{ marginLeft: 6, marginRight: 16 }} />
          <View style={styles.notificationWrapper}>
            <Ionicons name="notifications-outline" size={24} color={colors.primary} />
            <View style={styles.notificationDot} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Profile Card ── */}
        <View style={styles.profileSection}>
          {/* Avatar with shop initials */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{shopInitials}</Text>
            </View>
          </View>

          {/* Shop name — from backend */}
          <Text style={styles.profileName}>{shop?.name ?? '—'}</Text>

          {/* Phone number */}
          <Text style={styles.profilePhone}>{user?.phone ?? '—'}</Text>

          {/* Role badge */}
          {user?.role ? (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user.role}</Text>
            </View>
          ) : null}

          {/* Address (if set) */}
          {shop?.address ? (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={13} color="#888" />
              <Text style={styles.detailText}>{shop.address}</Text>
            </View>
          ) : null}

          {/* Owner name (if set) */}
          {shop?.ownerName ? (
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={13} color="#888" />
              <Text style={styles.detailText}>{shop.ownerName}</Text>
            </View>
          ) : null}

          {/* Plan badge */}
          {shop?.subscriptionPlan ? (
            <View style={[styles.roleBadge, { backgroundColor: '#ECFDF5', marginTop: 6 }]}>
              <Text style={[styles.roleText, { color: '#065F46' }]}>{shop.subscriptionPlan}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.divider} />

        {/* ── Menu ── */}
        <View style={styles.menuContainer}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.action}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={item.id === '12' ? '#EF4444' : colors.primary}
                />
              </View>
              <Text style={[styles.menuItemText, item.id === '12' && { color: '#EF4444' }]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Currency Modal */}
      <Modal visible={showCurrencyModal} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowCurrencyModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Select Currency</Text>
                {(['LKR', 'USD'] as const).map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.currencyOption, currency === c && styles.currencyOptionActive]}
                    onPress={() => { setCurrency(c); setShowCurrencyModal(false); }}
                  >
                    <Text style={[styles.currencyText, currency === c && styles.currencyTextActive]}>
                      {c === 'LKR' ? 'LKR (Rs.)' : 'USD ($)'}
                    </Text>
                    {currency === c && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#FDFEFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: { padding: 4 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  langText:    { fontSize: 14, fontWeight: '600', color: '#333' },
  notificationWrapper: { position: 'relative', marginRight: 8 },
  notificationDot: {
    position: 'absolute', top: 0, right: 2,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.primary,
  },
  scrollContent: { paddingBottom: 40 },

  // Profile section
  profileSection: { alignItems: 'center', marginTop: 10, paddingHorizontal: 16 },
  avatarContainer: { marginBottom: 12 },
  avatarCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: colors.primaryLight + '30',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.primaryLight,
  },
  avatarInitials: { fontSize: 28, fontWeight: '900', color: colors.primary },
  profileName:   { fontSize: 22, fontWeight: '800', color: '#000', marginBottom: 4, textAlign: 'center' },
  profilePhone:  { fontSize: 14, color: '#888', fontWeight: '500', marginBottom: 8 },
  roleBadge: {
    backgroundColor: colors.primaryLight + '20',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginTop: 4,
  },
  roleText:    { fontSize: 12, fontWeight: '700', color: colors.primary, letterSpacing: 0.5 },
  detailRow:   { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  detailText:  { fontSize: 12, color: '#888' },

  divider: {
    height: 1, backgroundColor: '#E5E7EB',
    marginHorizontal: 32, marginTop: 24, marginBottom: 16,
  },
  menuContainer: { paddingHorizontal: 32 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18 },
  iconContainer: { width: 30, alignItems: 'flex-start' },
  menuItemText:  { fontSize: 16, fontWeight: '700', color: '#000', marginLeft: 8 },

  // Currency modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalContainer: {
    width: '80%', backgroundColor: '#FFF',
    borderRadius: 16, padding: 24,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 20, textAlign: 'center' },
  currencyOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16,
    borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12,
  },
  currencyOptionActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight + '20' },
  currencyText:         { fontSize: 16, fontWeight: '600', color: '#666' },
  currencyTextActive:   { color: colors.primary },
});
