import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Dimensions, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { Calendar } from 'react-native-calendars';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { updateCategoryApi } from '../services/inventoryService';

const { height, width } = Dimensions.get('window');

interface EditCategoryModalProps {
  visible: boolean;
  category: any;
  onClose: () => void;
  onSave: () => void;
  onSaveSuccess?: (updatedCat: any) => void;
}

export default function EditCategoryModal({ visible, category, onClose, onSave, onSaveSuccess }: EditCategoryModalProps) {
  const [activeTimeframe, setActiveTimeframe] = useState('Week');
  const [activeChartType, setActiveChartType] = useState('Line');
  const [categoryName, setCategoryName] = useState('');
  const [productDiscount, setProductDiscount] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedRange, setSelectedRange] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (visible && category) {
      setCategoryName(category.name || '');
      setProductDiscount(category.discount ? String(parseFloat(String(category.discount))) : '');
      setDiscountType((category.discountType as 'percentage' | 'amount') || 'percentage');
    }
  }, [visible, category]);

  const weekData = [
    { value: 0, label: '04/09' },
    { value: 0, label: '04/10' },
    { value: 0, label: '04/11' },
    { value: 1900, label: '04/12' },
    { value: 200, label: '04/13' },
    { value: 250, label: '04/14' },
    { value: 10, label: '04/15' },
  ];

  const monthData = [
    { value: 500, label: 'W1' },
    { value: 1200, label: 'W2' },
    { value: 1900, label: 'W3' },
    { value: 800, label: 'W4' },
  ];

  const chartData = activeTimeframe === 'Week' ? weekData : monthData;

  const renderChart = () => {
    // The width inside the padded modal
    const chartAreaWidth = width * 0.85 - 80;
    
    if (activeChartType === 'Line') {
      return (
        <LineChart
          data={chartData}
          color="#10B981"
          thickness={3}
          spacing={chartAreaWidth / chartData.length}
          hideRules={false}
          rulesType="dashed"
          rulesColor="#E2E8F0"
          yAxisTextStyle={{ color: '#000', fontSize: 11, fontWeight: 'bold' }}
          xAxisLabelTextStyle={{ color: '#000', fontSize: 10, fontWeight: '700' }}
          noOfSections={4}
          maxValue={2000}
          yAxisLabelTexts={['0', '500', '1K', '1.5K', '1.9K']}
          yAxisColor="transparent"
          xAxisColor="#000"
          hideDataPoints
          initialSpacing={10}
          endSpacing={10}
          curved
          isAnimated
        />
      );
    } else {
      return (
        <BarChart
          data={chartData}
          frontColor="#C084FC" // Base purple
          barWidth={20}
          spacing={(chartAreaWidth - (20 * chartData.length)) / chartData.length}
          roundedTop
          hideRules={false}
          rulesType="dashed"
          rulesColor="#E2E8F0"
          yAxisTextStyle={{ color: '#000', fontSize: 11, fontWeight: 'bold' }}
          xAxisLabelTextStyle={{ color: '#000', fontSize: 10, fontWeight: '700' }}
          noOfSections={4}
          maxValue={2000}
          yAxisLabelTexts={['0', '500', '1K', '1.5K', '1.9K']}
          yAxisColor="transparent"
          xAxisColor="#000"
          initialSpacing={15}
          isAnimated
          rotateLabel
        />
      );
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kbWrapper}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              
              <Text style={styles.title}>{categoryName}</Text>

              {/* Toggles Row */}
              <View style={styles.togglesRow}>
                {/* Timeframes */}
                <View style={styles.timeframes}>
                  <TouchableOpacity
                    style={[styles.timeframeBtn, activeTimeframe === 'Week' && styles.timeframeBtnActive]}
                    onPress={() => setActiveTimeframe('Week')}
                  >
                    <Text style={[styles.timeframeText, activeTimeframe === 'Week' && styles.timeframeTextActive]}>Week</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.timeframeBtn, activeTimeframe === 'Month' && styles.timeframeBtnActive]}
                    onPress={() => setActiveTimeframe('Month')}
                  >
                    <Text style={[styles.timeframeText, activeTimeframe === 'Month' && styles.timeframeTextActive]}>Month</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.calendarBtn} onPress={() => setShowCalendar(true)}>
                    <Ionicons name="calendar-outline" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>

                {/* Chart Types segment */}
                <View style={styles.chartTypes}>
                  <TouchableOpacity
                    style={[styles.chartTypeBtnLeft, activeChartType === 'Line' ? styles.chartTypeActive : styles.chartTypeInactive]}
                    onPress={() => setActiveChartType('Line')}
                  >
                    <Ionicons name="stats-chart-outline" size={14} color="#FFF" />
                    <Text style={styles.chartTypeText}>Line</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.chartTypeBtnRight, activeChartType === 'Bar' ? styles.chartTypeActive : styles.chartTypeInactive]}
                    onPress={() => setActiveChartType('Bar')}
                  >
                    <Ionicons name="stats-chart" size={14} color="#FFF" />
                    <Text style={styles.chartTypeText}>Bar</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Chart Area */}
              <View style={styles.chartContainer}>
                {/* Y Axis Label */}
                <View style={styles.yAxisLabelBox}>
                   <Text style={styles.yAxisLabelText}>Total Sales (LKR)</Text>
                </View>
                {renderChart()}
              </View>

              {/* Inputs */}
              <View style={styles.inputsContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Category Name *</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="pricetag-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={categoryName}
                      onChangeText={setCategoryName}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Product Discount</Text>
                  <View style={styles.inputWrap}>
                    <TextInput
                      style={styles.input}
                      value={productDiscount}
                      onChangeText={setProductDiscount}
                      keyboardType="numeric"
                      placeholder="0"
                    />
                    <TouchableOpacity
                      style={[styles.percentCircle, discountType === 'amount' && styles.amountBadge]}
                      onPress={() => setDiscountType(discountType === 'percentage' ? 'amount' : 'percentage')}
                    >
                      <Text style={[styles.percentText, discountType === 'amount' && styles.amountText]}>
                        {discountType === 'percentage' ? '%' : 'Amt'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.updateBtn, isSaving && { opacity: 0.7 }]}
                  disabled={isSaving}
                  onPress={async () => {
                    if (!categoryName.trim()) {
                      Alert.alert('Validation', 'Category name is required');
                      return;
                    }
                    try {
                      setIsSaving(true);
                      const updated = await updateCategoryApi(category.id, {
                        name: categoryName,
                        discount: productDiscount,
                        discountType: discountType,
                      }, token || undefined);
                      if (onSaveSuccess) onSaveSuccess(updated);
                      onSave();
                      onClose();
                    } catch (error: any) {
                      Alert.alert('Error', error.message || 'Failed to update category');
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                >
                  <Text style={styles.updateBtnText}>{isSaving ? 'Saving...' : 'Update'}</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </KeyboardAvoidingView>

        {/* Date Selector Modal */}
        <Modal visible={showCalendar} transparent animationType="fade">
          <View style={styles.calendarOverlay}>
             <View style={styles.calendarContainer}>
                <View style={styles.calendarHeader}>
                  <Text style={styles.calendarTitle}>Select Date Range</Text>
                  <TouchableOpacity onPress={() => setShowCalendar(false)}>
                    <Ionicons name="close" size={24} color="#000" />
                  </TouchableOpacity>
                </View>
                <Calendar
                  markingType={'period'}
                  markedDates={selectedRange}
                  onDayPress={(day: any) => {
                    setSelectedRange({
                      [day.dateString]: {selected: true, startingDay: true, color: '#A855F7', textColor: 'white'},
                    });
                  }}
                  theme={{
                    selectedDayBackgroundColor: '#A855F7',
                    todayTextColor: '#A855F7',
                    arrowColor: '#A855F7',
                  }}
                />
                <TouchableOpacity style={styles.applyBtn} onPress={() => setShowCalendar(false)}>
                  <Text style={styles.applyBtnText}>Apply Filter</Text>
                </TouchableOpacity>
             </View>
          </View>
        </Modal>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  kbWrapper: {
    width: '100%',
    maxHeight: '90%',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  togglesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  timeframes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeframeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timeframeBtnActive: {
    backgroundColor: '#A855F7',
  },
  timeframeText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500'
  },
  timeframeTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  calendarBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F43F5E',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  chartTypes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartTypeBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    gap: 4,
  },
  chartTypeBtnRight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    gap: 4,
    marginLeft: -1, // prevent gap
  },
  chartTypeActive: {
    backgroundColor: '#B794F4', // Lighter purple gradient look
  },
  chartTypeInactive: {
    backgroundColor: '#D1D5DB', // Grey
  },
  chartTypeText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600',
  },
  chartContainer: {
    paddingLeft: 30,
    position: 'relative',
    marginBottom: 40,
    marginTop: 20,
  },
  yAxisLabelBox: {
    position: 'absolute',
    left: -48,
    top: '40%',
    width: 140,
    height: 20,
    transform: [{ rotate: '-90deg'}],
    alignItems: 'center',
  },
  yAxisLabelText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000',
  },
  inputsContainer: {
    gap: 24,
  },
  inputGroup: {
    position: 'relative',
  },
  inputLabel: {
    position: 'absolute',
    top: -8,
    left: 16,
    backgroundColor: '#FFF',
    zIndex: 1,
    paddingHorizontal: 6,
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#333',
    borderRadius: 24,
    height: 54,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  percentCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  amountBadge: {
    backgroundColor: '#A855F7',
    borderColor: '#A855F7',
  },
  percentText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '700',
  },
  amountText: {
    color: '#FFF',
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 32,
    gap: 16,
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    backgroundColor: '#27272A', // Dark grey/black
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  cancelBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  updateBtn: {
    flex: 1,
    height: 52,
    backgroundColor: '#A855F7',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  updateBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  calendarContainer: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    width: '100%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
  applyBtn: {
    backgroundColor: '#A855F7',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  applyBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

