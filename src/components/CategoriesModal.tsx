import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Dimensions, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { getCategories, deleteCategoryApi } from '../services/inventoryService';

const { width } = Dimensions.get('window');

interface Category {
  id: string;
  name: string;
  discount?: string | number | null;
  discountType?: string | null;
}

interface CategoriesModalProps {
  visible: boolean;
  onClose: () => void;
  onEditCategory: (cat: Category) => void;
  onAnalyticsPress: () => void;
  onSelectCategory: (categoryName: string) => void;
}

export default function CategoriesModal({ visible, onClose, onEditCategory, onAnalyticsPress, onSelectCategory }: CategoriesModalProps) {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories(token || undefined);
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (cat: Category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${cat.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategoryApi(cat.id, token || undefined);
              setCategories(prev => prev.filter(c => c.id !== cat.id));
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete category');
            }
          }
        }
      ]
    );
  };

  const handleEditDone = (updatedCat: Category) => {
    setCategories(prev => prev.map(c => c.id === updatedCat.id ? updatedCat : c));
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const getDiscountLabel = (cat: Category) => {
    if (!cat.discount) return null;
    const val = parseFloat(String(cat.discount));
    if (!val) return null;
    return cat.discountType === 'percentage' ? `${val}%` : `${val}`;
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <TouchableOpacity style={styles.closeHandleHorizontal} onPress={onClose} activeOpacity={1} />
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Categories</Text>
              <TouchableOpacity style={styles.analyticsButton} onPress={onAnalyticsPress}>
                <Ionicons name="stats-chart" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#000" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search categories..."
                placeholderTextColor="#9ca3af"
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={18} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>

            {/* List */}
            {loading ? (
              <View style={styles.emptyBox}>
                <ActivityIndicator color="#A855F7" size="small" />
              </View>
            ) : (
              <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
                {filteredCategories.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Ionicons name="pricetag-outline" size={36} color="#d1d5db" />
                    <Text style={styles.emptyText}>
                      {search ? 'No matching categories' : 'No categories yet'}
                    </Text>
                  </View>
                ) : (
                  filteredCategories.map((cat) => (
                    <View key={cat.id} style={styles.listItem}>
                      <View style={styles.leftSection}>
                        <View style={[styles.discountCircle, !getDiscountLabel(cat) && styles.discountCircleEmpty]}>
                          <Text style={[styles.discountText, !getDiscountLabel(cat) && styles.discountTextEmpty]}>
                            {getDiscountLabel(cat) || '%'}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
                          {getDiscountLabel(cat) && (
                            <Text style={styles.discountSubText}>
                              {cat.discountType === 'percentage' ? 'Percentage' : 'Amount'} discount
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.actionsBox}>
                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() => { onSelectCategory(cat.name); onClose(); }}
                        >
                          <Ionicons name="square-outline" size={22} color="#000" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() => { onEditCategory(cat); }}
                        >
                          <Ionicons name="pencil" size={18} color="#A855F7" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() => handleDelete(cat)}
                        >
                          <Ionicons name="trash" size={18} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  keyboardView: {
    flex: 1,
    flexDirection: 'row',
  },
  closeHandleHorizontal: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFF',
    width: width * 0.7,
    height: '100%',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  analyticsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#A855F7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 30,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  listContainer: {
    flex: 1,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  discountCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#A855F7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#faf5ff',
  },
  discountCircleEmpty: {
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  discountText: {
    color: '#A855F7',
    fontSize: 11,
    fontWeight: '700',
  },
  discountTextEmpty: {
    color: '#9ca3af',
  },
  categoryName: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
    flexShrink: 1,
  },
  discountSubText: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 1,
  },
  actionsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtn: {
    padding: 4,
  },
});
