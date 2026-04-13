import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { Calendar } from 'react-native-calendars';
import { BarChart, LineChart } from 'react-native-gifted-charts';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
// Landscape chart dimensions:
const chartCanvasWidth = 400; // Length of the chart horizontally in landscape
const chartCanvasHeight = screenWidth - 120; // Height of chart inside portrait constraint

const CATEGORIES = ['Total Sales', 'Cash', 'Credit', 'Cheque'];

const DUMMY_WEEKLY_BAR = [
  { value: 1500, label: 'Mo', frontColor: '#A855F7' },
  { value: 2300, label: 'Tu', frontColor: '#E9D5FF' },
  { value: 1800, label: 'We', frontColor: '#E9D5FF' },
  { value: 3100, label: 'Th', frontColor: '#E9D5FF' },
  { value: 4200, label: 'Fr', frontColor: '#E9D5FF' },
  { value: 3900, label: 'Sa', frontColor: '#A855F7' },
  { value: 2400, label: 'Su', frontColor: '#E9D5FF' }
];

const DUMMY_WEEKLY_LINE = [
  { value: 1500, label: 'Mo' },
  { value: 2300, label: 'Tu' },
  { value: 1800, label: 'We' },
  { value: 3100, label: 'Th' },
  { value: 4200, label: 'Fr' },
  { value: 3900, label: 'Sa' },
  { value: 2400, label: 'Su' }
];

const DUMMY_MONTHLY_BAR = [
  { value: 12000, label: 'W1', frontColor: '#A855F7' },
  { value: 15000, label: 'W2', frontColor: '#E9D5FF' },
  { value: 11000, label: 'W3', frontColor: '#E9D5FF' },
  { value: 18000, label: 'W4', frontColor: '#A855F7' },
  { value: 14000, label: 'W5', frontColor: '#E9D5FF' }
];

const DUMMY_MONTHLY_LINE = [
  { value: 12000, label: 'W1' },
  { value: 15000, label: 'W2' },
  { value: 11000, label: 'W3' },
  { value: 18000, label: 'W4' },
  { value: 14000, label: 'W5' }
];

