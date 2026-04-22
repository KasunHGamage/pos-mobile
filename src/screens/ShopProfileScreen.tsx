import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { ENDPOINTS } from '../config/api';

const { width } = Dimensions.get('window');

export default function ShopProfileScreen() {
  const navigation = useNavigation();
  const { shop, token, refreshAuth } = useAuth();

  // Internal component state
  const [shopName, setShopName] = useState(shop?.name || '');
  const [registerNum, setRegisterNum] = useState(shop?.registrationNumber || '');
  const [ownerName, setOwnerName] = useState(shop?.ownerName || '');
  const [phone, setPhone] = useState(shop?.phone || '');
  const [address, setAddress] = useState(shop?.address || '');
  const [dealerCode, setDealerCode] = useState(shop?.dealerCode || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Focus refs
  const nameRef = useRef<TextInput>(null);
  const registerRef = useRef<TextInput>(null);
  const ownerRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const dealerRef = useRef<TextInput>(null);

  // Sync state if shop data changes
  useEffect(() => {
    if (shop) {
      setShopName(shop.name || '');
      setRegisterNum(shop.registrationNumber || '');
      setOwnerName(shop.ownerName || '');
      setPhone(shop.phone || '');
      setAddress(shop.address || '');
      setDealerCode(shop.dealerCode || '');
    }
  }, [shop]);

  const handleSave = async () => {
    if (!shop?.id || !token) {
      Alert.alert('Error', 'Session expired or shop not found');
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await fetch(`${ENDPOINTS.shop.base}/${shop.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: shopName,
          registrationNumber: registerNum,
          ownerName: ownerName,
          phone: phone,
          address: address,
          dealerCode: dealerCode,
        })
      });

      if (response.ok) {
        await refreshAuth();
        Alert.alert('Success', 'Shop profile updated successfully');
        navigation.goBack();
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Failed to update shop profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const EditButton = ({ onPress }: { onPress?: () => void }) => (
    <TouchableOpacity style={styles.editBtn} onPress={onPress}>
      <Ionicons name="pencil" size={14} color="#FFF" />
    </TouchableOpacity>
  );

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shop Profile</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* Floating Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={{ width: 92, height: 92, borderRadius: 46 }} />
              ) : (
                <>
                  <Ionicons name="cart" size={32} color="#15803D" />
                  <Text style={styles.avatarText}>SHOP</Text>
                </>
              )}
            </View>
            <View style={styles.avatarEditContainer}>
               <EditButton onPress={handlePickImage} />
            </View>
          </View>

          <View style={styles.profileHeaderContent}>
            <Text style={styles.profileMainName}>{shopName || 'Unnamed Shop'}</Text>
            <Text style={styles.profileSubName}>{ownerName || 'No owner specified'}</Text>
          </View>

          {/* Form Fields List */}
          <View style={styles.fieldsContainer}>
            <View style={styles.fieldRow}>
              <View style={styles.fieldLeftIcon}>
                <Ionicons name="storefront-outline" size={24} color="#888" />
              </View>
              <View style={styles.fieldBody}>
                <Text style={styles.fieldLabel}>Shop name</Text>
                <TextInput ref={nameRef} style={styles.fieldInput} value={shopName} onChangeText={setShopName} />
              </View>
              <EditButton onPress={() => nameRef.current?.focus()} />
            </View>

            <View style={styles.fieldRow}>
              <View style={styles.fieldLeftIcon}>
                <Ionicons name="business-outline" size={24} color="#888" />
              </View>
              <View style={styles.fieldBody}>
                <Text style={styles.fieldLabel}>Shop Register Number</Text>
                <TextInput ref={registerRef} style={styles.fieldInput} value={registerNum} onChangeText={setRegisterNum} />
              </View>
              <EditButton onPress={() => registerRef.current?.focus()} />
            </View>

            <View style={styles.fieldRow}>
              <View style={styles.fieldLeftIcon}>
                <Ionicons name="person-outline" size={24} color="#888" />
              </View>
              <View style={styles.fieldBody}>
                <Text style={styles.fieldLabel}>Owner Name</Text>
                <TextInput ref={ownerRef} style={styles.fieldInput} value={ownerName} onChangeText={setOwnerName} />
              </View>
              <EditButton onPress={() => ownerRef.current?.focus()} />
            </View>

            <View style={styles.fieldRow}>
              <View style={styles.fieldLeftIcon}>
                <Ionicons name="call-outline" size={24} color="#888" />
              </View>
              <View style={styles.fieldBody}>
                <Text style={styles.fieldLabel}>Phone Number</Text>
                <TextInput ref={phoneRef} style={styles.fieldInput} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              </View>
              <EditButton onPress={() => phoneRef.current?.focus()} />
            </View>

            <View style={styles.fieldRow}>
              <View style={styles.fieldLeftIcon}>
                <Ionicons name="location-outline" size={24} color="#888" />
              </View>
              <View style={styles.fieldBody}>
                <Text style={styles.fieldLabel}>Shop Address</Text>
                <TextInput ref={addressRef} style={styles.fieldInput} value={address} onChangeText={setAddress} />
              </View>
              <EditButton onPress={() => addressRef.current?.focus()} />
            </View>

            <View style={styles.fieldRow}>
              <View style={styles.fieldLeftIcon}>
                <Ionicons name="pricetag-outline" size={24} color="#888" />
              </View>
              <View style={styles.fieldBody}>
                <Text style={styles.fieldLabel}>Dealer Code</Text>
                <TextInput ref={dealerRef} style={styles.fieldInput} value={dealerCode} onChangeText={setDealerCode} placeholder="Enter dealer code" />
              </View>
              <EditButton onPress={() => dealerRef.current?.focus()} />
            </View>
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionsBox}>
          <TouchableOpacity style={styles.btnCancel} onPress={() => navigation.goBack()} disabled={isSaving}>
            <Text style={styles.btnCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.btnSave, isSaving && { opacity: 0.7 }]} 
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnSaveText}>Save</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#000' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  card: { backgroundColor: '#FFF', width: '100%', borderRadius: 12, elevation: 3, paddingHorizontal: 20, paddingBottom: 30, position: 'relative', marginTop: 20 },
  avatarSection: { position: 'absolute', top: -50, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FDE6BA', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', borderWidth: 4, borderColor: '#FFF' },
  avatarText: { fontWeight: '900', fontSize: 16, color: '#333', marginLeft: 2 },
  avatarEditContainer: { position: 'absolute', bottom: 5, right: -10 },
  profileHeaderContent: { marginTop: 65, alignItems: 'center', marginBottom: 30 },
  profileMainName: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 2 },
  profileSubName: { fontSize: 14, color: '#888', fontWeight: '600' },
  fieldsContainer: { width: '100%' },
  fieldRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  fieldLeftIcon: { width: 32, marginRight: 16, alignItems: 'center' },
  fieldBody: { flex: 1, justifyContent: 'center' },
  fieldLabel: { fontSize: 13, color: '#9CA3AF', fontWeight: '500', marginBottom: 4 },
  fieldInput: { fontSize: 16, fontWeight: '600', color: '#111827', padding: 0 },
  editBtn: { width: 26, height: 26, borderRadius: 6, backgroundColor: '#888', alignItems: 'center', justifyContent: 'center' },
  actionsBox: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, gap: 16 },
  btnCancel: { flex: 1, height: 56, backgroundColor: '#000', borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  btnCancelText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  btnSave: { flex: 1, height: 56, backgroundColor: '#9333EA', borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  btnSaveText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
