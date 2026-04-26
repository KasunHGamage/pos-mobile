import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export interface ProductForCart {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  unit: string;
  unitType?: string;
  unitOptions?: any;
  category: string;
}

interface AddItemToCartModalProps {
  visible: boolean;
  product: ProductForCart | null;
  onClose: () => void;
  onAdd: (item: {
    product: ProductForCart;
    quantity: number;
    itemPrice: number;
    discountValue: number;
    discountMode: 'percent' | 'amount';
    saveItemPrice: boolean;
    saveProductDiscount: boolean;
  }) => void;
}

export default function AddItemToCartModal({
  visible,
  product,
  onClose,
  onAdd,
}: AddItemToCartModalProps) {
  const [quantity, setQuantity] = useState('1');
  const [itemPrice, setItemPrice] = useState('');
  const [saveItemPrice, setSaveItemPrice] = useState(false);
  const [discountValue, setDiscountValue] = useState('');
  const [discountMode, setDiscountMode] = useState<'percent' | 'amount'>('percent');
  const [saveProductDiscount, setSaveProductDiscount] = useState(false);

  const unitLower = (product?.unit || '').toLowerCase().trim();
  const isWeight = ['kg', 'g'].includes(unitLower);
  const isLiquid = ['liters', 'liter', 'l', 'ml'].includes(unitLower);
  const derivedUnitType = isWeight ? 'WEIGHT' : isLiquid ? 'LIQUID' : 'NORMAL';

  const parseQuantity = (str: string, dType: string) => {
    if (!str) return 0;
    const s = str.toString().toLowerCase().trim();
    if (dType === 'WEIGHT') {
      if (s.endsWith('kg')) return parseFloat(s) || 0;
      if (s.endsWith('g')) return (parseFloat(s) || 0) / 1000;
      return parseFloat(s) || 0;
    } else if (dType === 'LIQUID') {
      if (s.endsWith('l') && !s.endsWith('ml')) return parseFloat(s) || 0;
      if (s.endsWith('ml')) return (parseFloat(s) || 0) / 1000;
      return parseFloat(s) || 0;
    }
    return parseInt(s, 10) || 0;
  };

  const formatQuantity = (val: number, dType: string) => {
    if (val <= 0) return '';
    if (dType === 'WEIGHT') {
      if (val < 1) return `${(val * 1000).toFixed(0)}g`;
      return `${val.toFixed(3).replace(/\.?0+$/, '')}kg`;
    } else if (dType === 'LIQUID') {
      if (val < 1) return `${(val * 1000).toFixed(0)}ml`;
      return `${val.toFixed(3).replace(/\.?0+$/, '')}L`;
    }
    return val.toString();
  };

  useEffect(() => {
    if (product) {
      setQuantity(formatQuantity(1, derivedUnitType));
      setItemPrice(product.price.toString());
      setDiscountValue('');
      setDiscountMode('percent');
      setSaveItemPrice(false);
      setSaveProductDiscount(false);
    }
  }, [product]);

  if (!product) return null;

  const qtyNum = parseQuantity(quantity, derivedUnitType) || 0;
  const priceNum = parseFloat(itemPrice) || 0;
  const discNum = parseFloat(discountValue) || 0;

  const subTotal = qtyNum * priceNum;
  const discountAmt = discountMode === 'percent' ? subTotal * (discNum / 100) : discNum;
  const totalAmount = Math.max(0, subTotal - discountAmt);

  const handleAdd = () => {
    if (qtyNum <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity greater than 0.');
      return;
    }
    if (qtyNum > product.stock) {
      Alert.alert('Insufficient Stock', `You only have ${product.stock} available.`);
      return;
    }
    onAdd({
      product,
      quantity: qtyNum,
      itemPrice: priceNum,
      discountValue: discNum,
      discountMode,
      saveItemPrice,
      saveProductDiscount,
    });
  };

  const adjustQty = (delta: number) => {
    const current = qtyNum || 0;
    const step = (derivedUnitType === 'WEIGHT' || derivedUnitType === 'LIQUID') ? 0.05 : 1;
    let nextValue = current + (delta * step);
    if (nextValue < 0.01) nextValue = step; // Prevent going to 0 or negative
    setQuantity(formatQuantity(nextValue, derivedUnitType));
  };

  const weightPresets = [{ l: '100g', v: 0.1 }, { l: '250g', v: 0.25 }, { l: '500g', v: 0.5 }, { l: '1kg', v: 1 }];
  const liquidPresets = [{ l: '100ml', v: 0.1 }, { l: '250ml', v: 0.25 }, { l: '500ml', v: 0.5 }, { l: '1L', v: 1 }];
  const normalPresets = [{ l: '1', v: 1 }, { l: '2', v: 2 }, { l: '5', v: 5 }, { l: '10', v: 10 }];

  const presets = product.unitOptions?.quick_units?.map((u: string) => {
    // try to guess value if custom
    const val = parseFloat(u) || 1;
    let numVal = val;
    if (u.includes('g') && !u.includes('kg')) numVal = val / 1000;
    if (u.includes('ml')) numVal = val / 1000;
    return { l: u, v: numVal };
  }) || (derivedUnitType === 'WEIGHT' ? weightPresets : derivedUnitType === 'LIQUID' ? liquidPresets : normalPresets);

  const Checkbox = ({ checked, onPress }: { checked: boolean; onPress: () => void }) => (
    <TouchableOpacity style={styles.checkboxWrapper} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.checkbox}>
        {checked && <View style={styles.checkboxInner} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={{ width: '100%' }}
        >
          <View style={styles.modalContent}>
            {/* Background Decorations */}
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.productTitle}>
                  {product.name} {product.price.toFixed(1)} LKR per {product.unit}
                </Text>
                <Text style={styles.productSku}>{product.sku}</Text>
              </View>

              <View style={styles.formContainer}>
                {/* Quantity */}
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>
                    Quantity ({derivedUnitType === 'WEIGHT' ? 'kg' : derivedUnitType === 'LIQUID' ? 'L' : product.unit || 'units'})
                  </Text>
                  <View style={styles.inputBox}>
                    <TouchableOpacity onPress={() => adjustQty(-1)} style={styles.stepBtn}>
                      <Ionicons name="remove" size={24} color="#333" />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.inputText}
                      value={quantity}
                      onChangeText={setQuantity}
                      onBlur={() => setQuantity(formatQuantity(qtyNum, derivedUnitType))}
                    />
                    <TouchableOpacity onPress={() => adjustQty(1)} style={styles.stepBtn}>
                      <Ionicons name="add" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Quick Presets */}
                <View style={styles.presetsContainer}>
                  {presets.map((p, i) => {
                    const isSelected = qtyNum === p.v;
                    return (
                      <TouchableOpacity 
                        key={i} 
                        style={[styles.presetBtn, isSelected && styles.presetBtnActive]} 
                        onPress={() => setQuantity(formatQuantity(p.v, derivedUnitType))}
                      >
                        <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                          {p.l}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Available Quantity */}
                <View style={[styles.inputRow, { marginTop: -10 }]}>
                  <Text style={styles.inputLabel}>Available Quantity</Text>
                  <Text style={styles.availableQtyValue}>{product.stock.toFixed(3)}</Text>
                </View>

                {/* Item Price */}
                <View style={[styles.inputRow, { marginTop: 10 }]}>
                  <View>
                    <Text style={styles.inputLabel}>Item Price</Text>
                    <Text style={styles.inputLabelSub}>(per {product.unit})</Text>
                  </View>
                  <View style={styles.inputBox}>
                    <TextInput
                      style={styles.inputText}
                      value={itemPrice}
                      onChangeText={setItemPrice}
                      keyboardType="numeric"
                    />
                    <Text style={styles.inputSuffix}>LKR</Text>
                  </View>
                </View>

                {/* Save Item Price Checkbox */}
                <View style={styles.checkboxRow}>
                  <Text style={styles.checkboxLabel}>Do you want to save the item price?</Text>
                  <Checkbox checked={saveItemPrice} onPress={() => setSaveItemPrice(!saveItemPrice)} />
                </View>

                {/* Total Amount */}
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Total Amount</Text>
                  <View style={styles.inputBox}>
                    <Text style={[styles.inputText, { color: '#333' }]}>{totalAmount.toFixed(2)}</Text>
                    <Text style={styles.inputSuffix}>LKR</Text>
                  </View>
                </View>

                {/* Product Discount */}
                <View style={styles.inputRow}>
                  <View>
                    <Text style={styles.inputLabel}>Product</Text>
                    <Text style={styles.inputLabelSub}>Discount</Text>
                  </View>
                  <View style={styles.inputBox}>
                    <TextInput
                      style={styles.inputText}
                      value={discountValue}
                      onChangeText={setDiscountValue}
                      keyboardType="numeric"
                      placeholder="0.00"
                    />
                    <TouchableOpacity 
                      style={styles.discountToggleBtn}
                      onPress={() => setDiscountMode(prev => prev === 'percent' ? 'amount' : 'percent')}
                    >
                      <Text style={styles.discountToggleText}>{discountMode === 'percent' ? '%' : 'LKR'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Save Product Discount Checkbox */}
                <View style={styles.checkboxRow}>
                  <Text style={styles.checkboxLabel}>Do you want to save the product discount?</Text>
                  <Checkbox checked={saveProductDiscount} onPress={() => setSaveProductDiscount(!saveProductDiscount)} />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
                  <Text style={styles.btnCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnAdd} onPress={handleAdd}>
                  <Text style={styles.btnAddText}>Add Item</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FAFAFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    minHeight: '85%',
    overflow: 'hidden',
    position: 'relative',
  },
  bgCircle1: {
    position: 'absolute',
    top: -50,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(230, 230, 250, 0.5)',
  },
  bgCircle2: {
    position: 'absolute',
    top: 150,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(230, 230, 250, 0.5)',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productSku: {
    fontSize: 14,
    color: '#666',
  },
  formContainer: {
    gap: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  inputLabelSub: {
    fontSize: 13,
    color: '#666',
  },
  inputBox: {
    width: 140,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  stepBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  inputSuffix: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginLeft: 8,
  },
  availableQtyValue: {
    width: 160,
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  stepBtn: {
    padding: 4,
  },
  presetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: -10,
    marginBottom: 10,
  },
  presetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 50,
    alignItems: 'center',
  },
  presetBtnActive: {
    backgroundColor: '#F3E8FF',
    borderColor: '#A855F7',
  },
  presetText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  presetTextActive: {
    color: '#A855F7',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    paddingRight: 10,
  },
  checkboxWrapper: {
    padding: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#E91E63',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: '#E91E63',
    borderRadius: 2,
  },
  discountToggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  discountToggleText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    gap: 16,
  },
  btnCancel: {
    flex: 1,
    height: 54,
    backgroundColor: '#222',
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  btnAdd: {
    flex: 1,
    height: 54,
    backgroundColor: '#A855F7',
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnAddText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
