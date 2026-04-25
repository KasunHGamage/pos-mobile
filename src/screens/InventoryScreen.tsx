import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Button,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AddProductModal from '../components/AddProductModal';
import CategoriesModal from '../components/CategoriesModal';
import EditCategoryModal from '../components/EditCategoryModal';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { Product, getProductsList, toggleFeaturedProduct, saveProductChanges } from '../services/inventoryService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function InventoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { currencySymbol } = useCurrency();
  const { token } = useAuth();

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Edit modal state
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<any>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [categoriesRefreshKey, setCategoriesRefreshKey] = useState(0);

  const loadProducts = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true); else setLoading(true);
      const data = await getProductsList(token || undefined);
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const filteredData = products.filter(item => {
    const q = search.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(q) ||
      (item.brand || '').toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q);
    const matchesCategory = selectedCategoryFilter ? item.category === selectedCategoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const handleStarToggle = async (product: Product) => {
    // Optimistically update UI
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isFeatured: !p.isFeatured } : p));
    if (selectedItem?.id === product.id) {
      setSelectedItem(prev => prev ? { ...prev, isFeatured: !prev.isFeatured } : prev);
    }
    try {
      await toggleFeaturedProduct(product.id, token || undefined);
    } catch (error) {
      // Revert on failure
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isFeatured: product.isFeatured } : p));
      Alert.alert('Error', 'Failed to update starred status');
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedItem || !editForm) return;
    try {
      setIsSavingProduct(true);
      const updated = await saveProductChanges(selectedItem.id, {
        name: editForm.name,
        sku: editForm.sku,
        costPrice: editForm.cost ? parseFloat(editForm.cost) : undefined,
        retailPrice: editForm.priceStr ? parseFloat(editForm.priceStr) : undefined,
        discountPrice: editForm.discountAmt ? parseFloat(editForm.discountAmt) : undefined,
        stock: editForm.qtyStr ? parseFloat(editForm.qtyStr) : undefined,
        brand: editForm.brand,
      }, token || undefined);
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      setSelectedItem(null);
      setEditForm(null);
      Alert.alert('Success', 'Product updated!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save product');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.tableRow} 
      onPress={() => {
        setSelectedItem(item);
        setEditForm({
          name: item.name,
          sku: item.sku,
          code: item.sku,
          cost: item.costPrice != null ? item.costPrice.toFixed(2) : '',
          priceStr: item.price != null ? item.price.toFixed(2) : '',
          discount: '0.00',
          discountAmt: item.discountPrice != null ? item.discountPrice.toFixed(2) : '0.00',
          qtyStr: item.stock != null ? item.stock.toFixed(1) : '0.0',
          brand: item.brand || '',
        });
      }}
      activeOpacity={0.7}
    >
      <View style={styles.colName}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemBrand}>{item.brand || item.category || ''}</Text>
      </View>
      <Text style={[styles.colPrice, { color: colors.success }]}>
        {(item.retailPrice != null ? item.retailPrice : item.price)?.toFixed(1)}
      </Text>
      <Text style={[styles.colQty, { color: (item.stock ?? 0) < 20 ? colors.error : colors.textDark }]}>
        {item.stock}
      </Text>
      <Text style={styles.colSales}>{(item as any).sales || 0}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Inventory"
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.iconButton, styles.modernAddButton]} 
            onPress={() => setIsAddingItem(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={28} color={colors.surface} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.iconButton, styles.darkIconButton]}
            onPress={() => setShowMenu(true)}
          >
            <Ionicons name="ellipsis-vertical" size={24} color={colors.surface} />
          </TouchableOpacity>
        </View>
      </View>

      {selectedCategoryFilter && (
        <View style={styles.filterChipContainer}>
          <View style={styles.filterChip}>
            <Text style={styles.filterChipText}>Category: {selectedCategoryFilter}</Text>
            <TouchableOpacity onPress={() => setSelectedCategoryFilter(null)}>
              <Ionicons name="close-circle" size={18} color={colors.surface} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.tableHeader}>
        <Text style={styles.colNameHeader}>Product Name</Text>
        <Text style={styles.colPriceHeader}>Retail Price({currencySymbol})</Text>
        <Text style={styles.colQtyHeader}>Ava.Qty</Text>
        <Text style={styles.colSalesHeader}>No of Sales</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#A855F7" />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadProducts(true)}
              tintColor="#A855F7"
            />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Ionicons name="cube-outline" size={48} color="#CBD5E1" />
              <Text style={{ color: '#94A3B8', marginTop: 12, fontSize: 15 }}>No products found</Text>
            </View>
          }
        />
      )}

      {/* Edit Modal matching Graphic 1 */}
      <Modal
        visible={!!selectedItem}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', alignItems: 'center' }}>
            <View style={styles.modalContent}>
              {selectedItem && editForm && (
                <>
                  <ScrollView style={{ marginTop: 10 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                    <View style={[styles.modalTopSection, { justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }]}>
                      <View style={styles.modalProductNumberBox}>
                        <TouchableOpacity onPress={() => handleStarToggle(selectedItem)} style={{ alignSelf: 'flex-start', marginBottom: 16 }}>
                          <Ionicons name={selectedItem.isFeatured ? "star" : "star-outline"} size={32} color={selectedItem.isFeatured ? "#A855F7" : "#CBD5E1"} />
                        </TouchableOpacity>
                        <Text style={styles.modalProductNumberLabel}>Product Number</Text>
                        <Text style={styles.modalProductNumberValue}>{selectedItem.sku}</Text>
                      </View>

                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.modalQty}>{selectedItem.stock?.toFixed(1)}</Text>
                        <Text style={styles.modalQtyLabel}>Available Quantity</Text>
                        <Text style={styles.modalOldPrice}>{currencySymbol} {selectedItem.price?.toFixed(2)}</Text>
                      </View>
                    </View>

                  <View style={styles.modalFieldsContainer}>
                    {/* SKU Number */}
                    <View style={styles.modalFieldGroup}>
                      <Text style={styles.modalFieldLabel}>SKU Number</Text>
                      <View style={styles.modalInputBox}>
                        <Ionicons name="pricetag-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                        <TextInput style={styles.modalInput} value={editForm.sku} onChangeText={v => setEditForm({...editForm, sku: v})} />
                      </View>
                    </View>

                    {/* Product Name */}
                    <View style={styles.modalFieldGroup}>
                      <Text style={styles.modalFieldLabel}>Product Name</Text>
                      <View style={styles.modalInputBox}>
                        <Ionicons name="pricetag-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                        <TextInput style={styles.modalInput} value={editForm.name} onChangeText={v => setEditForm({...editForm, name: v})} />
                      </View>
                    </View>

                    {/* Product Cost */}
                    <View style={styles.modalFieldGroup}>
                      <Text style={styles.modalFieldLabel}>Product Cost</Text>
                      <View style={styles.modalInputBox}>
                        <Ionicons name="cash-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                        <TextInput style={styles.modalInput} value={editForm.cost} keyboardType="numeric" onChangeText={v => setEditForm({...editForm, cost: v})} />
                      </View>
                    </View>

                    {/* Retail Price */}
                    <View style={styles.modalFieldGroup}>
                      <Text style={styles.modalFieldLabel}>Retail Price</Text>
                      <View style={styles.modalInputBox}>
                        <Ionicons name="cash-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                        <TextInput style={styles.modalInput} value={editForm.priceStr} keyboardType="numeric" onChangeText={v => setEditForm({...editForm, priceStr: v})} />
                      </View>
                    </View>

                    {/* Product Discount */}
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <View style={[styles.modalFieldGroup, { flex: 1 }]}>
                        <Text style={styles.modalFieldLabel}>Discount %</Text>
                        <View style={styles.modalInputBox}>
                          <TextInput style={[styles.modalInput, { paddingLeft: 6 }]} value={editForm.discount} keyboardType="numeric" onChangeText={v => setEditForm({...editForm, discount: v})} />
                          <View style={styles.percentBadge}>
                             <Text style={styles.percentBadgeText}>%</Text>
                          </View>
                        </View>
                      </View>
                      <View style={[styles.modalFieldGroup, { flex: 1 }]}>
                        <Text style={styles.modalFieldLabel}>Discount Amt</Text>
                        <View style={styles.modalInputBox}>
                          <TextInput style={[styles.modalInput, { paddingLeft: 6 }]} value={editForm.discountAmt} keyboardType="numeric" onChangeText={v => setEditForm({...editForm, discountAmt: v})} />
                          <Text style={{ color: colors.textMuted, fontWeight: 'bold' }}>{currencySymbol}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Quantity */}
                    <View style={styles.modalFieldGroup}>
                      <Text style={styles.modalFieldLabel}>Quantity</Text>
                      <View style={styles.modalInputBox}>
                        <Ionicons name="file-tray-stacked-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                        <TextInput style={styles.modalInput} value={editForm.qtyStr} keyboardType="numeric" onChangeText={v => setEditForm({...editForm, qtyStr: v})} />
                      </View>
                    </View>

                    {/* Brand Name */}
                    <View style={styles.modalFieldGroup}>
                      <Text style={styles.modalFieldLabel}>Brand Name</Text>
                      <View style={styles.modalInputBox}>
                        <Ionicons name="pricetag-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                        <TextInput style={styles.modalInput} value={editForm.brand} onChangeText={v => setEditForm({...editForm, brand: v})} />
                      </View>
                    </View>
                  </View>

                  <View style={styles.modalActions}>
                    <TouchableOpacity 
                      style={styles.modalBtnCancel} 
                      onPress={() => { setSelectedItem(null); setEditForm(null); }}
                    >
                      <Text style={styles.modalBtnCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.modalBtnSave, isSavingProduct && { opacity: 0.7 }]}
                      onPress={handleSaveChanges}
                      disabled={isSavingProduct}
                    >
                      <Text style={styles.modalBtnSaveText}>{isSavingProduct ? 'Saving...' : 'Save Changes'}</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>

      <AddProductModal 
        visible={isAddingItem} 
        onClose={() => setIsAddingItem(false)} 
        onProductAdded={() => loadProducts(true)}
      />

      {/* Dropdown Menu Modal */}
      <Modal visible={showMenu} transparent={true} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
          <View style={styles.menuOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menuContainer}>
                <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); navigation.navigate('Suppliers'); }}>
                  <Ionicons name="people-outline" size={20} color={colors.textDark} style={styles.menuIcon} />
                  <Text style={styles.menuItemText}>Supplier and GRN</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); navigation.navigate('ProductAnalytics'); }}>
                  <Ionicons name="pie-chart-outline" size={20} color={colors.textDark} style={styles.menuIcon} />
                  <Text style={styles.menuItemText}>Product wise Analytics</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); setShowCategoriesModal(true); }}>
                  <Ionicons name="grid-outline" size={20} color={colors.textDark} style={styles.menuIcon} />
                  <Text style={styles.menuItemText}>Categories</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); navigation.navigate('InventoryDownloadReport'); }}>
                  <Ionicons name="download-outline" size={20} color={colors.textDark} style={styles.menuIcon} />
                  <Text style={styles.menuItemText}>Download Reports</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <CategoriesModal
        key={categoriesRefreshKey}
        visible={showCategoriesModal}
        onClose={() => setShowCategoriesModal(false)}
        onEditCategory={(cat) => {
          setSelectedCategoryForEdit(cat);
          setShowCategoriesModal(false);
        }}
        onAnalyticsPress={() => {
          setShowCategoriesModal(false);
          navigation.navigate('CategoryAnalytics');
        }}
        onSelectCategory={(catName) => setSelectedCategoryFilter(catName)}
      />
      
      {selectedCategoryForEdit && (
        <EditCategoryModal
          visible={!!selectedCategoryForEdit}
          category={selectedCategoryForEdit}
          onClose={() => setSelectedCategoryForEdit(null)}
          onSave={() => {
            setSelectedCategoryForEdit(null);
            setCategoriesRefreshKey(k => k + 1);
          }}
          onSaveSuccess={() => {
            setCategoriesRefreshKey(k => k + 1);
          }}
        />
      )}

      {/* Pickers converted to inline UI */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
  },
  searchContainer: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginRight: 16,
  },
  searchInput: {
    height: 40,
    fontSize: 16,
    color: colors.textDark,
  },
  headerActions: { flexDirection: 'row', gap: 12 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernAddButton: {
    backgroundColor: '#A855F7',
    width: 44,
    height: 44,
    borderRadius: 22,
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  darkIconButton: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  colNameHeader: { flex: 2, fontSize: 12, color: colors.textMuted },
  colPriceHeader: { flex: 1.5, fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  colQtyHeader: { flex: 1, fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  colSalesHeader: { flex: 1, fontSize: 12, color: colors.textMuted, textAlign: 'right' },
  listContainer: { padding: 16 },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  separator: { height: 8 },
  colName: { flex: 2 },
  itemName: { fontSize: 14, fontWeight: '600', color: colors.textDark },
  itemBrand: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  colPrice: { flex: 1.5, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  colQty: { flex: 1, fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  colSales: { flex: 1, fontSize: 14, color: colors.textMuted, fontWeight: '500', textAlign: 'right' },
  colStar: { width: 32, alignItems: 'flex-end', justifyContent: 'center' },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '90%',
    flexShrink: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTopSection: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  modalImageWrapper: {
    flex: 1,
    alignItems: 'center',
    marginRight: 16,
  },
  modalImagePlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#6B7280',
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalProductNumberBox: {
    marginTop: 0,
    alignItems: 'flex-start',
  },
  modalProductNumberLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  modalProductNumberValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  modalQty: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textDark,
  },
  modalQtyLabel: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '600',
    marginVertical: 6,
  },
  modalOldPrice: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalIconRow: {
    flexDirection: 'row',
    gap: 12,
  },
  purpleCircleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#A855F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalFieldsContainer: {
    gap: 18,
  },
  modalFieldGroup: {
    position: 'relative',
    paddingTop: 8,
  },
  modalFieldLabel: {
    position: 'absolute',
    top: 0,
    left: 28,
    backgroundColor: colors.surface,
    zIndex: 1,
    paddingHorizontal: 6,
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  modalInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#333',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  modalInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textDark,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  modalBtnCancel: {
    flex: 1,
    height: 54,
    backgroundColor: '#000',
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnCancelText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 16,
  },
  modalBtnSave: {
    flex: 1.25,
    height: 54,
    backgroundColor: '#A855F7',
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnSaveText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 15,
  },
  percentBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentBadgeText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menuContainer: {
    position: 'absolute',
    top: 70,
    right: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    width: 230,
    borderWidth: Platform.OS === 'android' ? 1 : 0,
    borderColor: '#E5E7EB',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textDark,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  filterChipContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: colors.surface,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A855F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterChipText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: '600',
  }
});
