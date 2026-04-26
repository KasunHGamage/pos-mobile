import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Button,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAudioPlayer } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { createInventoryItem } from '../services/inventoryService';
import { Alert } from 'react-native';
import SelectCategoryModal, { CategoryItem } from './SelectCategoryModal';

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  onProductAdded?: () => void;
}

export default function AddProductModal({ visible, onClose, onProductAdded }: AddProductModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const beepPlayer = useAudioPlayer('https://www.soundjay.com/buttons/beep-07a.mp3');
  const { currencySymbol } = useCurrency();
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [skuNumber, setSkuNumber] = useState('');
  const [productName, setProductName] = useState('');
  const [productCost, setProductCost] = useState('');
  const [retailPrice, setRetailPrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [discountAmt, setDiscountAmt] = useState('');
  const [quantity, setQuantity] = useState('');
  const [brandName, setBrandName] = useState('');
  
  // Dropdowns State
  const [showSelectCategoryModal, setShowSelectCategoryModal] = useState(false);
  const [category, setCategory] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);

  const [showTypePicker, setShowTypePicker] = useState(false);
  const [productType, setProductType] = useState('');
  const [unitType, setUnitType] = useState('PIECE'); // PIECE, WEIGHT, VOLUME
  const [showUnitTypePicker, setShowUnitTypePicker] = useState(false);
  const PRODUCT_TYPES = ['Units', 'kg', 'meter', 'pieces', 'liters', 'packs'];

  const handleCategorySelect = (selectedCat: CategoryItem) => {
    setCategory(selectedCat.name);
    setCategoryId(selectedCat.id);
    if (selectedCat.discount) {
      if (selectedCat.discountType === 'percentage') {
        setDiscountPercent(selectedCat.discount);
        setDiscountAmt('');
      } else if (selectedCat.discountType === 'amount') {
        setDiscountAmt(selectedCat.discount);
        setDiscountPercent('');
      }
    }
  };

  const closeAddScreen = () => {
    onClose();
    setSkuNumber('');
    setCategory('');
    setCategoryId(undefined);
    setProductType('');
    setUnitType('PIECE');
    setProductName('');
    setProductCost('');
    setRetailPrice('');
    setDiscountPercent('');
    setDiscountAmt('');
    setQuantity('');
    setBrandName('');
    setShowSelectCategoryModal(false);
    setShowTypePicker(false);
    setShowUnitTypePicker(false);
  };

  const handleSave = async () => {
    if (!productName || !retailPrice || !productCost || !quantity) {
      Alert.alert('Validation Error', 'Please fill in all required fields (marked with *).');
      return;
    }

    try {
      setIsSubmitting(true);
      await createInventoryItem({
        name: productName,
        sku: skuNumber || `SKU-${Date.now()}`,
        price: parseFloat(retailPrice),
        costPrice: parseFloat(productCost),
        retailPrice: parseFloat(retailPrice),
        discountPrice: discountAmt ? parseFloat(discountAmt) : undefined,
        stock: parseInt(quantity, 10),
        category: category,
        categoryId: categoryId,
        brand: brandName,
        brand: brandName,
        unit: productType,
        unit_type: unitType,
        unit_options: unitType === 'WEIGHT' ? { base_unit: 'kg', presets: [0.1, 0.25, 0.5, 1] } : 
                     unitType === 'VOLUME' ? { base_unit: 'L', presets: [0.1, 0.25, 0.5, 1] } : 
                     { base_unit: 'Unit', presets: [1, 2, 5, 10] },
      }, token || undefined);
      
      Alert.alert('Success', 'Product added successfully!');
      onProductAdded?.();
      closeAddScreen();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent={false} animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {isScanning ? (
             <View style={{ flex: 1, backgroundColor: '#000' }}>
               {!permission?.granted ? (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Text style={{ color: 'white', textAlign: 'center', marginBottom: 20 }}>We need your permission to scan barcodes</Text>
                    <Button title="Grant Permission" onPress={requestPermission} />
                    <View style={{ marginTop: 20 }}>
                      <Button title="Cancel" onPress={() => setIsScanning(false)} color="red" />
                    </View>
                  </View>
               ) : (
                  <CameraView 
                    style={{ flex: 1 }} 
                    facing="back"
                      onBarcodeScanned={({ data }) => {
                        setSkuNumber(data);
                        setIsScanning(false);
                        beepPlayer.play();
                      }}
                  >
                    <View style={{ flex: 1, justifyContent: 'flex-end', padding: 30, paddingBottom: 60 }}>
                      <TouchableOpacity style={styles.scanCancelBtn} onPress={() => setIsScanning(false)}>
                         <Text style={styles.scanCancelBtnText}>Cancel Scan</Text>
                      </TouchableOpacity>
                    </View>
                  </CameraView>
               )}
             </View>
          ) : (
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 150 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              
              <View style={[styles.addModalHeader, { marginTop: 0 }]}>
                 <Text style={[styles.addModalTitle, { fontSize: 18 }]}>Create New Category</Text>
                 <TouchableOpacity onPress={closeAddScreen}>
                   <Ionicons name="close" size={26} color={colors.textDark} />
                 </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.scanBarcodeBtnTop} onPress={() => setIsScanning(true)}>
                 <Text style={styles.scanBarcodeBtnTopText}>Use Barcode Scan</Text>
              </TouchableOpacity>

              <View style={styles.addModalFields}>
                 <View style={{ zIndex: 1 }}>
                   <TouchableOpacity 
                     style={styles.newInputBox} 
                     activeOpacity={0.7} 
                     onPress={() => setShowSelectCategoryModal(true)}
                   >
                     <Ionicons name="pricetag-outline" size={20} color={colors.textMuted} style={styles.newInputIcon} />
                     <Text style={[styles.newInput, !category && { color: colors.textMuted }]}>
                       {category || 'Select Category *'}
                     </Text>
                     <Ionicons name="chevron-down" size={20} color="#E91E63" />
                   </TouchableOpacity>
                 </View>

                 <View style={styles.newInputBox}>
                   <Ionicons name="pricetag-outline" size={20} color={colors.textMuted} style={styles.newInputIcon} />
                   <TextInput 
                     style={styles.newInput} 
                     placeholder="SKU Number" 
                     placeholderTextColor={colors.textMuted} 
                     value={skuNumber}
                     onChangeText={setSkuNumber}
                   />
                 </View>

                 <View style={styles.newInputBox}>
                   <Ionicons name="pricetag-outline" size={20} color={colors.textMuted} style={styles.newInputIcon} />
                   <TextInput 
                     style={styles.newInput} 
                     placeholder="Product Name *" 
                     placeholderTextColor={colors.textMuted} 
                     value={productName}
                     onChangeText={setProductName}
                   />
                 </View>

                 <View style={{ zIndex: showTypePicker ? 2000 : 1, elevation: showTypePicker ? 5 : 0 }}>
                   <TouchableOpacity 
                     style={styles.newInputBox}
                     activeOpacity={0.7} 
                     onPress={() => setShowTypePicker(!showTypePicker)}
                   >
                     <Ionicons name="pricetag-outline" size={20} color={colors.textMuted} style={styles.newInputIcon} />
                     <Text style={[styles.newInput, !productType && { color: colors.textMuted }]}>
                       {productType || 'Product Type *'}
                     </Text>
                     <Ionicons name="chevron-down" size={20} color="#E91E63" />
                   </TouchableOpacity>

                   {showTypePicker && (
                     <View style={[styles.inlineDropdown, { position: 'absolute', top: 58, left: 0, right: 0 }]}>
                       {PRODUCT_TYPES.map((pt, i) => (
                         <TouchableOpacity 
                           key={i} 
                           style={styles.inlineDropdownItem} 
                           onPress={() => { setProductType(pt); setShowTypePicker(false); }}
                         >
                           <Text style={styles.inlineDropdownItemText}>{pt}</Text>
                           {productType === pt && <Ionicons name="checkmark" size={20} color="#A855F7" />}
                         </TouchableOpacity>
                       ))}
                     </View>
                   )}
                 </View>

                 <View style={styles.newInputBox}>
                   <Ionicons name="cash-outline" size={20} color={colors.textMuted} style={styles.newInputIcon} />
                   <TextInput 
                     style={styles.newInput} 
                     placeholder="Product Cost *" 
                     placeholderTextColor={colors.textMuted} 
                     keyboardType="numeric" 
                     value={productCost}
                     onChangeText={setProductCost}
                   />
                 </View>

                 <View style={styles.newInputBox}>
                   <Ionicons name="cash-outline" size={20} color={colors.textMuted} style={styles.newInputIcon} />
                   <TextInput 
                     style={styles.newInput} 
                     placeholder="Retail Price *" 
                     placeholderTextColor={colors.textMuted} 
                     keyboardType="numeric" 
                     value={retailPrice}
                     onChangeText={setRetailPrice}
                   />
                 </View>

                 <View style={{ flexDirection: 'row', gap: 12 }}>
                   <View style={[styles.newInputBox, { flex: 1 }]}>
                     <TextInput 
                       style={[styles.newInput, { marginLeft: 6 }]} 
                       placeholder="Discount %" 
                       placeholderTextColor={colors.textMuted} 
                       keyboardType="numeric"
                       value={discountPercent}
                       onChangeText={setDiscountPercent}
                     />
                     <View style={styles.discountPercentBadge}>
                       <Text style={styles.discountPercentBadgeText}>%</Text>
                     </View>
                   </View>
                   <View style={[styles.newInputBox, { flex: 1 }]}>
                     <TextInput 
                       style={[styles.newInput, { marginLeft: 6 }]} 
                       placeholder="Discount Amt" 
                       placeholderTextColor={colors.textMuted} 
                       keyboardType="numeric"
                       value={discountAmt}
                       onChangeText={setDiscountAmt}
                     />
                     <Text style={{ color: colors.textMuted, fontWeight: 'bold' }}>{currencySymbol}</Text>
                   </View>
                 </View>

                 <View style={styles.newInputBox}>
                   <Ionicons name="layers-outline" size={20} color={colors.textMuted} style={styles.newInputIcon} />
                   <TextInput 
                     style={styles.newInput} 
                     placeholder="Quantity *" 
                     placeholderTextColor={colors.textMuted} 
                     keyboardType="numeric" 
                     value={quantity}
                     onChangeText={setQuantity}
                   />
                 </View>

                 <View style={styles.newInputBox}>
                   <Ionicons name="pricetag-outline" size={20} color={colors.textMuted} style={styles.newInputIcon} />
                   <TextInput 
                     style={styles.newInput} 
                     placeholder="Brand Name" 
                     placeholderTextColor={colors.textMuted} 
                     value={brandName}
                     onChangeText={setBrandName}
                   />
                 </View>
              </View>

              <TouchableOpacity 
                style={[styles.addInventoryFinalBtn, isSubmitting && { opacity: 0.7 }]} 
                onPress={handleSave}
                disabled={isSubmitting}
              >
                 <Text style={styles.addInventoryFinalBtnText}>
                   {isSubmitting ? 'Adding...' : 'Add Inventory'}
                 </Text>
              </TouchableOpacity>

            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>

      <SelectCategoryModal
        visible={showSelectCategoryModal}
        onClose={() => setShowSelectCategoryModal(false)}
        onSelectCategory={handleCategorySelect}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  addModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  addModalTitle: {
    color: '#A855F7',
    fontSize: 16,
    fontWeight: '600',
  },
  scanBarcodeBtnTop: {
    borderWidth: 1.5,
    borderColor: '#C084FC',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#fff',
  },
  scanBarcodeBtnTopText: {
    color: '#A855F7',
    fontSize: 16,
    fontWeight: '600',
  },
  addModalFields: {
    gap: 16,
    marginBottom: 30,
  },
  newInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 52,
    backgroundColor: '#fff',
  },
  newInputIcon: {
    marginRight: 12,
  },
  newInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textDark,
  },
  discountPercentBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountPercentBadgeText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  addInventoryFinalBtn: {
    backgroundColor: '#A855F7',
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addInventoryFinalBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanCancelBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
  },
  scanCancelBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inlineDropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  inlineDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  inlineDropdownItemText: {
    fontSize: 15,
    color: '#333',
  }
});
