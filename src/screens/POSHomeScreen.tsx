import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { ENDPOINTS } from '../config/api';
import AddItemToCartModal from '../components/AddItemToCartModal';

// ─── Types ────────────────────────────────────────────────────────────────────

type Customer = { id: string; name: string; phone: string };
type PaymentMethod = 'Cash' | 'Credit' | 'Cheque' | 'QR';

type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  unit: string;
  unitType?: string;
  unitOptions?: any;
  category: string;
  isFeatured: boolean;
};

type CartItem = {
  id: string;
  name: string;
  unit: string;
  category: string;
  originalPrice: number;
  price: number;
  qty: number;
  discountValue: number;
  discountMode: 'percent' | 'amount';
  itemDiscountAmt: number;
};

type InvoiceSession = {
  id: string;
  name: string;
  cart: CartItem[];
  discountValue: number;
  discountMode: 'percent' | 'amount';
};

const CATEGORIES = ['All', 'Grains', 'Fruits', 'Dairy', 'Beverages', 'Stationery', 'Snacks'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function POSHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<any>();
  const { currencySymbol } = useCurrency();
  const { token } = useAuth();

  // ── Products State ──────────────────────────────────────────────────────────
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);

  const fetchProducts = useCallback(async (search = '') => {
    if (!token) return;
    setIsFetchingProducts(true);
    try {
      const url = `${ENDPOINTS.products.list}?search=${encodeURIComponent(search)}`;
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.map((p: any) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          price: p.price,
          stock: p.stock,
          unit: p.unit || 'Pcs',
          unitType: p.unit_type,
          unitOptions: p.unit_options,
          category: p.category || 'General',
          isFeatured: p.isFeatured || false,
        })));
      }
    } catch (error) {
      console.error('Fetch products error:', error);
    } finally {
      setIsFetchingProducts(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle scanned SKU from ScannerScreen
  useEffect(() => {
    if (route.params?.scannedSku) {
      const sku = route.params.scannedSku;
      const product = products.find(p => p.sku === sku);
      if (product) {
        addItemToCart(product, 1);
        Alert.alert('Scanned', `${product.name} added to cart`);
      } else {
        Alert.alert('Not Found', `Product with SKU ${sku} not found in your inventory.`);
      }
      // Reset params
      navigation.setParams({ scannedSku: undefined } as any);
    }
  }, [route.params?.scannedSku, products]);

  // ── Invoices / Sessions ──────────────────────────────────────────────────────
  const [invoices, setInvoices] = useState<InvoiceSession[]>(() => [
    { id: 'inv-' + Date.now(), name: 'Invoice 1', cart: [], discountValue: 0, discountMode: 'percent' }
  ]);
  const [activeInvoiceId, setActiveInvoiceId] = useState<string>(invoices[0].id);
  const [invoicesModalVisible, setInvoicesModalVisible] = useState(false);

  const activeInvoice = invoices.find(i => i.id === activeInvoiceId) || invoices[0];
  const cart = activeInvoice.cart;
  const invoiceDiscountValue = activeInvoice.discountValue;
  const invoiceDiscountMode = activeInvoice.discountMode;

  // ── Cart State Wrappers ─────────────────────────────────────────────────────
  const setCart = (action: React.SetStateAction<CartItem[]>) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === activeInvoiceId) {
        return { ...inv, cart: typeof action === 'function' ? (action as any)(inv.cart) : action };
      }
      return inv;
    }));
  };

  const setInvoiceDiscountValue = (val: React.SetStateAction<number>) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === activeInvoiceId) {
        return { ...inv, discountValue: typeof val === 'function' ? (val as any)(inv.discountValue) : val };
      }
      return inv;
    }));
  };

  const addItemToCart = (product: InventoryItem, qty = 1) => {
    const prc = product.price;
    const newItem: CartItem = {
      id: product.id,
      name: product.name,
      unit: product.unit,
      category: product.category,
      originalPrice: prc,
      price: prc,
      qty,
      discountValue: 0,
      discountMode: 'percent',
      itemDiscountAmt: 0,
    };

    setCart(prev => {
      const idx = prev.findIndex(c => c.id === product.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], qty: updated[idx].qty + qty };
        return updated;
      }
      return [...prev, newItem];
    });
  };

  const updateQty = (id: string, delta: number) =>
    setCart(prev => prev.map(i => {
      if (i.id !== id) return i;
      const product = products.find(p => p.id === i.id);
      const unitLower = (product?.unit || '').toLowerCase().trim();
      const isWeight = ['kg', 'g'].includes(unitLower);
      const isLiquid = ['liters', 'liter', 'l', 'ml'].includes(unitLower);
      const step = (isWeight || isLiquid) ? 0.1 : 1;
      const newQty = Math.max(step, i.qty + (delta * step));
      return { ...i, qty: parseFloat(newQty.toFixed(3)) };
    }));

  const deleteItem = (id: string) => setCart(prev => prev.filter(i => i.id !== id));

  // ── UI State ─────────────────────────────────────────────────────────────────
  const [searchVisible, setSearchVisible] = useState(false);
  const [quickInventoryVisible, setQuickInventoryVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [summaryExpanded, setSummaryExpanded] = useState(true);
  const [selectedItemForAdd, setSelectedItemForAdd] = useState<InventoryItem | null>(null);

  const addConfiguredItemToCart = (config: {
    product: InventoryItem;
    quantity: number;
    itemPrice: number;
    discountValue: number;
    discountMode: 'percent' | 'amount';
    saveItemPrice: boolean;
    saveProductDiscount: boolean;
  }) => {
    const { product, quantity, itemPrice, discountValue, discountMode, saveItemPrice, saveProductDiscount } = config;
    
    if (saveItemPrice || saveProductDiscount) {
      console.log('Would save item price/discount to backend:', { saveItemPrice, saveProductDiscount });
    }

    const subTotal = quantity * itemPrice;
    const itemDiscountAmt = discountMode === 'percent' ? subTotal * (discountValue / 100) : discountValue;

    const newItem: CartItem = {
      id: product.id,
      name: product.name,
      unit: product.unit,
      category: product.category,
      originalPrice: product.price,
      price: itemPrice,
      qty: quantity,
      discountValue,
      discountMode,
      itemDiscountAmt,
    };

    setCart(prev => {
      const idx = prev.findIndex(c => c.id === product.id);
      if (idx > -1) {
        const updated = [...prev];
        const newQty = updated[idx].qty + quantity;
        const newSubTotal = newQty * itemPrice;
        const newDiscountAmt = discountMode === 'percent' ? newSubTotal * (discountValue / 100) : discountValue;
        
        updated[idx] = { 
          ...newItem, 
          qty: newQty,
          itemDiscountAmt: newDiscountAmt
        };
        return updated;
      }
      return [...prev, newItem];
    });
  };

  // ── Computed ──────────────────────────────────────────────────────────────────
  const filteredInventory = useMemo(() => {
    let list = products;
    if (activeCategory !== 'All') list = list.filter(p => p.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    return list;
  }, [products, searchQuery, activeCategory]);

  const featuredInventory = useMemo(() => {
    let list = products.filter(p => p.isFeatured);
    if (quickSearchQuery.trim()) {
      const q = quickSearchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    return list;
  }, [products, quickSearchQuery]);

  // ── Totals ──────────────────────────────────────────────────────────────────
  const subTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const itemDiscountTotal = cart.reduce((s, i) => s + i.itemDiscountAmt, 0);
  const afterItemDisc = subTotal - itemDiscountTotal;
  const invoiceDiscAmt = invoiceDiscountMode === 'percent' ? afterItemDisc * (invoiceDiscountValue / 100) : Math.min(invoiceDiscountValue, afterItemDisc);
  const finalTotal = afterItemDisc - invoiceDiscAmt;

  // ── Sub-renders ───────────────────────────────────────────────────────────────

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const itemSubTotal = item.price * item.qty;
    const finalAmount = itemSubTotal - item.itemDiscountAmt;

    return (
      <View style={styles.cartItemCard}>
        <View style={styles.cartItemInfo}>
          <Text style={styles.cartItemName}>{item.name}</Text>
          <Text style={styles.cartItemPrice}>{item.price.toFixed(2)} {currencySymbol} × {item.qty} {item.unit}</Text>
          {item.itemDiscountAmt > 0 && (
            <Text style={{ fontSize: 11, color: '#A855F7', marginTop: 2, fontWeight: '500' }}>
              Discount: -{item.itemDiscountAmt.toFixed(2)} {currencySymbol}
            </Text>
          )}
        </View>
        <View style={styles.qtyControlContainer}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, -1)}>
            <Ionicons name="remove" size={16} color={colors.textDark} />
          </TouchableOpacity>
          <Text style={[styles.qtyText, { fontSize: item.qty >= 100 ? 10 : 12 }]}>
            {(() => {
              const u = (item.unit || '').toLowerCase().trim();
              if (['kg', 'g'].includes(u) && item.qty < 1) return `${item.qty * 1000}g`;
              if (['liters', 'liter', 'l', 'ml'].includes(u) && item.qty < 1) return `${item.qty * 1000}ml`;
              return item.qty;
            })()}
          </Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, 1)}>
            <Ionicons name="add" size={16} color={colors.textDark} />
          </TouchableOpacity>
        </View>
        <View style={styles.cartItemAmountContainer}>
          {item.itemDiscountAmt > 0 ? (
            <>
              <Text style={[styles.cartItemAmount, { textDecorationLine: 'line-through', color: '#94A3B8', fontSize: 12 }]}>
                {itemSubTotal.toFixed(1)}
              </Text>
              <Text style={[styles.cartItemAmount, { color: '#10B981', marginTop: 2 }]}>
                {finalAmount.toFixed(1)}
              </Text>
            </>
          ) : (
            <Text style={styles.cartItemAmount}>{itemSubTotal.toFixed(1)}</Text>
          )}
          <TouchableOpacity onPress={() => deleteItem(item.id)} style={{ marginTop: 8 }}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with pill */}
      <View style={styles.headerPillContainer}>
        <View style={styles.headerPill}>
          <Text style={styles.headerPillText}>{activeInvoice.name}</Text>
        </View>
      </View>

      {/* Search and Action Row */}
      <View style={styles.searchHeader}>
        <TouchableOpacity style={styles.searchBarBtn} onPress={() => setSearchVisible(true)}>
          <Ionicons name="search-outline" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
          <Text style={styles.searchBarBtnText}>Search Items</Text>
        </TouchableOpacity>
        <View style={styles.searchActions}>
          <TouchableOpacity style={[styles.actionIcon, { backgroundColor: '#1E293B' }]}>
            <Ionicons name="pricetag-outline" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionIcon, { backgroundColor: '#C084FC' }]}
            onPress={() => setQuickInventoryVisible(true)}
          >
            <Ionicons name="flash-outline" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionIcon, { backgroundColor: '#EC4899' }]}>
            <Ionicons name="copy-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Cart List */}
      <View style={styles.listHeaderRow}>
        <Text style={styles.listHeaderCol1}>Item Description</Text>
        <Text style={styles.listHeaderCol2}>Qty</Text>
        <Text style={styles.listHeaderCol3}>Amount({currencySymbol})</Text>
      </View>

      <FlatList
        data={cart}
        keyExtractor={item => item.id}
        renderItem={renderCartItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyCart}>
            <Ionicons name="bag-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyCartText}>Cart is empty</Text>
            <Text style={styles.emptyCartSub}>Tap Search Items to add products</Text>
          </View>
        }
      />

      {/* Summary Footer */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryActionsRow}>
          <TouchableOpacity onPress={() => setCart([])}><Text style={styles.purpleTextBold}>Clear All</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setSummaryExpanded(!summaryExpanded)}>
            <Ionicons name={summaryExpanded ? "chevron-down" : "chevron-up"} size={20} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity><Text style={styles.purpleTextBold}>Add Discount</Text></TouchableOpacity>
        </View>

        {summaryExpanded && (
          <View style={styles.invoiceSummaryBox}>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Sub Total</Text><Text style={styles.summaryValue}>{currencySymbol} {subTotal.toFixed(2)}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Total Payment</Text><Text style={[styles.summaryValue, { color: '#A855F7', fontWeight: 'bold' }]}>{currencySymbol} {finalTotal.toFixed(2)}</Text></View>
          </View>
        )}

        <View style={styles.footerRow}>
          <Text style={styles.footerTotalValue}>Total {currencySymbol} {finalTotal.toFixed(2)}</Text>
          <TouchableOpacity style={styles.generateBtn} onPress={() => Alert.alert('Checkout', 'Proceeding to checkout...')}>
            <Text style={styles.generateBtnText}>Generate Bill</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Modal */}
      <Modal visible={searchVisible} animationType="slide">
        <SafeAreaView style={styles.searchScreen}>
          <View style={styles.searchScreenHeader}>
            <Text style={styles.searchScreenTitle}>Search Items</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => fetchProducts()} style={{ marginRight: 16 }}>
                <Ionicons name="sync-outline" size={24} color="#A855F7" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSearchVisible(false)}><Ionicons name="close" size={24} color="#333" /></TouchableOpacity>
            </View>
          </View>
          <TextInput
            style={styles.searchInputRow}
            placeholder="Type product name or SKU..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {isFetchingProducts ? (
            <ActivityIndicator size="large" color="#A855F7" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={filteredInventory}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.invRow} onPress={() => { setSelectedItemForAdd(item); setSearchVisible(false); }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.invName}>{item.name}</Text>
                    <Text style={styles.invMeta}>{item.sku} · {item.price.toFixed(2)} {currencySymbol}</Text>
                  </View>
                  <View style={styles.invAddBtn}><Text style={styles.invAddBtnText}>Add</Text></View>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Quick Inventory Modal */}
      <Modal visible={quickInventoryVisible} animationType="slide">
        <SafeAreaView style={styles.searchScreen}>
          <View style={styles.searchScreenHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setQuickInventoryVisible(false)} style={{ marginRight: 16 }}>
                <Ionicons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.searchScreenTitle}>Quick Inventory List</Text>
            </View>
            <TouchableOpacity onPress={() => fetchProducts()}>
              <Ionicons name="sync-outline" size={24} color="#A855F7" />
            </TouchableOpacity>
          </View>
          <View style={[styles.searchInputRow, { flexDirection: 'row', alignItems: 'center' }]}>
            <Ionicons name="search" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              style={{ flex: 1, fontSize: 15 }}
              placeholder="Search Inventory"
              value={quickSearchQuery}
              onChangeText={setQuickSearchQuery}
            />
          </View>
          {isFetchingProducts ? (
            <ActivityIndicator size="large" color="#A855F7" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={featuredInventory}
              keyExtractor={item => item.id}
              numColumns={3}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.gridItem}
                  onPress={() => { setSelectedItemForAdd(item); setQuickInventoryVisible(false); }}
                >
                  <View style={styles.gridItemContent}>
                    <Text style={styles.gridItemName} numberOfLines={2}>{item.name}</Text>
                  </View>
                  <View style={styles.gridItemPriceTag}>
                    <Text style={styles.gridItemPriceText}>{item.price.toFixed(2)} LKR</Text>
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Add Item to Cart Modal */}
      <AddItemToCartModal
        visible={!!selectedItemForAdd}
        product={selectedItemForAdd as any}
        onClose={() => setSelectedItemForAdd(null)}
        onAdd={(config) => {
          addConfiguredItemToCart(config as any);
          setSelectedItemForAdd(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerPillContainer: { paddingHorizontal: 16, paddingTop: 16 },
  headerPill: { backgroundColor: '#A855F7', paddingHorizontal: 16, paddingVertical: 4, alignSelf: 'flex-start', borderRadius: 4 },
  headerPillText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  searchHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  searchBarBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 8, padding: 10, marginRight: 10 },
  searchBarBtnText: { color: '#94A3B8', fontSize: 14 },
  searchActions: { flexDirection: 'row', gap: 8 },
  actionIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  listHeaderRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10 },
  listHeaderCol1: { flex: 2, fontSize: 12, color: '#94A3B8' },
  listHeaderCol2: { flex: 1, fontSize: 12, color: '#94A3B8', textAlign: 'center' },
  listHeaderCol3: { flex: 1, fontSize: 12, color: '#94A3B8', textAlign: 'right' },
  listContainer: { paddingHorizontal: 16, paddingBottom: 24 },
  cartItemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8, elevation: 1 },
  cartItemInfo: { flex: 2 },
  cartItemName: { fontSize: 14, fontWeight: '600' },
  cartItemPrice: { fontSize: 12, color: '#64748B' },
  qtyControlContainer: { flex: 1.2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F1F5F9', borderRadius: 20, padding: 4 },
  qtyBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 14, fontWeight: 'bold' },
  cartItemAmountContainer: { flex: 1, alignItems: 'flex-end' },
  cartItemAmount: { fontSize: 14, fontWeight: 'bold', color: '#10B981' },
  summaryContainer: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 10 },
  summaryActionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  purpleTextBold: { color: '#A855F7', fontWeight: 'bold' },
  invoiceSummaryBox: { marginBottom: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  summaryLabel: { fontSize: 13, color: '#64748B' },
  summaryValue: { fontSize: 13, color: '#64748B' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerTotalValue: { fontSize: 18, fontWeight: 'bold' },
  generateBtn: { backgroundColor: '#A855F7', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  generateBtnText: { color: '#fff', fontWeight: 'bold' },
  emptyCart: { alignItems: 'center', marginTop: 100 },
  emptyCartText: { fontSize: 16, color: '#CBD5E1', marginTop: 10 },
  emptyCartSub: { fontSize: 12, color: '#CBD5E1' },
  searchScreen: { flex: 1, backgroundColor: '#fff' },
  searchScreenHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  searchScreenTitle: { fontSize: 18, fontWeight: 'bold' },
  searchInputRow: { margin: 16, padding: 12, backgroundColor: '#F1F5F9', borderRadius: 8 },
  invRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  invName: { fontSize: 15, fontWeight: '600' },
  invMeta: { fontSize: 12, color: '#94A3B8' },
  invAddBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#A855F7' },
  invAddBtnText: { color: '#A855F7', fontWeight: 'bold' },
  gridItem: { flex: 1, margin: 4, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#F1F5F9', overflow: 'hidden', alignItems: 'center', minHeight: 80, justifyContent: 'space-between' },
  gridItemContent: { paddingHorizontal: 6, paddingVertical: 12, flex: 1, justifyContent: 'center' },
  gridItemName: { fontSize: 13, fontWeight: '600', color: '#333', textAlign: 'center' },
  gridItemPriceTag: { backgroundColor: '#A855F7', width: '100%', paddingVertical: 6, alignItems: 'center' },
  gridItemPriceText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});
