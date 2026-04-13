import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  FlatList,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

// ─── Inventory data ───────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Grains', 'Fruits', 'Dairy', 'Beverages', 'Stationery', 'Snacks'];

// ─── Customer data (same as CustomersScreen) ──────────────────────────────────
const CUSTOMERS = [
  { id: '1', name: 'Nilantha Perera',    phone: '077 123 4567' },
  { id: '2', name: 'Kamal Silva',         phone: '071 987 6543' },
  { id: '3', name: 'Kasun Rathnayake',    phone: '070 456 7890' },
  { id: '4', name: 'Isuru Fernando',      phone: '075 112 2334' },
  { id: '5', name: 'Battery',             phone: '077 630 1110' },
  { id: '6', name: 'GH Store',            phone: '076 792 2222' },
];

type Customer = typeof CUSTOMERS[0];
type PaymentMethod = 'Cash' | 'Credit' | 'Cheque' | 'QR';

const INVENTORY = [
  { id: '1', name: 'Red Rice', price: 175.0, stock: 120.0, unit: 'Kg', category: 'Grains' },
  { id: '2', name: 'Basmati Rice', price: 310.0, stock: 55.0, unit: 'Kg', category: 'Grains' },
  { id: '3', name: 'Apples', price: 245.0, stock: 80.0, unit: 'Kg', category: 'Fruits' },
  { id: '4', name: 'Bananas', price: 90.0, stock: 200.0, unit: 'Kg', category: 'Fruits' },
  { id: '5', name: 'Mango', price: 320.0, stock: 40.0, unit: 'Kg', category: 'Fruits' },
  { id: '6', name: 'Sugar', price: 220.0, stock: 300.0, unit: 'Kg', category: 'Grains' },
  { id: '7', name: 'Cheese', price: 1200.0, stock: 15.0, unit: 'Pcs', category: 'Dairy' },
  { id: '8', name: 'Milk Powder', price: 850.0, stock: 60.0, unit: 'Pcs', category: 'Dairy' },
  { id: '9', name: 'Water Bottle', price: 150.0, stock: 500.0, unit: 'Pcs', category: 'Beverages' },
  { id: '10', name: 'Coca Cola 1.5L', price: 380.0, stock: 120.0, unit: 'Pcs', category: 'Beverages' },
  { id: '11', name: 'CR Page 120', price: 365.0, stock: 200.0, unit: 'Pcs', category: 'Stationery' },
  { id: '12', name: 'Pen Blue', price: 45.0, stock: 1000.0, unit: 'Pcs', category: 'Stationery' },
  { id: '13', name: 'Biscuits', price: 450.0, stock: 80.0, unit: 'Pcs', category: 'Snacks' },
  { id: '14', name: 'Chips Small', price: 120.0, stock: 150.0, unit: 'Pcs', category: 'Snacks' },
];

type InventoryItem = typeof INVENTORY[0];

// Each cart item stores its effective (post-discount) unit price + original price for display
type CartItem = {
  id: string; name: string; unit: string; category: string;
  originalPrice: number;  // price before discount
  price: number;          // effective unit price after discount
  qty: number;
  discountValue: number;  // raw discount value entered (% or LKR)
  discountMode: 'percent' | 'amount';
  itemDiscountLKR: number; // total discount in LKR for this line
};

