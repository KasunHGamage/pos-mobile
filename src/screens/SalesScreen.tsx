import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';

const TIMEFRAMES = ['Today', 'This Week', 'This Month'];
const CATEGORIES = ['Total Sales', 'Cash Sales', 'Credit Sales', 'Cheque Sales'];

// Dummy Invoice Data
const DUMMY_INVOICES = [
  { id: '#INV-001', date: '2026-04-12', category: 'Cash Sales', sales: 1500, costs: 1000, profit: 500 },
  { id: '#INV-002', date: '2026-04-12', category: 'Credit Sales', sales: 2500, costs: 1800, profit: 700 },
  { id: '#INV-003', date: '2026-04-11', category: 'Total Sales', sales: 800, costs: 600, profit: 200 },
  { id: '#INV-004', date: '2026-04-10', category: 'Cheque Sales', sales: 5000, costs: 3500, profit: 1500 },
  { id: '#INV-005', date: '2026-04-12', category: 'Total Sales', sales: 4000, costs: 2500, profit: 1500 },
];

export default function SalesScreen() {
  const [activeFrame, setActiveFrame] = useState('This Week');
  const [selectedCategory, setSelectedCategory] = useState('Total Sales');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Filtering Invoices
  const filteredInvoices = useMemo(() => {
    let filtered = DUMMY_INVOICES;

    if (selectedCategory !== 'Total Sales') {
      filtered = filtered.filter(inv => inv.category === selectedCategory);
    }

    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(inv => inv.date >= dateRange.start! && inv.date <= dateRange.end!);
    } else if (dateRange.start) {
      filtered = filtered.filter(inv => inv.date === dateRange.start!);
    }
    
    return filtered;
  }, [selectedCategory, dateRange, activeFrame]);

  // Aggregate Stats
  const stats = useMemo(() => {
    return filteredInvoices.reduce(
      (acc, inv) => {
        acc.sales += inv.sales;
        acc.costs += inv.costs;
        acc.profit += inv.profit;
        return acc;
      },
      { sales: 0, costs: 0, profit: 0 }
    );
  }, [filteredInvoices]);

  const onDayPress = (day: any) => {
    if (!dateRange.start || (dateRange.start && dateRange.end)) {
      setDateRange({ start: day.dateString, end: undefined });
    } else {
      let start = dateRange.start;
      let end = day.dateString;
      if (end < start) {
        end = start;
        start = day.dateString;
      }
      setDateRange({ start, end });
    }
  };

  const markedDates: any = {};
  if (dateRange.start) {
    markedDates[dateRange.start] = { startingDay: true, color: '#A855F7', textColor: 'white' };
    if (dateRange.end) {
      markedDates[dateRange.end] = { endingDay: true, color: '#A855F7', textColor: 'white' };
      let curr = new Date(dateRange.start);
      curr.setDate(curr.getDate() + 1);
      let endD = new Date(dateRange.end);
      while (curr < endD) {
        const dateStr = curr.toISOString().split('T')[0];
        markedDates[dateStr] = { color: '#E9D5FF', textColor: '#A855F7' };
        curr.setDate(curr.getDate() + 1);
      }
    } else {
      markedDates[dateRange.start] = { selected: true, color: '#A855F7', textColor: 'white' };
    }
  }

  const getDisplayDateRange = () => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    if (dateRange.start) {
      const from = new Date(dateRange.start);
      const to = dateRange.end ? new Date(dateRange.end) : from;
      return { from: formatDate(from), to: formatDate(to) };
    }

    const today = new Date();
    if (activeFrame === 'Today') {
      return { from: formatDate(today), to: formatDate(today) };
    } else if (activeFrame === 'This Week') {
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 7);
      return { from: formatDate(lastWeek), to: formatDate(today) };
    } else { // This Month
      const lastMonth = new Date(today);
      lastMonth.setMonth(today.getMonth() - 1);
      return { from: formatDate(lastMonth), to: formatDate(today) };
    }
  };
  
  const displayDates = getDisplayDateRange();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundWrapper}>
        <LinearGradient
          colors={colors.gradients.primary}
          style={styles.gradientBackground}
        />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header & Sub-links */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sales Overview</Text>
          <View style={styles.headerRightActions}>
            <View style={styles.timeframeContainerTextOnly}>
              {TIMEFRAMES.map((frame) => {
                const isActive = activeFrame === frame;
                return (
                  <TouchableOpacity 
                    key={frame} 
                    onPress={() => {
                        setActiveFrame(frame);
                        setDateRange({});
                    }}
                  >
                    <Text style={[styles.timeframeTextRaw, isActive && styles.timeframeTextRawActive]}>
                      {frame.replace('This ', '')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Top Horizontal Filter Row (Screenshot Layout) */}
        <View style={styles.filterRow}>
          
          <View style={styles.dateLabelContainer}>
             <Text style={styles.dateLabelStatic}>From</Text>
             <Text style={styles.dateValueText}>{displayDates.from}</Text>
             <Text style={styles.dateLabelStatic}>To</Text>
             <Text style={styles.dateValueText}>{displayDates.to}</Text>
          </View>

          <TouchableOpacity 
            style={styles.actionCircleBtnPrimary}
            onPress={() => setIsCalendarVisible(true)}
          >
            <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
            {(dateRange.start) && <View style={styles.activeFilterDot} />}
          </TouchableOpacity>
          
          <View style={styles.dropdownContainer}>
            <TouchableOpacity 
              style={styles.dropdownButton} 
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              activeOpacity={0.8}
            >
              <Text style={styles.dropdownButtonText} numberOfLines={1}>{selectedCategory}</Text>
              <Ionicons name={isDropdownOpen ? "chevron-up" : "chevron-down"} size={16} color="#FFFFFF" />
            </TouchableOpacity>
            {isDropdownOpen && (
               <View style={styles.dropdownList}>
                 {CATEGORIES.map((cat, index) => (
                   <TouchableOpacity 
                     key={cat} 
                     style={[styles.dropdownItem, index !== CATEGORIES.length - 1 && styles.dropdownItemBorder]}
                     onPress={() => {
                       setSelectedCategory(cat);
                       setIsDropdownOpen(false);
                     }}
                   >
                     <Text style={[styles.dropdownItemText, selectedCategory === cat && styles.dropdownItemTextActive]}>{cat}</Text>
                   </TouchableOpacity>
                 ))}
               </View>
            )}
          </View>

          <View style={styles.analyticsIconGroup}>
            <TouchableOpacity 
              style={styles.actionCircleBtnWhite}
              onPress={() => navigation.navigate('SalesAnalytics')}
            >
               <Ionicons name="bar-chart" size={18} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCircleBtnWhite}
              onPress={() => navigation.navigate('DownloadReport')}
            >
               <Ionicons name="download-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>

        </View>

        {/* Invoices List Card */}
        <View style={styles.invoiceCard}>
          <Text style={styles.chartTitle}>{selectedCategory} - Invoices</Text>
          
          <View style={styles.summaryRow}>
             <View style={styles.summaryItem}>
               <Text style={styles.summarySubLabel}>Total Sales</Text>
               <Text style={styles.summarySubValue}>{stats.sales.toFixed(2)}</Text>
             </View>
             <View style={styles.summaryItem}>
               <Text style={styles.summarySubLabel}>Total Costs</Text>
               <Text style={styles.summarySubValue}>{stats.costs.toFixed(2)}</Text>
             </View>
             <View style={styles.summaryItem}>
               <Text style={styles.summarySubLabel}>Total Profit</Text>
               <Text style={styles.summarySubValue}>{stats.profit.toFixed(2)}</Text>
             </View>
          </View>

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>ID</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'center' }]}>Total Sales</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'center' }]}>Item Costs</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'right' }]}>Profits</Text>
          </View>
          
          <View style={styles.tableDivider} />

          {filteredInvoices.length > 0 ? (
            filteredInvoices.map((inv, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={styles.tableRow}
                activeOpacity={0.7}
                onPress={() => {
                  navigation.navigate('Receipt', {
                    total: inv.sales,
                    subTotal: inv.sales,
                    itemDiscountTotal: 0,
                    invoiceDiscountAmt: 0,
                    invoiceLabel: inv.id,
                    items: [
                      {
                        id: 'mock1',
                        name: 'General Item',
                        originalPrice: inv.sales,
                        price: inv.sales,
                        qty: 1,
                        unit: 'Pcs',
                        discountMode: 'percent',
                        discountValue: 0,
                        itemDiscountLKR: 0
                      }
                    ],
                    paymentMethod: inv.category.includes('Credit') ? 'Credit' : inv.category.includes('Cheque') ? 'Cheque' : 'Cash',
                    paidAmount: inv.category.includes('Credit') ? 0 : inv.sales,
                  });
                }}
              >
                <Text style={[styles.tableCellText, { flex: 1 }]}>{inv.id}</Text>
                <Text style={[styles.tableCellText, { flex: 1.5, textAlign: 'center' }]}>{inv.sales.toFixed(2)}</Text>
                <Text style={[styles.tableCellText, { flex: 1.5, textAlign: 'center' }]}>{inv.costs.toFixed(2)}</Text>
                <Text style={[styles.tableCellText, { flex: 1.5, textAlign: 'right', fontWeight: 'bold' }]}>{inv.profit.toFixed(2)}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No invoices found for the related date!</Text>
            </View>
          )}

        </View>

      </ScrollView>

      {/* Calendar Modal */}
      <Modal visible={isCalendarVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date Range</Text>
              <TouchableOpacity onPress={() => setIsCalendarVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textDark} />
              </TouchableOpacity>
            </View>
            <Calendar
              markingType={'period'}
              markedDates={markedDates}
              onDayPress={onDayPress}
              theme={{
                todayTextColor: '#A855F7',
                arrowColor: '#A855F7',
              }}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.clearBtn} onPress={() => setDateRange({})}>
                <Text style={styles.clearBtnText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={() => setIsCalendarVisible(false)}>
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  backgroundWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 380,
    overflow: 'hidden',
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  gradientBackground: {
    flex: 1,
  },
  scrollContent: { padding: 20, paddingBottom: 40 },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  timeframeContainerTextOnly: {
    flexDirection: 'row',
    gap: 12,
  },
  timeframeTextRaw: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  timeframeTextRawActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
    zIndex: 10,
  },
  dateLabelContainer: {
    marginRight: 8,
  },
  dateLabelStatic: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  dateValueText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionCircleBtnPrimary: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  actionCircleBtnWhite: {
    width: 36,
    height: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyticsIconGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  activeFilterDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  dropdownContainer: {
    flex: 1,
    marginRight: 8,
    zIndex: 10,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 36,
  },
  dropdownButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  dropdownList: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dropdownItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemText: {
    fontSize: 15,
    color: colors.textDark,
  },
  dropdownItemTextActive: {
    color: '#A855F7',
    fontWeight: 'bold',
  },

  invoiceCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
    minHeight: 300,
  },
  chartTitle: { fontSize: 18, fontWeight: '700', color: colors.textDark, marginBottom: 20 },
  
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summarySubLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
  },
  summarySubValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textDark,
  },

  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tableDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  tableCellText: {
    fontSize: 13,
    color: colors.textDark,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateText: {
    color: colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textDark },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 12,
  },
  clearBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  clearBtnText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  applyBtn: {
    backgroundColor: '#A855F7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  applyBtnText: {
    color: 'white',
    fontWeight: '600',
  },
});
