import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { getCategories, createCategoryApi } from '../services/inventoryService';
import { Alert } from 'react-native';

export interface CategoryItem {
  id: string;
  name: string;
  discount?: string;
  discountType?: "percentage" | "amount";
}

interface SelectCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCategory: (category: CategoryItem) => void;
}

export default function SelectCategoryModal({ visible, onClose, onSelectCategory }: SelectCategoryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const { token } = useAuth();

  React.useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible]);

  const loadCategories = async () => {
    try {
      const data = await getCategories(token || undefined);
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const [showAddOverlay, setShowAddOverlay] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDiscount, setNewCatDiscount] = useState('');
  const [discountType, setDiscountType] = useState<"percentage" | "amount">("percentage");
  
  const { currencySymbol } = useCurrency();

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const createdCat = await createCategoryApi({
        name: newCatName,
        discount: newCatDiscount,
        discountType: discountType
      }, token || undefined);

      setCategories([createdCat, ...categories]);
      setShowAddOverlay(false);
      setNewCatName('');
      setNewCatDiscount('');
      setDiscountType("percentage");
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create category');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textMuted} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Category</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Search & Add */}
        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Category"
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddOverlay(true)}>
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* List */}
        <ScrollView style={styles.list}>
          {filteredCategories.map(cat => (
            <TouchableOpacity key={cat.id} style={styles.listItem} onPress={() => {
              onSelectCategory(cat);
              onClose();
            }}>
              <View style={styles.radioOutline}>
                {/* No inner dot since selecting immediately closes */}
              </View>
              <Text style={styles.catName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Add Category Overlay */}
        <Modal visible={showAddOverlay} transparent animationType="fade">
          <View style={styles.overlayBg}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', alignItems: 'center' }}>
              <View style={styles.addCard}>
                <TouchableOpacity style={styles.closeAddBtn} onPress={() => setShowAddOverlay(false)}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
                
                <View style={styles.inputGroup}>
                  <Ionicons name="pricetag-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.overlayInput}
                    placeholder="Category Name *"
                    placeholderTextColor={colors.textMuted}
                    value={newCatName}
                    onChangeText={setNewCatName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.overlayInput}
                    placeholder="Product Discount"
                    placeholderTextColor={colors.textMuted}
                    value={newCatDiscount}
                    onChangeText={setNewCatDiscount}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity 
                    style={styles.discountToggle} 
                    onPress={() => setDiscountType(prev => prev === "percentage" ? "amount" : "percentage")}
                  >
                    <Text style={styles.discountToggleText}>
                      {discountType === "percentage" ? "%" : currencySymbol}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.createBtn} onPress={handleCreateCategory}>
                  <Text style={styles.createBtnText}>Create Category</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  searchBox: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginRight: 15,
    height: 40,
    justifyContent: 'flex-end',
    paddingBottom: 5,
  },
  searchInput: {
    fontSize: 16,
    color: '#000',
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#A855F7',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  radioOutline: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#000',
    marginRight: 15,
  },
  catName: {
    fontSize: 16,
    color: '#333',
  },
  overlayBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  addCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  closeAddBtn: {
    alignSelf: 'flex-end',
    padding: 5,
    marginBottom: 10,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  overlayInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
  },
  discountToggle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  discountToggleText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  createBtn: {
    backgroundColor: '#A855F7',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  createBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