type InvoiceSession = {
  id: string;
  name: string;
  cart: CartItem[];
  discountValue: number;
  discountMode: 'percent' | 'amount';
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function POSHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // ── Invoices / Sessions ──────────────────────────────────────────────────────
  const [invoices, setInvoices] = useState<InvoiceSession[]>(() => [
    { id: 'inv-' + Date.now(), name: 'Invoice 1', cart: [], discountValue: 0, discountMode: 'percent' }
  ]);
  const [activeInvoiceId, setActiveInvoiceId] = useState<string>(invoices[0].id);
  const [invoicesModalVisible, setInvoicesModalVisible] = useState(false);

  // Active session derived data
  const activeInvoice = invoices.find(i => i.id === activeInvoiceId) || invoices[0];
  const cart = activeInvoice.cart;
  const invoiceDiscountValue = activeInvoice.discountValue;
  const invoiceDiscountMode = activeInvoice.discountMode;

  // ── Cart State Wrappers (to mutate active session seamlessly) ───────────────
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

  const setInvoiceDiscountMode = (mode: React.SetStateAction<'percent' | 'amount'>) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === activeInvoiceId) {
        return { ...inv, discountMode: typeof mode === 'function' ? (mode as any)(inv.discountMode) : mode };
      }
      return inv;
    }));
  };

  // Re-name invoice wrapper
  const updateInvoiceName = (id: string, newName: string) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, name: newName } : inv));
  };

  const deleteInvoice = (id: string) => {
    const remaining = invoices.filter(inv => inv.id !== id);
    if (remaining.length === 0) {
      const newId = 'inv-' + Date.now();
      setActiveInvoiceId(newId);
      setInvoices([{ id: newId, name: 'Invoice 1', cart: [], discountValue: 0, discountMode: 'percent' }]);
    } else {
      setInvoices(remaining);
      if (id === activeInvoiceId) {
        setActiveInvoiceId(remaining[0].id);
      }
    }
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Invoice",
      `Are you sure you want to delete ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteInvoice(id) }
      ]
    );
  };

  // ── Customer selector ────────────────────────────────────────────────────────
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = useMemo(() =>
    !customerSearch.trim()
      ? CUSTOMERS
      : CUSTOMERS.filter(c =>
          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
          c.phone.includes(customerSearch)
        ),
    [customerSearch]
  );

  // ── Payment Method modal ─────────────────────────────────────────────────────
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [paidAmountStr, setPaidAmountStr] = useState('');
  const [chequeNumber, setChequeNumber] = useState('');
  const [chequeDate, setChequeDate] = useState('');
  const [qrSubTab, setQrSubTab] = useState<'Static' | 'Dynamic'>('Static');

  // Derived payment values
  const parsedPaid = parseFloat(paidAmountStr) || 0;

  const openBillingFlow = () => {
    if (cart.length === 0) { Alert.alert('Empty Cart', 'Please add items before generating a bill.'); return; }
    // Reset payment state
    setSelectedCustomer(null);
    setCustomerSearch('');
    setPaymentMethod('Cash');
    setPaidAmountStr(finalTotal.toFixed(2));
    setChequeNumber('');
    setChequeDate('');
    setQrSubTab('Static');
    setCustomerModalVisible(true);
  };

  const proceedToPayment = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    setCustomerModalVisible(false);
    setPaidAmountStr(finalTotal.toFixed(2));
    setPaymentModalVisible(true);
  };

  const issueBill = () => {
    const snapshot = finalTotal;
    setPaymentModalVisible(false);
    navigation.navigate('Receipt', {
      total: snapshot,
      subTotal,
      itemDiscountTotal,
      invoiceDiscountAmt: invoiceDiscAmt,
      invoiceLabel: activeInvoice.name,
      items: cart,
      customerName: selectedCustomer?.name,
      paymentMethod,
      paidAmount: parsedPaid,
    });
    setCart([]);
    setInvoiceDiscountValue(0);
    setSelectedCustomer(null);
  };

  // ── Search panel ─────────────────────────────────────────────────────────────
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // ── Product detail (inside search modal) ────────────────────────────────────
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [itemQty, setItemQty] = useState('1');
  const [itemPrice, setItemPrice] = useState('');
  const [itemStock, setItemStock] = useState('');
  const [itemDiscount, setItemDiscount] = useState('0');
  const [discountMode, setDiscountMode] = useState<'percent' | 'amount'>('percent');
  const [savePriceFlag, setSavePriceFlag] = useState(false);
  const [saveDiscFlag, setSaveDiscFlag] = useState(false);

  // ── Category sheet ───────────────────────────────────────────────────────────
  const [catSheetVisible, setCatSheetVisible] = useState(false);
  const [catSearch, setCatSearch] = useState('');

  // ── Other modals ─────────────────────────────────────────────────────────────
  const [discModalVisible, setDiscModalVisible] = useState(false);
  const [invDiscType, setInvDiscType] = useState<'percent' | 'amount'>('percent');
  const [customDiscount, setCustomDiscount] = useState('');
  const [editingQtyItem, setEditingQtyItem] = useState<{ id: string; val: string } | null>(null);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [summaryExpanded, setSummaryExpanded] = useState(true);

  // ── Computed ──────────────────────────────────────────────────────────────────

  const filteredInventory = useMemo(() => {
    let list = INVENTORY;
    if (activeCategory !== 'All') list = list.filter(p => p.category === activeCategory);
    if (searchQuery.trim()) list = list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return list;
  }, [searchQuery, activeCategory]);

  const filteredCategories = useMemo(() =>
    !catSearch.trim() ? CATEGORIES : CATEGORIES.filter(c => c.toLowerCase().includes(catSearch.toLowerCase())),
    [catSearch]
  );

  // Totals
  const subTotal = cart.reduce((s, i) => s + i.originalPrice * i.qty, 0);
  const itemDiscountTotal = cart.reduce((s, i) => s + i.itemDiscountLKR, 0);
  const afterItemDisc = subTotal - itemDiscountTotal;

  // Live preview inside the discount modal
  const invDiscValue = parseFloat(customDiscount) || 0;
  const invDiscAmt = invDiscType === 'percent'
    ? afterItemDisc * (invDiscValue / 100)
    : Math.min(invDiscValue, afterItemDisc);
  const invDiscFinal = afterItemDisc - invDiscAmt;

  // Applied totals (from saved invoiceDiscountValue & invoiceDiscountMode)
  const invoiceDiscAmt = invoiceDiscountMode === 'percent'
    ? afterItemDisc * (invoiceDiscountValue / 100)
    : Math.min(invoiceDiscountValue, afterItemDisc);
  const finalTotal = afterItemDisc - invoiceDiscAmt;

  // Auto-clear discount if cart empties
  useEffect(() => {
    if (cart.length === 0) {
      setInvoiceDiscountValue(0);
    }
  }, [cart]);

  // Preview discount for current detail form
  const previewDisc = () => {
    const qty = parseFloat(itemQty) || 1;
    const prc = parseFloat(itemPrice) || (selectedProduct?.price ?? 0);
    const disc = parseFloat(itemDiscount) || 0;
    const base = prc * qty;
    if (discountMode === 'percent') return base * (disc / 100);
    return Math.min(disc, base);
  };

  const previewTotal = () => {
    const qty = parseFloat(itemQty) || 1;
    const prc = parseFloat(itemPrice) || (selectedProduct?.price ?? 0);
    return Math.max(0, prc * qty - previewDisc());
  };

  const effectiveUnitPrice = () => {
    const qty = parseFloat(itemQty) || 1;
    return previewTotal() / qty;
  };

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const openProductDetail = (product: InventoryItem) => {
    Keyboard.dismiss();
    setSelectedProduct(product);
    setItemQty('1');
    setItemPrice(product.price.toFixed(2));
    setItemStock(product.stock.toFixed(3));
    setItemDiscount('0');
    setDiscountMode('percent');
    setSavePriceFlag(false);
    setSaveDiscFlag(false);
  };

  const addItemToCart = () => {
    if (!selectedProduct) return;
    const qty = parseFloat(itemQty) || 1;
    const prc = parseFloat(itemPrice) || selectedProduct.price;
    const disc = parseFloat(itemDiscount) || 0;
    const base = prc * qty;
    const discLKR = discountMode === 'percent'
      ? base * (disc / 100)
      : Math.min(disc, base);
    const effTotal = base - discLKR;
    const effUnit = effTotal / qty;

    const newItem: CartItem = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      unit: selectedProduct.unit,
      category: selectedProduct.category,
      originalPrice: prc,
      price: effUnit,
      qty,
      discountValue: disc,
      discountMode,
      itemDiscountLKR: discLKR,
    };

    setCart(prev => {
      const idx = prev.findIndex(c => c.id === selectedProduct.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...newItem, qty: prev[idx].qty + qty, itemDiscountLKR: prev[idx].itemDiscountLKR + discLKR };
        return updated;
      }
      return [...prev, newItem];
    });

    setSelectedProduct(null);
    setSearchVisible(false);
  };

  const updateQty = (id: string, delta: number) =>
    setCart(prev => prev.map(i => {
      if (i.id !== id) return i;
      const newQty = Math.max(0.01, i.qty + delta);
      const base = i.originalPrice * newQty;
      const discLKR = i.discountMode === 'percent'
        ? base * (i.discountValue / 100)
        : Math.min(i.discountValue, base);
      return { ...i, qty: newQty, itemDiscountLKR: discLKR };
    }));

  const setExactQty = (id: string, qty: number) =>
    setCart(prev => prev.map(i => {
      if (i.id !== id) return i;
      const base = i.originalPrice * qty;
      const discLKR = i.discountMode === 'percent'
        ? base * (i.discountValue / 100)
        : Math.min(i.discountValue, base);
      return { ...i, qty, itemDiscountLKR: discLKR };
    }));

  const deleteItem = (id: string) => setCart(prev => prev.filter(i => i.id !== id));

  // ── Sub-renders ───────────────────────────────────────────────────────────────

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItemCard}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemPrice}>{item.originalPrice.toFixed(2)} LKR × {item.qty} {item.unit}</Text>
        {/* Show applied discount as its own labelled line */}
        {item.itemDiscountLKR > 0 && (
          <View style={styles.discLineRow}>
            <Ionicons name="pricetag-outline" size={11} color="#10B981" />
            <Text style={styles.discLineText}>
              {item.name} discount{' '}
              {item.discountMode === 'percent'
                ? `(${item.discountValue}%)`
                : `(LKR ${item.discountValue})`
              }{' '}→ -LKR {item.itemDiscountLKR.toFixed(2)}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.qtyControlContainer}>
        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, -1)}>
          <Ionicons name="remove" size={16} color={colors.textDark} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ paddingHorizontal: 8, paddingVertical: 4 }}
          onPress={() => setEditingQtyItem({ id: item.id, val: item.qty.toString() })}
        >
          <Text style={styles.qtyText}>{item.qty}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, 1)}>
          <Ionicons name="add" size={16} color={colors.textDark} />
        </TouchableOpacity>
      </View>
      <View style={styles.cartItemAmountContainer}>
        <Text style={styles.cartItemAmount}>{(item.price * item.qty).toFixed(1)}</Text>
        <TouchableOpacity onPress={() => deleteItem(item.id)} style={{ marginTop: 8 }}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderInventoryRow = ({ item }: { item: InventoryItem }) => (
    <TouchableOpacity
      style={styles.invRow}
      activeOpacity={0.6}
      onPress={() => openProductDetail(item)}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.invName}>{item.name}</Text>
        <Text style={styles.invMeta}>{item.price.toFixed(2)} LKR · {item.stock} {item.unit}</Text>
      </View>
      {/* Separate Add button — keyboardShouldPersistTaps on FlatList handles the keyboard */}
      <TouchableOpacity
        style={styles.invAddBtn}
        onPress={() => openProductDetail(item)}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.invAddBtnText}>Add</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // ─────────────────────────────────────────────────────────────────────────────

  const renderCategorySheet = () => {
    if (!catSheetVisible) return null;
    return (
      <View style={[StyleSheet.absoluteFill, styles.sheetOverlay, { zIndex: 9999, elevation: 9999 }]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => setCatSheetVisible(false)} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Categories</Text>
          <View style={styles.sheetDivider} />
          <View style={styles.sheetSearchWrap}>
            <Ionicons name="search-outline" size={17} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.sheetSearchInput}
              placeholder="Search categories..."
              placeholderTextColor="#CBD5E1"
              value={catSearch}
              onChangeText={setCatSearch}
            />
          </View>
          <FlatList
            data={filteredCategories}
            keyExtractor={c => c}
            keyboardShouldPersistTaps="always"
            style={{ flex: 1 }}
            renderItem={({ item: cat }) => (
              <TouchableOpacity
                style={styles.catRow}
                onPress={() => { setActiveCategory(cat); setCatSheetVisible(false); }}
              >
                <Text style={[styles.catRowText, activeCategory === cat && styles.catRowTextActive]}>{cat}</Text>
                <View style={[styles.catCheckbox, activeCategory === cat && styles.catCheckboxActive]}>
                  {activeCategory === cat && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Invoice pill */}
      <View style={styles.headerPillContainer}>
        <View style={styles.headerPill}>
          <Text style={styles.headerPillText}>{activeInvoice.name}</Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchHeader}>
        <TouchableOpacity
          style={styles.searchBarBtn}
          onPress={() => { setSearchVisible(true); setSearchQuery(''); setActiveCategory('All'); setSelectedProduct(null); }}
          activeOpacity={0.85}
        >
          <Ionicons name="search-outline" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
          <Text style={styles.searchBarBtnText}>Search Items</Text>
        </TouchableOpacity>
        <View style={styles.searchActions}>
          <TouchableOpacity
            style={[styles.actionIcon, { backgroundColor: '#1E293B' }]}
            onPress={() => { setCatSearch(''); setCatSheetVisible(true); }}
          >
            <Ionicons name="pricetag-outline" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionIcon, { backgroundColor: '#C084FC' }]}
            onPress={() => navigation.navigate('Scanner' as any)}
          >
            <Ionicons name="barcode-outline" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionIcon, { backgroundColor: '#EC4899' }]} onPress={() => setInvoicesModalVisible(true)}>
            <Ionicons name="copy-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Cart list header */}
      <View style={styles.listHeaderRow}>
        <Text style={styles.listHeaderCol1}>Item Description</Text>
        <Text style={styles.listHeaderCol2}>Qty</Text>
        <Text style={styles.listHeaderCol3}>Amount(LKR)</Text>
      </View>

      <FlatList
        data={cart}
        keyExtractor={item => item.id}
        renderItem={renderCartItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        // ← This makes taps go through even when keyboard is open
        keyboardShouldPersistTaps="always"
        ListEmptyComponent={
          <View style={styles.emptyCart}>
            <Ionicons name="bag-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyCartText}>Cart is empty</Text>
            <Text style={styles.emptyCartSub}>Tap Search Items to add products</Text>
          </View>
        }
      />

      {/* Summary */}
      <View style={styles.summaryContainer}>
        {/* Action row + collapse toggle */}
        <View style={styles.summaryActionsRow}>
          <TouchableOpacity onPress={() => setCart([])}>
            <Text style={styles.purpleTextBold}>Clear All</Text>
          </TouchableOpacity>

          {/* Collapse chevron in centre */}
          <TouchableOpacity
            style={styles.collapseBtn}
            onPress={() => setSummaryExpanded(v => !v)}
          >
            <Ionicons
              name={summaryExpanded ? 'chevron-down' : 'chevron-up'}
              size={18}
              color="#94A3B8"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.addDiscountRow} onPress={() => {
            setCustomDiscount(invoiceDiscountValue > 0 ? String(invoiceDiscountValue) : '');
            setInvDiscType(invoiceDiscountMode);
            setDiscModalVisible(true);
          }}>
            <Text style={styles.purpleTextBold}>
              {invoiceDiscountValue > 0 ? `Invoice Discount` : 'Add Discount'}
            </Text>
            <Ionicons name="options" size={16} color="#A855F7" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* Collapsible invoice summary rows */}
        {summaryExpanded && (
          <View style={styles.invoiceSummaryBox}>
            <Text style={styles.summaryTitle}>Invoice Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sub Total</Text>
              <Text style={styles.summaryValue}>LKR {subTotal.toFixed(2)}</Text>
            </View>

            {/* Per-item discounts broken out by product */}
            {cart.filter(i => i.itemDiscountLKR > 0).map(i => (
              <View key={`disc-${i.id}`} style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: '#10B981', flex: 1 }]} numberOfLines={1}>
                  {i.name}{' '}
                  {i.discountMode === 'percent' ? `(${i.discountValue}%)` : `(LKR ${i.discountValue})`}
                </Text>
                <Text style={[styles.summaryValue, { color: '#10B981' }]}>-LKR {i.itemDiscountLKR.toFixed(2)}</Text>
              </View>
            ))}

            {/* Total item discounts line */}
            {itemDiscountTotal > 0 && (
              <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 4 }]}>
                <Text style={[styles.summaryLabel, { color: '#10B981', fontWeight: '700' }]}>Total Item Discounts</Text>
                <Text style={[styles.summaryValue, { color: '#10B981', fontWeight: '700' }]}>-LKR {itemDiscountTotal.toFixed(2)}</Text>
              </View>
            )}

            {/* Invoice-level discount */}
            {invoiceDiscountValue > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: '#F59E0B' }]}>Invoice Discount</Text>
                <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>-LKR {invoiceDiscAmt.toFixed(2)}</Text>
              </View>
            )}

            <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 6, marginTop: 4 }]}>
              <Text style={[styles.summaryLabel, { fontWeight: '700', color: '#1E293B' }]}>Total Payment</Text>
              <Text style={[styles.summaryValue, { fontWeight: '700', color: '#A855F7' }]}>LKR {finalTotal.toFixed(2)}</Text>
            </View>
          </View>
        )}

        <View style={styles.footerRow}>
          <View style={styles.footerTotalBox}>
            <Text style={styles.footerTotalLabel}>Total</Text>
            <Text style={styles.footerTotalValue}>LKR {finalTotal.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={styles.generateBtn}
            onPress={openBillingFlow}
          >
            <Text style={styles.generateBtnText}>Generate Bill</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════════════════════
          SEARCH MODAL — View A: product list / View B: product detail
      ════════════════════════════════════════════════════════════════════════ */}
      <Modal visible={searchVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.searchScreen}>

          {/* ── VIEW A: Product list ─────────────────────── */}
          {!selectedProduct && (
            <>
              <View style={styles.searchScreenHeader}>
                <Text style={styles.searchScreenTitle}>Search Items</Text>
                <TouchableOpacity
                  style={styles.catIconBtn}
                  onPress={() => { setCatSearch(''); setCatSheetVisible(true); }}
                >
                  <Ionicons name="pricetag-outline" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={styles.searchScreenDivider} />

              <View style={styles.searchInputRow}>
                <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Type product name..."
                  placeholderTextColor="#CBD5E1"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {/* Cross-platform clear button */}
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.searchClearBtn}
                  >
                    <Ionicons name="close-circle" size={20} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>

              {activeCategory !== 'All' && (
                <TouchableOpacity style={styles.activeCatBadge} onPress={() => setActiveCategory('All')}>
                  <Text style={styles.activeCatBadgeText}>{activeCategory}</Text>
                  <Ionicons name="close-circle" size={15} color="#A855F7" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              )}

              {/*
                ★ KEY FIX: keyboardShouldPersistTaps="always"
                  This makes the Add button respond with a SINGLE tap even when
                  the keyboard is open. Without it, the first tap closes the keyboard
                  and the second tap triggers the button.
              */}
              <FlatList
                data={filteredInventory}
                keyExtractor={item => item.id}
                renderItem={renderInventoryRow}
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="none"
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptySearch}>
                    <Ionicons name="search-outline" size={40} color="#CBD5E1" />
                    <Text style={styles.emptySearchText}>No products found</Text>
                  </View>
                }
              />

              <TouchableOpacity
                style={styles.cancelFloatBtn}
                onPress={() => setSearchVisible(false)}
              >
                <Text style={styles.cancelFloatBtnText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── VIEW B: Product detail ───────────────────── */}
          {!!selectedProduct && (
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={0}
            >
              {/* Flex column: scroll content grows, footer stays above keyboard */}
              <View style={{ flex: 1 }}>
                <ScrollView
                  contentContainerStyle={styles.detailScroll}
                  keyboardShouldPersistTaps="always"
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.detailTitle}>
                    {selectedProduct.name} · {selectedProduct.price.toFixed(1)} LKR / {selectedProduct.unit}
                  </Text>
                  <Text style={styles.detailSub}>Category: {selectedProduct.category}</Text>
                  <View style={styles.detailDivider} />

                  {/* ── Quantity ── */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Quantity ({selectedProduct.unit})</Text>
                    <View style={styles.detailInputWrap}>
                      <TouchableOpacity
                        style={styles.detailStepBtn}
                        onPress={() => setItemQty(v => String(Math.max(0.01, parseFloat(v || '1') - 1)))}
                      >
                        <Ionicons name="remove" size={18} color="#A855F7" />
                      </TouchableOpacity>
                      <TextInput
                        style={styles.detailInput}
                        value={itemQty}
                        onChangeText={setItemQty}
                        keyboardType="numeric"
                        selectTextOnFocus
                      />
                      <TouchableOpacity
                        style={styles.detailStepBtn}
                        onPress={() => setItemQty(v => String((parseFloat(v || '1') + 1)))}
                      >
                        <Ionicons name="add" size={18} color="#A855F7" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* ── Available stock ── */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Available Qty</Text>
                    <View style={styles.detailInputWrap}>
                      <TextInput
                        style={[styles.detailInput, { flex: 1 }]}
                        value={itemStock}
                        onChangeText={setItemStock}
                        keyboardType="numeric"
                        selectTextOnFocus
                      />
                    </View>
                  </View>

                  {/* ── Item price ── */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{`Item Price\n(per ${selectedProduct.unit})`}</Text>
                    <View style={styles.detailInputWrap}>
                      <TextInput
                        style={[styles.detailInput, { flex: 1 }]}
                        value={itemPrice}
                        onChangeText={setItemPrice}
                        keyboardType="numeric"
                        selectTextOnFocus
                      />
                      <Text style={styles.detailUnit}>LKR</Text>
                    </View>
                  </View>

                  {/* Save price checkbox */}
                  <TouchableOpacity style={styles.checkRow} onPress={() => setSavePriceFlag(v => !v)}>
                    <Text style={styles.checkLabel}>Do you want to save the item price?</Text>
                    <View style={[styles.checkbox, savePriceFlag && styles.checkboxChecked]}>
                      {savePriceFlag && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                  </TouchableOpacity>

                  {/* ── Total amount (live preview) ── */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{`Total\nAmount`}</Text>
                    <View style={[styles.detailInputWrap, { backgroundColor: '#F0FDF4' }]}>
                      <Text style={[styles.detailInput, { flex: 1, color: '#10B981' }]}>
                        {previewTotal().toFixed(2)}
                      </Text>
                      <Text style={[styles.detailUnit, { color: '#10B981' }]}>LKR</Text>
                    </View>
                  </View>

                  {/* ── Product Discount ── */}
                  <View style={styles.discountSection}>
                    <Text style={[styles.detailLabel, { marginBottom: 8 }]}>{`Product\nDiscount`}</Text>

                    {/* Toggle % / LKR */}
                    <View style={styles.discToggleWrap}>
                      <TouchableOpacity
                        style={[styles.discToggleBtn, discountMode === 'percent' && styles.discToggleBtnActive]}
                        onPress={() => { setDiscountMode('percent'); setItemDiscount('0'); }}
                      >
                        <Text style={[styles.discToggleTxt, discountMode === 'percent' && styles.discToggleTxtActive]}>
                          % Percentage
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.discToggleBtn, discountMode === 'amount' && styles.discToggleBtnActive]}
                        onPress={() => { setDiscountMode('amount'); setItemDiscount('0'); }}
                      >
                        <Text style={[styles.discToggleTxt, discountMode === 'amount' && styles.discToggleTxtActive]}>
                          LKR Amount
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.detailInputWrap}>
                      <TextInput
                        style={[styles.detailInput, { flex: 1 }]}
                        value={itemDiscount}
                        onChangeText={setItemDiscount}
                        onFocus={() => {
                          // Clear default '0' so user can type immediately
                          if (itemDiscount === '0' || itemDiscount === '0.00') setItemDiscount('');
                        }}
                        onBlur={() => {
                          // Restore '0' if left empty
                          if (!itemDiscount.trim()) setItemDiscount('0');
                        }}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#CBD5E1"
                      />
                      <View style={styles.percentBadge}>
                        <Text style={styles.percentBadgeText}>
                          {discountMode === 'percent' ? '%' : 'Rs'}
                        </Text>
                      </View>
                    </View>

                    {/* Live discount preview */}
                    {previewDisc() > 0 && (
                      <Text style={styles.discPreview}>
                        Saving LKR {previewDisc().toFixed(2)} on this item
                      </Text>
                    )}
                  </View>

                  {/* Save discount checkbox */}
                  <TouchableOpacity style={styles.checkRow} onPress={() => setSaveDiscFlag(v => !v)}>
                    <Text style={styles.checkLabel}>Do you want to save the product discount?</Text>
                    <View style={[styles.checkbox, saveDiscFlag && styles.checkboxChecked]}>
                      {saveDiscFlag && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                  </TouchableOpacity>

                </ScrollView>

                {/* Footer inside the flex column — rises above keyboard naturally */}
                <View style={styles.detailFooter}>
                  <TouchableOpacity
                    style={styles.detailCancelBtn}
                    onPress={() => setSelectedProduct(null)}
                  >
                    <Text style={styles.detailCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.detailAddBtn} onPress={addItemToCart}>
                    <Text style={styles.detailAddText}>Add Item</Text>
                  </TouchableOpacity>
                </View>
              </View> {/* end flex column */}
            </KeyboardAvoidingView>
          )}

          {/* Render category sheet inside search overlay if opened from here */}
          {renderCategorySheet()}
        </SafeAreaView>
      </Modal>



      {/* ═══ Invoice discount modal ════════════════════════════════════════ */}
      <Modal visible={discModalVisible} transparent animationType="slide">
        {/* KeyboardAvoidingView ensures the card slides up with the keyboard */}
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={Keyboard.dismiss}
          />
          <View style={[styles.modalContent, { marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, paddingBottom: 36 }]}>
            {/* Header */}
            <Text style={[styles.summaryTitle, { fontSize: 17, marginBottom: 4 }]}>Add Invoice Discount</Text>

            {/* Current bill value */}
            <View style={styles.discModalInfoRow}>
              <Text style={styles.discModalInfoLabel}>Bill Value</Text>
              <Text style={styles.discModalInfoValue}>LKR {afterItemDisc.toFixed(2)}</Text>
            </View>

            {/* Discount type toggle */}
            <Text style={[styles.summaryLabel, { marginBottom: 8, marginTop: 12 }]}>Discount Type</Text>
            <View style={styles.discToggleWrapModal}>
              <TouchableOpacity
                style={[styles.discToggleBtnModal, invDiscType === 'percent' && styles.discToggleBtnActive]}
                onPress={() => { setInvDiscType('percent'); setCustomDiscount(''); }}
              >
                <Text style={[styles.discToggleTxt, invDiscType === 'percent' && styles.discToggleTxtActive]}>
                  % Percentage
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.discToggleBtnModal, invDiscType === 'amount' && styles.discToggleBtnActive]}
                onPress={() => { setInvDiscType('amount'); setCustomDiscount(''); }}
              >
                <Text style={[styles.discToggleTxt, invDiscType === 'amount' && styles.discToggleTxtActive]}>
                  LKR Amount
                </Text>
              </TouchableOpacity>
            </View>

            {/* Discount input */}
            <TextInput
              style={styles.discInput}
              placeholder={invDiscType === 'percent' ? 'e.g. 10' : 'e.g. 500'}
              keyboardType="numeric"
              value={customDiscount}
              onChangeText={setCustomDiscount}
              onFocus={() => { if (customDiscount === '0') setCustomDiscount(''); }}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />

            {/* Live preview */}
            {invDiscValue > 0 && (
              <View style={styles.discModalPreviewBox}>
                <View style={styles.discModalPreviewRow}>
                  <Text style={styles.discModalPreviewLabel}>Discount</Text>
                  <Text style={[styles.discModalPreviewVal, { color: '#EF4444' }]}>-LKR {invDiscAmt.toFixed(2)}</Text>
                </View>
                <View style={[styles.discModalPreviewRow, { marginTop: 6 }]}>
                  <Text style={[styles.discModalPreviewLabel, { fontWeight: '800', color: '#1E293B' }]}>Final Amount</Text>
                  <Text style={[styles.discModalPreviewVal, { fontWeight: '800', color: '#A855F7', fontSize: 17 }]}>LKR {invDiscFinal.toFixed(2)}</Text>
                </View>
              </View>
            )}

            {/* Buttons — always visible above keyboard */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity
                style={[styles.generateBtn, { flex: 1, backgroundColor: '#94A3B8' }]}
                onPress={() => { Keyboard.dismiss(); setDiscModalVisible(false); }}
              >
                <Text style={[styles.generateBtnText, { textAlign: 'center' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.generateBtn, { flex: 1 }]}
                onPress={() => {
                  setInvoiceDiscountMode(invDiscType);
                  setInvoiceDiscountValue(invDiscType === 'percent' ? Math.min(100, invDiscValue) : invDiscValue);
                  Keyboard.dismiss();
                  setDiscModalVisible(false);
                }}
              >
                <Text style={[styles.generateBtnText, { textAlign: 'center' }]}>Add Discount</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ═══ Edit qty modal ═════════════════════════════════════════════════ */}
      <Modal visible={!!editingQtyItem} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.summaryTitle}>Enter Exact Quantity</Text>
            <Text style={styles.summaryLabel}>Examples: 1.5, 0.25 (for 250g)</Text>
            <TextInput
              style={styles.discInput}
              placeholder="e.g. 0.25"
              keyboardType="numeric"
              value={editingQtyItem?.val || ''}
              onChangeText={t => setEditingQtyItem(prev => prev ? { ...prev, val: t } : null)}
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={[styles.generateBtn, { flex: 1, backgroundColor: colors.textMuted }]}
                onPress={() => setEditingQtyItem(null)}
              >
                <Text style={[styles.generateBtnText, { textAlign: 'center' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.generateBtn, { flex: 1 }]}
                onPress={() => {
                  if (editingQtyItem) {
                    const qty = parseFloat(editingQtyItem.val);
                    if (!isNaN(qty) && qty > 0) setExactQty(editingQtyItem.id, qty);
                  }
                  setEditingQtyItem(null);
                }}
              >
                <Text style={[styles.generateBtnText, { textAlign: 'center' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ═══ Customer Select Modal ══════════════════════════════════════════════ */}
      <Modal visible={customerModalVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.custModal}>
          {/* Header */}
          <View style={styles.custHeader}>
            <Text style={styles.custHeaderTitle}>Select Customer</Text>
            <TouchableOpacity onPress={() => setCustomerModalVisible(false)} style={styles.custCloseBtn}>
              <Ionicons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          <View style={styles.custDivider} />

          {/* Search */}
          <View style={styles.custSearchRow}>
            <Text style={styles.custSearchLabel}>Search Customer</Text>
            <TextInput
              style={styles.custSearchInput}
              placeholder="Name or phone..."
              placeholderTextColor="#CBD5E1"
              value={customerSearch}
              onChangeText={setCustomerSearch}
            />
            <TouchableOpacity style={styles.custAddBtn}>
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.custDivider} />

          {/* List */}
          <FlatList
            data={filteredCustomers}
            keyExtractor={c => c.id}
            keyboardShouldPersistTaps="always"
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120 }}
            renderItem={({ item }) => {
              const letter = item.name.charAt(0).toUpperCase();
              const colors2 = ['#C084FC','#67E8F9','#86EFAC','#FCA5A5','#FCD34D','#A5B4FC'];
              const bg = colors2[parseInt(item.id) % colors2.length];
              return (
                <TouchableOpacity
                  style={styles.custRow}
                  onPress={() => proceedToPayment(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.custAvatar, { backgroundColor: bg }]}>
                    <Text style={styles.custAvatarLetter}>{letter}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.custName}>{item.name}</Text>
                    <Text style={styles.custPhone}>{item.phone}</Text>
                  </View>
                  <Ionicons name="eye-outline" size={20} color="#CBD5E1" />
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', paddingTop: 40 }}>
                <Text style={{ color: '#CBD5E1', fontSize: 15 }}>No customers found</Text>
              </View>
            }
          />

          {/* Footer */}
          <View style={styles.custFooter}>
            <TouchableOpacity
              style={styles.custNotRequiredBtn}
              onPress={() => proceedToPayment(null)}
            >
              <Text style={styles.custNotRequiredText}>Not required</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.custSelectBtn}
              onPress={() => proceedToPayment(selectedCustomer)}
            >
              <Text style={styles.custSelectText}>Select</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ═══ Payment Method Modal ════════════════════════════════════════════════ */}
      <Modal visible={paymentModalVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.payModal}>
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              contentContainerStyle={styles.payScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.payHeader}>
              <TouchableOpacity onPress={() => { setPaymentModalVisible(false); setCustomerModalVisible(true); }}>
                <Ionicons name="arrow-back" size={22} color="#64748B" />
              </TouchableOpacity>
              <Text style={styles.payTitle}>Payment Method</Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Method tabs */}
            <View style={styles.payMethodRow}>
              {(['Cash','Credit','Cheque','QR'] as PaymentMethod[]).map(m => (
                <TouchableOpacity
                  key={m}
                  style={[styles.payMethodBtn, paymentMethod === m && styles.payMethodBtnActive]}
                  onPress={() => {
                    setPaymentMethod(m);
                    if (m === 'Cash') setPaidAmountStr(finalTotal.toFixed(2));
                    else setPaidAmountStr('');
                  }}
                >
                  <Text style={[styles.payMethodTxt, paymentMethod === m && styles.payMethodTxtActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Date & Time */}
            <View style={styles.payFieldBox}>
              <Text style={styles.payFieldLabel}>Created Date {'&'} Time</Text>
              <View style={styles.payFieldInner}>
                <Ionicons name="calendar-outline" size={20} color="#CBD5E1" style={{ marginRight: 10 }} />
                <Text style={styles.payFieldValue}>
                  {(() => { const n = new Date(); const h = n.getHours(); const ampm = h >= 12 ? 'PM' : 'AM'; const h12 = h % 12 || 12; return `${n.getDate()}/${n.getMonth()+1}/${n.getFullYear()} & ${h12.toString().padStart(2,'0')}:${n.getMinutes().toString().padStart(2,'0')} ${ampm}`; })()}
                </Text>
              </View>
            </View>

            {/* Bill amount */}
            <View style={styles.payFieldBox}>
              <Text style={styles.payFieldLabel}>Bill Amount</Text>
              <View style={styles.payFieldInner}>
                <Ionicons name="cash-outline" size={20} color="#CBD5E1" style={{ marginRight: 10 }} />
                <Text style={styles.payFieldValue}>{finalTotal.toFixed(2)}</Text>
              </View>
            </View>

            {/* ── CASH fields ── */}
            {paymentMethod === 'Cash' && (
              <>
                <View style={styles.payFieldBox}>
                  <Text style={styles.payFieldLabel}>Paid Amount</Text>
                  <View style={styles.payFieldInner}>
                    <Ionicons name="cash-outline" size={20} color="#CBD5E1" style={{ marginRight: 10 }} />
                    <TextInput
                      style={styles.payFieldInput}
                      keyboardType="numeric"
                      value={paidAmountStr}
                      onChangeText={setPaidAmountStr}
                      placeholder="0.00"
                      placeholderTextColor="#CBD5E1"
                    />
                  </View>
                </View>
                <View style={styles.payFieldBox}>
                  <Text style={styles.payFieldLabel}>Balance</Text>
                  <View style={styles.payFieldInner}>
                    <Ionicons name="cash-outline" size={20} color="#CBD5E1" style={{ marginRight: 10 }} />
                    <Text style={[styles.payFieldValue, { color: (parsedPaid - finalTotal) < 0 ? '#EF4444' : '#10B981' }]}>
                      {(parsedPaid - finalTotal).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* ── CREDIT fields ── */}
            {paymentMethod === 'Credit' && (
              <>
                <View style={styles.payFieldBox}>
                  <Text style={styles.payFieldLabel}>Paid Amount</Text>
                  <View style={styles.payFieldInner}>
                    <Ionicons name="cash-outline" size={20} color="#CBD5E1" style={{ marginRight: 10 }} />
                    <TextInput
                      style={styles.payFieldInput}
                      keyboardType="numeric"
                      value={paidAmountStr}
                      onChangeText={setPaidAmountStr}
                      placeholder="0.00"
                      placeholderTextColor="#CBD5E1"
                    />
                  </View>
                </View>
                <View style={styles.payFieldBox}>
                  <Text style={styles.payFieldLabel}>Outstanding Amount</Text>
                  <View style={styles.payFieldInner}>
                    <Ionicons name="cash-outline" size={20} color="#CBD5E1" style={{ marginRight: 10 }} />
                    <Text style={[styles.payFieldValue, { color: '#F59E0B' }]}>
                      {(finalTotal - parsedPaid).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* ── CHEQUE fields ── */}
            {paymentMethod === 'Cheque' && (
              <>
                <View style={styles.payFieldBox}>
                  <Text style={styles.payFieldLabel}>Paid Amount</Text>
                  <View style={[styles.payFieldInner, { borderStyle: 'dashed' }]}>
                    <Ionicons name="cash-outline" size={20} color="#CBD5E1" style={{ marginRight: 10 }} />
                    <TextInput
                      style={styles.payFieldInput}
                      keyboardType="numeric"
                      value={paidAmountStr}
                      onChangeText={setPaidAmountStr}
                      placeholder="Paid Amount"
                      placeholderTextColor="#CBD5E1"
                    />
                  </View>
                </View>
                <View style={styles.payFieldBox}>
                  <Text style={styles.payFieldLabel}>Cheque Amount</Text>
                  <View style={styles.payFieldInner}>
                    <Ionicons name="cash-outline" size={20} color="#CBD5E1" style={{ marginRight: 10 }} />
                    <Text style={styles.payFieldValue}>{finalTotal.toFixed(2)}</Text>
                  </View>
                </View>
                <View style={styles.payFieldBox}>
                  <View style={[styles.payFieldInner, { borderStyle: 'dashed' }]}>
                    <Ionicons name="document-text-outline" size={20} color="#CBD5E1" style={{ marginRight: 10 }} />
                    <TextInput
                      style={styles.payFieldInput}
                      value={chequeNumber}
                      onChangeText={setChequeNumber}
                      placeholder="Cheque Number"
                      placeholderTextColor="#CBD5E1"
                    />
                  </View>
                </View>
                <View style={styles.payFieldBox}>
                  <View style={[styles.payFieldInner, { borderStyle: 'dashed' }]}>
                    <Ionicons name="document-text-outline" size={20} color="#CBD5E1" style={{ marginRight: 10 }} />
                    <TextInput
                      style={styles.payFieldInput}
                      value={chequeDate}
                      onChangeText={setChequeDate}
                      placeholder="Cheque Date"
                      placeholderTextColor="#CBD5E1"
                    />
                  </View>
                </View>
              </>
            )}

            {/* ── QR fields ── */}
            {paymentMethod === 'QR' && (
              <>
                {/* Sub-tabs */}
                <View style={styles.qrSubTabRow}>
                  {(['Static','Dynamic'] as const).map(t => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.qrSubTab, qrSubTab === t && styles.qrSubTabActive]}
                      onPress={() => setQrSubTab(t)}
                    >
                      <Text style={[styles.qrSubTabTxt, qrSubTab === t && styles.qrSubTabTxtActive]}>{t} QR</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* QR placeholder */}
                <View style={styles.qrBox}>
                  <View style={styles.qrImagePlaceholder}>
                    {/* QR grid pattern drawn with nested views */}
                    <View style={styles.qrGrid}>
                      {[...Array(6)].map((_, r) => (
                        <View key={r} style={styles.qrGridRow}>
                          {[...Array(6)].map((_, c) => {
                            const filled = (r === 0 || r === 5 || c === 0 || c === 5 || (r > 1 && r < 4 && c > 1 && c < 4));
                            return <View key={c} style={[styles.qrCell, filled && styles.qrCellFilled]} />;
                          })}
                        </View>
                      ))}
                    </View>
                    <Text style={styles.qrLabel}>{qrSubTab} QR Code</Text>
                    {qrSubTab === 'Dynamic' && (
                      <Text style={styles.qrAmount}>LKR {finalTotal.toFixed(2)}</Text>
                    )}
                  </View>
                  <Text style={styles.qrHint}>
                    {qrSubTab === 'Static'
                      ? 'Customer scans this QR to pay any amount'
                      : `QR pre-loaded with LKR ${finalTotal.toFixed(2)}`}
                  </Text>
                </View>

                <View style={styles.payFieldBox}>
                  <Text style={styles.payFieldLabel}>Paid Amount</Text>
                  <View style={styles.payFieldInner}>
                    <Ionicons name="cash-outline" size={20} color="#CBD5E1" style={{ marginRight: 10 }} />
                    <TextInput
                      style={styles.payFieldInput}
                      keyboardType="numeric"
                      value={paidAmountStr}
                      onChangeText={setPaidAmountStr}
                      placeholder="0.00"
                      placeholderTextColor="#CBD5E1"
                    />
                  </View>
                </View>
                <View style={styles.payFieldBox}>
                  <Text style={styles.payFieldLabel}>Balance</Text>
                  <View style={styles.payFieldInner}>
                    <Ionicons name="cash-outline" size={20} color="#CBD5E1" style={{ marginRight: 10 }} />
                    <Text style={[styles.payFieldValue, { color: (parsedPaid - finalTotal) < 0 ? '#EF4444' : '#10B981' }]}>
                      {(parsedPaid - finalTotal).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* Selected customer chip */}
            {selectedCustomer && (
              <View style={styles.customerChip}>
                <Ionicons name="person-circle-outline" size={18} color="#A855F7" />
                <Text style={styles.customerChipText}>{selectedCustomer.name}</Text>
              </View>
            )}

            <View style={{ height: 100 }} />
          </ScrollView>

            {/* Issue Bill button */}
            <View style={styles.payFooter}>
              <TouchableOpacity style={styles.issueBillBtn} onPress={issueBill}>
                <Text style={styles.issueBillText}>Issue Bill</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* ═══ Multi-Invoice Modal ════════════════════════════════════════════ */}
      <Modal visible={invoicesModalVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
          <View style={styles.invoicesHeader}>
            <TouchableOpacity onPress={() => setInvoicesModalVisible(false)} style={{ padding: 8 }}>
              <Ionicons name="arrow-back" size={24} color="#94A3B8" />
            </TouchableOpacity>
            <Text style={styles.invoicesTitle}>Invoices</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.invoicesGrid}>
            {invoices.map(inv => {
              const isActive = inv.id === activeInvoiceId;
              return (
                <TouchableOpacity
                  key={inv.id}
                  style={[styles.invoiceCard, isActive && styles.invoiceCardActive]}
                  onPress={() => {
                    setActiveInvoiceId(inv.id);
                    setInvoicesModalVisible(false);
                  }}
                  activeOpacity={0.8}
                >
                  <TouchableOpacity
                    style={styles.invoiceDeleteBtn}
                    onPress={() => confirmDelete(inv.id, inv.name)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>

                  {isActive ? (
                    <View style={styles.invoiceBadge}>
                      <Text style={styles.invoiceBadgeText}>{inv.name}</Text>
                    </View>
                  ) : <View style={{ height: 16 }} />}

                  <TextInput
                    style={styles.invoiceNameInput}
                    value={inv.name}
                    onChangeText={t => updateInvoiceName(inv.id, t)}
                    placeholder="Invoice name..."
                    placeholderTextColor="#94A3B8"
                  />
                </TouchableOpacity>
              );
            })}

            {/* Add new invoice block */}
            <TouchableOpacity
              style={styles.addInvoiceCard}
              onPress={() => {
                const newId = 'inv-' + Date.now();
                setInvoices([...invoices, { id: newId, name: `Invoice ${invoices.length + 1}`, cart: [], discountValue: 0, discountMode: 'percent' }]);
                setActiveInvoiceId(newId);
                setInvoicesModalVisible(false);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={40} color="#1E293B" />
              <Text style={styles.addInvoiceText}>Add new invoice</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Render category sheet inside main screen if opened from here */}
      {renderCategorySheet()}

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  headerPillContainer: { paddingHorizontal: 16, paddingTop: 16, alignItems: 'flex-start' },
  headerPill: { backgroundColor: '#A855F7', paddingHorizontal: 16, paddingVertical: 4, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  headerPillText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  searchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  searchBarBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, marginRight: 10 },
  searchBarBtnText: { fontSize: 14, color: '#94A3B8' },
  searchActions: { flexDirection: 'row', gap: 8 },
  actionIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },

  listHeaderRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10 },
  listHeaderCol1: { flex: 2, fontSize: 12, color: colors.textMuted },
  listHeaderCol2: { flex: 1, fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  listHeaderCol3: { flex: 1, fontSize: 12, color: colors.textMuted, textAlign: 'right' },
  listContainer: { paddingHorizontal: 16, paddingBottom: 24 },

  cartItemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 8, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  cartItemInfo: { flex: 2 },
  cartItemName: { fontSize: 14, fontWeight: '600', color: colors.textDark },
  cartItemPrice: { fontSize: 12, color: colors.textMuted },
  discBadge: { backgroundColor: '#D1FAE5', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 },
  discBadgeText: { fontSize: 10, color: '#065F46', fontWeight: '700' },
  qtyControlContainer: { flex: 1.2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.background, borderRadius: 20, paddingHorizontal: 6, paddingVertical: 4, marginHorizontal: 8 },
  qtyBtn: { width: 28, height: 28, backgroundColor: '#E2E8F0', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 14, fontWeight: 'bold', color: colors.textDark, minWidth: 28, textAlign: 'center' },
  cartItemAmountContainer: { flex: 1, alignItems: 'flex-end' },
  cartItemAmount: { fontSize: 14, fontWeight: 'bold', color: '#10B981' },
  emptyCart: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyCartText: { fontSize: 16, fontWeight: '600', color: '#CBD5E1' },
  emptyCartSub: { fontSize: 13, color: '#CBD5E1' },

  summaryContainer: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 28, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 10 },
  summaryActionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  collapseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  purpleTextBold: { color: '#A855F7', fontWeight: 'bold', fontSize: 14 },
  addDiscountRow: { flexDirection: 'row', alignItems: 'center' },
  invoiceSummaryBox: { marginBottom: 16 },
  summaryTitle: { fontSize: 14, fontWeight: 'bold', color: colors.textDark, marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  summaryLabel: { fontSize: 13, color: colors.textMuted },
  summaryValue: { fontSize: 13, color: colors.textMuted },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerTotalBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerTotalLabel: { fontSize: 16, color: colors.textMuted },
  footerTotalValue: { fontSize: 18, fontWeight: 'bold', color: colors.textDark },
  generateBtn: { backgroundColor: '#A855F7', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  generateBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { width: '100%', backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  discInput: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 18, marginTop: 10, marginBottom: 8, textAlign: 'center', color: '#1E293B', fontWeight: '700' },

  // Discount modal extras
  discModalInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, marginTop: 8 },
  discModalInfoLabel: { fontSize: 13, color: '#64748B' },
  discModalInfoValue: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  discToggleWrapModal: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 30, padding: 4, marginBottom: 4, alignSelf: 'stretch' },
  discToggleBtnModal: { flex: 1, paddingVertical: 9, paddingHorizontal: 10, borderRadius: 26, alignItems: 'center' },
  discModalPreviewBox: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, marginTop: 4 },
  discModalPreviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  discModalPreviewLabel: { fontSize: 13, color: '#64748B' },
  discModalPreviewVal: { fontSize: 14, fontWeight: '700', color: '#1E293B' },

  // Cart item discount line
  discLineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  discLineText: { fontSize: 11, color: '#10B981', fontWeight: '600', flex: 1 },

  // Search screen
  searchScreen: { flex: 1, backgroundColor: '#F8FAFC' },
  searchScreenHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  searchScreenTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  catIconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  searchScreenDivider: { height: 1, backgroundColor: '#E2E8F0' },
  searchInputRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 12, marginBottom: 8, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, fontSize: 15, color: '#1E293B', fontWeight: '500' },
  searchClearBtn: { marginLeft: 6 },
  activeCatBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginLeft: 16, marginBottom: 8, backgroundColor: '#F3E8FF', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  activeCatBadgeText: { fontSize: 13, color: '#A855F7', fontWeight: '600' },
  invRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', minHeight: 64 },
  invName: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  invMeta: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  invAddBtn: { borderWidth: 1.5, borderColor: '#A855F7', borderRadius: 20, paddingHorizontal: 22, paddingVertical: 9, marginLeft: 8 },
  invAddBtnText: { color: '#A855F7', fontWeight: '700', fontSize: 14 },
  emptySearch: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptySearchText: { color: '#CBD5E1', fontSize: 15, fontWeight: '600' },
  cancelFloatBtn: { position: 'absolute', bottom: 28, right: 20, backgroundColor: '#1E293B', paddingHorizontal: 28, paddingVertical: 13, borderRadius: 30 },
  cancelFloatBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Product detail
  detailScroll: { padding: 20, paddingBottom: 140 },
  detailTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  detailSub: { fontSize: 13, color: '#94A3B8', marginBottom: 12 },
  detailDivider: { height: 1, backgroundColor: '#E2E8F0', marginBottom: 20 },
  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  detailLabel: { fontSize: 14, color: '#1E293B', fontWeight: '500', flex: 1, lineHeight: 20 },
  detailInputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 30, paddingHorizontal: 12, backgroundColor: '#fff', minWidth: 150, minHeight: 52 },
  detailStepBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  detailInput: { fontSize: 17, color: '#1E293B', fontWeight: '700', paddingVertical: 14, textAlign: 'center', minWidth: 60 },
  detailUnit: { fontSize: 14, color: '#94A3B8', fontWeight: '600', marginLeft: 4 },
  detailStaticValue: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  checkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingVertical: 4 },
  checkLabel: { fontSize: 13, color: '#475569', flex: 1 },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: '#E91E8C', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#E91E8C', borderColor: '#E91E8C' },

  // Discount section
  discountSection: { marginBottom: 16 },
  discToggleWrap: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 30, padding: 4, alignSelf: 'flex-start', marginBottom: 12, marginTop: 4 },
  discToggleBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 26 },
  discToggleBtnActive: { backgroundColor: '#A855F7' },
  discToggleTxt: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  discToggleTxtActive: { color: '#fff' },
  percentBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
  percentBadgeText: { fontSize: 13, color: '#64748B', fontWeight: '700' },
  discPreview: { fontSize: 12, color: '#10B981', fontWeight: '600', marginTop: 6, marginLeft: 4 },

  detailFooter: { flexDirection: 'row', gap: 14, padding: 16, paddingBottom: 24, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  detailCancelBtn: { flex: 1, backgroundColor: '#1E293B', borderRadius: 30, paddingVertical: 16, alignItems: 'center' },
  detailCancelText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  detailAddBtn: { flex: 1, backgroundColor: '#A855F7', borderRadius: 30, paddingVertical: 16, alignItems: 'center' },
  detailAddText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Category sheet
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', flexDirection: 'row', justifyContent: 'flex-end' },
  sheet: { width: '75%', height: '100%', backgroundColor: '#fff', paddingTop: Platform.OS === 'ios' ? 44 : 20, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: -5, height: 0 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: 14 },
  sheetDivider: { height: 1, backgroundColor: '#E2E8F0', marginBottom: 14 },
  sheetSearchWrap: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 10, borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 30, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#F8FAFC' },
  sheetSearchInput: { flex: 1, fontSize: 15, color: '#1E293B' },
  catRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  catRowText: { fontSize: 15, color: '#1E293B', fontWeight: '500' },
  catRowTextActive: { color: '#A855F7', fontWeight: '700' },
  catCheckbox: { width: 24, height: 24, borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  catCheckboxActive: { backgroundColor: '#A855F7', borderColor: '#A855F7' },

  // Invoices Modal
  invoicesHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  invoicesTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  invoicesGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 20, gap: 16 },
  invoiceCard: { width: '47%', height: 160, backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: '#E2E8F0', padding: 12, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  invoiceCardActive: { borderColor: '#1E293B', borderWidth: 1.5 },
  invoiceBadge: { backgroundColor: '#A855F7', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8, marginTop: -18, marginBottom: 12, zIndex: 10, elevation: 10 },
  invoiceBadgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  invoiceNameInput: { backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, fontSize: 13, color: '#1E293B', width: '100%', fontWeight: '500' },
  invoiceDeleteBtn: { position: 'absolute', top: 12, right: 12, zIndex: 20 },
  addInvoiceCard: { width: '47%', height: 160, backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: '#E2E8F0', padding: 12, alignItems: 'center', justifyContent: 'center' },
  addInvoiceText: { color: '#1E293B', fontSize: 14, fontWeight: '600', marginTop: 4 },

  // ─── Customer Modal ───────────────────────────────────────────────────────────
  custModal: { flex: 1, backgroundColor: '#fff' },
  custHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, position: 'relative' },
  custHeaderTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  custCloseBtn: { position: 'absolute', right: 16, padding: 4 },
  custDivider: { height: 1, backgroundColor: '#E2E8F0', marginHorizontal: 0 },
  custSearchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 10 },
  custSearchLabel: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  custSearchInput: { flex: 1, fontSize: 14, color: '#1E293B', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 4 },
  custAddBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#A855F7', justifyContent: 'center', alignItems: 'center' },
  custRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F8FAFC', gap: 14 },
  custAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  custAvatarLetter: { fontSize: 18, fontWeight: '700', color: '#fff' },
  custName: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  custPhone: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  custFooter: { flexDirection: 'row', gap: 14, paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#fff' },
  custNotRequiredBtn: { flex: 1, backgroundColor: '#1E293B', borderRadius: 30, paddingVertical: 16, alignItems: 'center' },
  custNotRequiredText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  custSelectBtn: { flex: 1, backgroundColor: '#A855F7', borderRadius: 30, paddingVertical: 16, alignItems: 'center' },
  custSelectText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // ─── Payment Modal ────────────────────────────────────────────────────────────
  payModal: { flex: 1, backgroundColor: '#F2F0FF' },
  payScroll: { paddingHorizontal: 20, paddingBottom: 40 },
  payHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  payTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  payMethodRow: { flexDirection: 'row', gap: 10, marginBottom: 22, marginTop: 4 },
  payMethodBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: '#E2E8F0', alignItems: 'center' },
  payMethodBtnActive: { backgroundColor: '#A855F7' },
  payMethodTxt: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  payMethodTxtActive: { color: '#fff' },
  payFieldBox: { marginBottom: 14 },
  payFieldLabel: { fontSize: 12, color: '#94A3B8', marginBottom: 4, marginLeft: 4 },
  payFieldInner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 30, borderWidth: 1.5, borderColor: '#E2E8F0', paddingHorizontal: 16, paddingVertical: 14, minHeight: 52 },
  payFieldValue: { fontSize: 16, fontWeight: '600', color: '#1E293B', flex: 1 },
  payFieldInput: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1E293B', padding: 0 },
  payFooter: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#F2F0FF', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  issueBillBtn: { backgroundColor: '#A855F7', borderRadius: 30, paddingVertical: 17, alignItems: 'center' },
  issueBillText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  customerChip: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: '#F3E8FF', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginTop: 8 },
  customerChipText: { fontSize: 13, color: '#A855F7', fontWeight: '600' },

  // ─── QR Section ───────────────────────────────────────────────────────────────
  qrSubTabRow: { flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: 12, padding: 4, marginBottom: 16 },
  qrSubTab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  qrSubTabActive: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
  qrSubTabTxt: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  qrSubTabTxtActive: { color: '#A855F7', fontWeight: '700' },
  qrBox: { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  qrImagePlaceholder: { width: 180, height: 180, backgroundColor: '#F8FAFC', borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#E2E8F0', marginBottom: 12, padding: 16 },
  qrGrid: { gap: 4 },
  qrGridRow: { flexDirection: 'row', gap: 4 },
  qrCell: { width: 20, height: 20, borderRadius: 3, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  qrCellFilled: { backgroundColor: '#1E293B', borderColor: '#1E293B' },
  qrLabel: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginTop: 8 },
  qrAmount: { fontSize: 18, fontWeight: '800', color: '#A855F7', marginTop: 4 },
  qrHint: { fontSize: 13, color: '#94A3B8', textAlign: 'center' },
});