export default function SalesAnalyticsScreen() {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [activeTimeframe, setActiveTimeframe] = useState('Week');
  const [activeTab, setActiveTab] = useState('Bar Chart'); // default bar

  // Calendar State
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});
  const [selectedPoint, setSelectedPoint] = useState<{label: string, value: number} | null>(null);

  const barData = activeTimeframe === 'Month' ? DUMMY_MONTHLY_BAR : DUMMY_WEEKLY_BAR;
  const lineData = activeTimeframe === 'Month' ? DUMMY_MONTHLY_LINE : DUMMY_WEEKLY_LINE;

  // Clear selection when tabs change
  React.useEffect(() => {
    setSelectedPoint(null);
  }, [activeTimeframe, activeTab, selectedCategory]);

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sales Analytics</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Top Categories */}
      <View style={styles.categoriesContainer}>
        {CATEGORIES.map(cat => {
          const isActive = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryBtn, 
                isActive ? styles.categoryBtnActive : styles.categoryBtnInactive
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryBtnText, isActive && styles.categoryBtnTextActive]}>
                {cat.replace(' Sales', '\nSales')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {/* Active Calendar Range Header */}
      {dateRange.start && (
         <View style={styles.activeDatesRange}>
           <Text style={styles.activeDatesText}>
             Filtering: {dateRange.start} {dateRange.end ? ` - ${dateRange.end}` : ''}
           </Text>
           <TouchableOpacity onPress={() => setDateRange({})}>
             <Ionicons name="close-circle" size={16} color={colors.textMuted} />
           </TouchableOpacity>
         </View>
      )}

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Left Side Chart Area (Rotated container for Landscape chart viewing) */}
        <View style={styles.chartArea}>
          <View style={{
            width: chartCanvasWidth,
            height: chartCanvasHeight,
            justifyContent: 'center',
            alignItems: 'center',
            transform: [{ rotate: '90deg' }]
          }}>
            
            {/* Absolute HUD for Selected Value in Landscape */}
            <View style={{ height: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
              {selectedPoint && (
                <View style={{ backgroundColor: '#A855F7', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12 }}>
                   <Text style={{ color: '#FFF', fontSize: 13, fontWeight: 'bold' }}>Sales: ${selectedPoint.value}</Text>
                </View>
              )}
            </View>
            {activeTab === 'Line Chart' ? (
                <LineChart
                  data={lineData}
                  width={chartCanvasWidth - 40}
                  height={chartCanvasHeight - 40} // subtract HUD height
                  color="#A855F7"
                  thickness={3}
                  startFillColor="rgba(168, 85, 247, 0.3)"
                  endFillColor="rgba(168, 85, 247, 0.01)"
                  startOpacity={0.9}
                  endOpacity={0.2}
                  spacing={40}
                  noOfSections={4}
                  yAxisTextStyle={{ color: '#A0AEC0', fontSize: 10 }}
                  xAxisLabelTextStyle={{ color: '#A0AEC0', fontSize: 10 }}
                  isAnimated
                  focusEnabled={true}
                  showTextOnFocus={true}
                  delayBeforeUnFocus={3000}
                  onPress={(item: any) => setSelectedPoint({label: item.label, value: item.value})}
                  // Add large hit slop so touching nodes is very easy:
                  getPointerProps={() => ({})}
                  dataPointsRadius={6}
                  dataPointsColor="#A855F7"
                />
            ) : (
                <BarChart
                  data={barData}
                  frontColor="#A855F7"
                  width={chartCanvasWidth - 40}
                  height={chartCanvasHeight - 40} // subtract HUD height
                  spacing={12}
                  barWidth={20}
                  noOfSections={4}
                  yAxisTextStyle={{ color: '#A0AEC0', fontSize: 10 }}
                  xAxisLabelTextStyle={{ color: '#A0AEC0', fontSize: 10 }}
                  isAnimated
                  onPress={(item: any) => setSelectedPoint({label: item.label, value: item.value})}
                />
            )}
          </View>
        </View>

        {/* Right Vertical Action Bar */}
        <View style={styles.rightBar}>
           {/* Timeframes */}
           <View style={styles.verticalTimeframes}>
             {['Week', 'Month'].map(tf => {
               const isActive = activeTimeframe === tf;
               return (
                 <View key={tf} style={styles.timeframeBlock}>
                   <TouchableOpacity 
                     style={[styles.verticalTimeframeWrapper, isActive && styles.verticalTimeframeWrapperActive]}
                     onPress={() => setActiveTimeframe(tf)}
                     activeOpacity={0.8}
                   >
                     <Text style={[styles.verticalBtnText, isActive && styles.verticalBtnTextActive]}>
                       {tf}
                     </Text>
                   </TouchableOpacity>
                 </View>
               );
             })}
             
             <TouchableOpacity style={styles.calendarCircleIcon} onPress={() => setIsCalendarVisible(true)}>
               <Ionicons name="calendar-outline" size={16} color="#FFFFFF" style={{ transform: [{ rotate: '90deg' }] }} />
             </TouchableOpacity>
           </View>

           {/* Chart Types */}
           <View style={styles.verticalChartTypes}>
             {['Line Chart', 'Bar Chart'].map(type => {
               const isActive = activeTab === type;
               return (
                 <View key={type} style={styles.chartTypeBlock}>
                   <TouchableOpacity 
                     style={[styles.verticalTabWrapper, isActive && styles.verticalTabWrapperActive]}
                     onPress={() => setActiveTab(type)}
                     activeOpacity={0.8}
                   >
                     <Ionicons 
                       name={type === 'Line Chart' ? 'analytics' : 'bar-chart'} 
                       size={18} 
                       color={isActive ? '#FFFFFF' : '#A0AEC0'}
                       style={{ transform: [{ rotate: '-90deg' }] }}
                     />
                     <Text style={[styles.verticalTabBtnText, isActive && styles.verticalTabBtnTextActive]}>
                       {type}
                     </Text>
                   </TouchableOpacity>
                 </View>
               );
             })}
           </View>
        </View>
      </View>

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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.textDark },
  backBtn: { padding: 4 },
  
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 10,
    marginTop: 4,
  },
  categoryBtn: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBtnInactive: {
    backgroundColor: '#E2E8F0', 
  },
  categoryBtnActive: {
    backgroundColor: '#A855F7',
  },
  categoryBtnText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  categoryBtnTextActive: {
    color: '#FFFFFF',
  },

  activeDatesRange: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  activeDatesText: {
    fontSize: 12,
    color: '#A855F7',
    fontWeight: '600',
  },

  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  chartArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  rightBar: {
    width: 60,
    alignItems: 'center',
    paddingRight: 12,
    paddingTop: 8,
  },
  
  verticalTimeframes: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  timeframeBlock: {
    width: 32,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalTimeframeWrapper: {
    width: 70,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '90deg' }],
  },
  verticalTimeframeWrapperActive: {
    backgroundColor: '#A855F7',
  },
  verticalBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A5568',
  },
  verticalBtnTextActive: {
    color: '#FFFFFF',
  },
  calendarCircleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F43F5E',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },

  verticalChartTypes: {
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  chartTypeBlock: {
    width: 44,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalTabWrapper: {
    width: 140,
    height: 44,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    transform: [{ rotate: '90deg' }],
  },
  verticalTabWrapperActive: {
    backgroundColor: '#A855F7',
  },
  verticalTabBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A0AEC0',
  },
  verticalTabBtnTextActive: {
    color: '#FFFFFF',
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
