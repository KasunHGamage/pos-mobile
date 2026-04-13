import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar } from 'react-native-calendars';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { colors } from '../theme/colors';

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = ['Total Sales', 'Cash Sales', 'Credit Sales', 'Cheque Sales'];

// ─── Dummy Invoice Data ───────────────────────────────────────────────────────

interface Invoice {
  invoiceNumber: string;
  paymentOption: string;
  createdDate: string;
  updatedDate: string;
  createdBy: string;
  invoiceStatus: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  total: number;
  subTotal: number;
  invoicePaidAmount: number;
  paidAmount: number;
  qrPaymentAmount: number;
  cardPaymentAmount: number;
  codAmount: number;
  bankTransferAmount: number;
  itemCosts: number;
  balance: number;
  profits: number;
  chequeAmount: number;
  outstandingAmount: number;
  discount: number;
  chequeNo: string;
  shortNotes: string;
  bankName: string;
  waybillNumber: string;
  serviceCharge: number;
  digitalPaymentCharge: number;
  taxCharge: number;
  deliveryCharge: number;
  invoiceURL: string;
  totalSales: number;
  totalProfits: number;
  totalServiceCharge: number;
  totalExpenses: number;
  category: string;
}

const DUMMY_INVOICES: Invoice[] = [
  {
    invoiceNumber: 'INV-2026-001', paymentOption: 'Cash',
    createdDate: '2026-04-01', updatedDate: '2026-04-01', createdBy: 'Admin', invoiceStatus: 'Paid',
    customerName: 'Rajesh Kumar', customerPhone: '+94771234567', customerAddress: '12 Galle Rd, Colombo',
    total: 15500, subTotal: 14000, invoicePaidAmount: 15500, paidAmount: 15500,
    qrPaymentAmount: 0, cardPaymentAmount: 0, codAmount: 0, bankTransferAmount: 0,
    itemCosts: 9500, balance: 0, profits: 4500, chequeAmount: 0, outstandingAmount: 0,
    discount: 1500, chequeNo: '', shortNotes: 'Urgent delivery', bankName: '', waybillNumber: 'WB-001',
    serviceCharge: 500, digitalPaymentCharge: 0, taxCharge: 500, deliveryCharge: 500,
    invoiceURL: 'https://pos.app/inv/001',
    totalSales: 15500, totalProfits: 4500, totalServiceCharge: 500, totalExpenses: 500,
    category: 'Cash Sales',
  },
  {
    invoiceNumber: 'INV-2026-002', paymentOption: 'Credit Card',
    createdDate: '2026-04-03', updatedDate: '2026-04-03', createdBy: 'Cashier1', invoiceStatus: 'Paid',
    customerName: 'Priya Sharma', customerPhone: '+94779876543', customerAddress: '45 Kandy Rd, Peradeniya',
    total: 32000, subTotal: 30000, invoicePaidAmount: 32000, paidAmount: 32000,
    qrPaymentAmount: 0, cardPaymentAmount: 32000, codAmount: 0, bankTransferAmount: 0,
    itemCosts: 20000, balance: 0, profits: 10000, chequeAmount: 0, outstandingAmount: 0,
    discount: 2000, chequeNo: '', shortNotes: '', bankName: '', waybillNumber: '',
    serviceCharge: 1000, digitalPaymentCharge: 320, taxCharge: 680, deliveryCharge: 0,
    invoiceURL: 'https://pos.app/inv/002',
    totalSales: 32000, totalProfits: 10000, totalServiceCharge: 1000, totalExpenses: 320,
    category: 'Credit Sales',
  },
  {
    invoiceNumber: 'INV-2026-003', paymentOption: 'Cheque',
    createdDate: '2026-04-05', updatedDate: '2026-04-06', createdBy: 'Admin', invoiceStatus: 'Pending',
    customerName: 'Lanka Traders Ltd', customerPhone: '+94112223344', customerAddress: '88 Union Place, Colombo 2',
    total: 78500, subTotal: 75000, invoicePaidAmount: 50000, paidAmount: 50000,
    qrPaymentAmount: 0, cardPaymentAmount: 0, codAmount: 0, bankTransferAmount: 0,
    itemCosts: 52000, balance: 28500, profits: 21000, chequeAmount: 50000, outstandingAmount: 28500,
    discount: 3500, chequeNo: 'CHQ-00234', shortNotes: 'Partial payment - balance on 20 Apr', bankName: 'Commercial Bank', waybillNumber: 'WB-003',
    serviceCharge: 1500, digitalPaymentCharge: 0, taxCharge: 2000, deliveryCharge: 1000,
    invoiceURL: 'https://pos.app/inv/003',
    totalSales: 78500, totalProfits: 21000, totalServiceCharge: 1500, totalExpenses: 3000,
    category: 'Cheque Sales',
  },
  {
    invoiceNumber: 'INV-2026-004', paymentOption: 'QR',
    createdDate: '2026-04-07', updatedDate: '2026-04-07', createdBy: 'Cashier2', invoiceStatus: 'Paid',
    customerName: 'Nimali Perera', customerPhone: '+94765554433', customerAddress: '5 Temple St, Nugegoda',
    total: 8900, subTotal: 8500, invoicePaidAmount: 8900, paidAmount: 8900,
    qrPaymentAmount: 8900, cardPaymentAmount: 0, codAmount: 0, bankTransferAmount: 0,
    itemCosts: 5500, balance: 0, profits: 3000, chequeAmount: 0, outstandingAmount: 0,
    discount: 400, chequeNo: '', shortNotes: '', bankName: '', waybillNumber: '',
    serviceCharge: 250, digitalPaymentCharge: 89, taxCharge: 161, deliveryCharge: 0,
    invoiceURL: 'https://pos.app/inv/004',
    totalSales: 8900, totalProfits: 3000, totalServiceCharge: 250, totalExpenses: 89,
    category: 'Cash Sales',
  },
  {
    invoiceNumber: 'INV-2026-005', paymentOption: 'Bank Transfer',
    createdDate: '2026-04-09', updatedDate: '2026-04-09', createdBy: 'Admin', invoiceStatus: 'Paid',
    customerName: 'Suneth Electronics', customerPhone: '+94112334455', customerAddress: '200 Main St, Kandy',
    total: 145000, subTotal: 138000, invoicePaidAmount: 145000, paidAmount: 145000,
    qrPaymentAmount: 0, cardPaymentAmount: 0, codAmount: 0, bankTransferAmount: 145000,
    itemCosts: 95000, balance: 0, profits: 43000, chequeAmount: 0, outstandingAmount: 0,
    discount: 7000, chequeNo: '', shortNotes: 'Bulk order discount applied', bankName: 'Peoples Bank', waybillNumber: 'WB-005',
    serviceCharge: 3000, digitalPaymentCharge: 0, taxCharge: 4000, deliveryCharge: 0,
    invoiceURL: 'https://pos.app/inv/005',
    totalSales: 145000, totalProfits: 43000, totalServiceCharge: 3000, totalExpenses: 4000,
    category: 'Credit Sales',
  },
  {
    invoiceNumber: 'INV-2026-006', paymentOption: 'COD',
    createdDate: '2026-04-10', updatedDate: '2026-04-10', createdBy: 'Cashier1', invoiceStatus: 'Paid',
    customerName: 'Hasith Fernando', customerPhone: '+94701122334', customerAddress: '33 Beach Rd, Galle',
    total: 5600, subTotal: 5400, invoicePaidAmount: 5600, paidAmount: 5600,
    qrPaymentAmount: 0, cardPaymentAmount: 0, codAmount: 5600, bankTransferAmount: 0,
    itemCosts: 3200, balance: 0, profits: 2200, chequeAmount: 0, outstandingAmount: 0,
    discount: 200, chequeNo: '', shortNotes: 'Home delivery', bankName: '', waybillNumber: 'WB-006',
    serviceCharge: 150, digitalPaymentCharge: 0, taxCharge: 50, deliveryCharge: 600,
    invoiceURL: 'https://pos.app/inv/006',
    totalSales: 5600, totalProfits: 2200, totalServiceCharge: 150, totalExpenses: 600,
    category: 'Cash Sales',
  },
];

// ─── Section Definitions ─────────────────────────────────────────────────────

type SettingRow = { key: keyof Invoice; label: string; default: boolean };

const SECTIONS: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  settings: SettingRow[];
}[] = [
  {
    title: 'Invoice Details',
    icon: 'document-text-outline',
    settings: [
      { key: 'invoiceNumber', label: 'Invoice Number', default: true },
      { key: 'paymentOption', label: 'Payment Option', default: true },
      { key: 'createdDate',   label: 'Created Date',   default: true },
      { key: 'updatedDate',   label: 'Updated Date',   default: false },
      { key: 'createdBy',     label: 'Created By',     default: false },
      { key: 'invoiceStatus', label: 'Invoice Status', default: true },
    ],
  },
  {
    title: 'Customer Info',
    icon: 'person-outline',
    settings: [
      { key: 'customerName',    label: 'Customer Name',         default: true },
      { key: 'customerPhone',   label: 'Customer Phone Number', default: false },
      { key: 'customerAddress', label: 'Customer Address',      default: false },
    ],
  },
  {
    title: 'Payment Amounts',
    icon: 'cash-outline',
    settings: [
      { key: 'total',              label: 'Total',                default: true },
      { key: 'subTotal',           label: 'Sub Total',            default: true },
      { key: 'invoicePaidAmount',  label: 'Invoice Paid Amount',  default: false },
      { key: 'paidAmount',         label: 'Paid Amount',          default: true },
      { key: 'qrPaymentAmount',    label: 'QR Payment Amount',    default: false },
      { key: 'cardPaymentAmount',  label: 'Card Payment Amount',  default: false },
      { key: 'codAmount',          label: 'COD Amount',           default: false },
      { key: 'bankTransferAmount', label: 'Bank Transfer Amount', default: false },
    ],
  },
  {
    title: 'Profit & Costs',
    icon: 'trending-up-outline',
    settings: [
      { key: 'itemCosts',         label: 'Item Costs',        default: false },
      { key: 'balance',           label: 'Balance',           default: false },
      { key: 'profits',           label: 'Profits',           default: true },
      { key: 'chequeAmount',      label: 'Cheque Amount',     default: false },
      { key: 'outstandingAmount', label: 'Outstanding Amount',default: false },
    ],
  },
  {
    title: 'Discounts',
    icon: 'pricetag-outline',
    settings: [{ key: 'discount', label: 'Discount', default: false }],
  },
  {
    title: 'Extra Details',
    icon: 'clipboard-outline',
    settings: [
      { key: 'chequeNo',      label: 'Cheque No',      default: false },
      { key: 'shortNotes',    label: 'Short Notes',    default: false },
      { key: 'bankName',      label: 'Bank Name',      default: false },
      { key: 'waybillNumber', label: 'Waybill Number', default: false },
    ],
  },
  {
    title: 'Charges',
    icon: 'receipt-outline',
    settings: [
      { key: 'serviceCharge',        label: 'Service Charge',         default: false },
      { key: 'digitalPaymentCharge', label: 'Digital Payment Charge', default: false },
      { key: 'taxCharge',            label: 'Tax Charge',             default: false },
      { key: 'deliveryCharge',       label: 'Delivery Charge',        default: false },
    ],
  },
  {
    title: 'Invoice Link',
    icon: 'link-outline',
    settings: [{ key: 'invoiceURL', label: 'Invoice URL', default: false }],
  },
  {
    title: 'Summary Totals',
    icon: 'bar-chart-outline',
    settings: [
      { key: 'totalSales',         label: 'Total Sales',          default: false },
      { key: 'totalProfits',       label: 'Total Profits',        default: false },
      { key: 'totalServiceCharge', label: 'Total Service Charge', default: false },
      { key: 'totalExpenses',      label: 'Total Expenses',       default: false },
    ],
  },
];

// Collect all setting keys in order
const ALL_KEYS: (keyof Invoice)[] = SECTIONS.flatMap(s => s.settings.map(r => r.key));
const LABEL_MAP: Record<string, string> = Object.fromEntries(
  SECTIONS.flatMap(s => s.settings.map(r => [r.key, r.label]))
);

function buildInitialState(): Record<string, boolean> {
  const state: Record<string, boolean> = {};
  SECTIONS.forEach(sec => sec.settings.forEach(s => { state[s.key] = s.default; }));
  return state;
}

// ─── Export Helpers ───────────────────────────────────────────────────────────

function filterInvoicesByCategory(category: string): Invoice[] {
  if (category === 'Total Sales') return DUMMY_INVOICES;
  return DUMMY_INVOICES.filter(inv => inv.category === category);
}

function buildCSV(invoices: Invoice[], enabledKeys: (keyof Invoice)[]): string {
  const headers = enabledKeys.map(k => LABEL_MAP[k] ?? k).join(',');
  const rows = invoices.map(inv =>
    enabledKeys.map(k => {
      const val = inv[k];
      const str = String(val ?? '');
      return str.includes(',') ? `"${str}"` : str;
    }).join(',')
  );
  return [headers, ...rows].join('\n');
}

function buildHTML(
  invoices: Invoice[],
  enabledKeys: (keyof Invoice)[],
  category: string,
  dateFrom: string,
  dateTo: string,
): string {
  const headers = enabledKeys.map(k => `<th>${LABEL_MAP[k] ?? k}</th>`).join('');
  const rows = invoices.map(inv => {
    const cells = enabledKeys.map(k => {
      const val = inv[k];
      return `<td>${val ?? ''}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: Arial, sans-serif; padding: 24px; color: #1E293B; }
      .header { background: linear-gradient(135deg,#4F46E5,#818CF8); color: white;
        padding: 20px 24px; border-radius: 12px; margin-bottom: 24px; }
      .header h1 { font-size: 22px; font-weight: 800; }
      .header p  { font-size: 13px; opacity: 0.85; margin-top: 4px; }
      .meta { display: flex; gap: 32px; margin-bottom: 20px; padding: 12px 16px;
        background: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0; }
      .meta .item { font-size: 13px; }
      .meta .item span { font-weight: 700; color: #4F46E5; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      thead th { background: #4F46E5; color: white; padding: 10px 12px;
        text-align: left; white-space: nowrap; }
      tbody tr:nth-child(even) { background: #F8FAFC; }
      tbody tr:hover { background: #EEF2FF; }
      tbody td { padding: 9px 12px; border-bottom: 1px solid #E2E8F0; }
      .footer { margin-top: 20px; text-align: center; font-size: 11px; color: #94A3B8; }
      .badge { display: inline-block; padding: 2px 8px; border-radius: 99px;
        font-size: 11px; font-weight: 700; }
      .paid   { background: #D1FAE5; color: #065F46; }
      .pending{ background: #FEF3C7; color: #92400E; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Sales Report — ${category}</h1>
      <p>Generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    </div>
    <div class="meta">
      <div class="item">Period: <span>${dateFrom} – ${dateTo}</span></div>
      <div class="item">Total Invoices: <span>${invoices.length}</span></div>
      <div class="item">Columns: <span>${enabledKeys.length}</span></div>
    </div>
    <table>
      <thead><tr>${headers}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="footer">POS App • Auto-generated report • ${new Date().toISOString()}</div>
  </body>
  </html>
  `;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DownloadReportScreen() {
  const navigation = useNavigation();

  const [toggles, setToggles]               = useState<Record<string, boolean>>(buildInitialState());
  const [selectedCategory, setSelectedCategory] = useState('Total Sales');
  const [isDropdownOpen, setIsDropdownOpen]  = useState(false);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [dateRange, setDateRange]            = useState<{ start?: string; end?: string }>({});
  const [isLoadingCSV, setIsLoadingCSV]      = useState(false);
  const [isLoadingPDF, setIsLoadingPDF]      = useState(false);

  const toggle = (key: string) => setToggles(prev => ({ ...prev, [key]: !prev[key] }));

  // ── Calendar ──────────────────────────────────────────────────────────────
  const onDayPress = (day: any) => {
    if (!dateRange.start || (dateRange.start && dateRange.end)) {
      setDateRange({ start: day.dateString, end: undefined });
    } else {
      let start = dateRange.start;
      let end = day.dateString;
      if (end < start) { [start, end] = [end, start]; }
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
      const endD = new Date(dateRange.end);
      while (curr < endD) {
        const ds = curr.toISOString().split('T')[0];
        markedDates[ds] = { color: '#E9D5FF', textColor: '#A855F7' };
        curr.setDate(curr.getDate() + 1);
      }
    } else {
      markedDates[dateRange.start] = { selected: true, color: '#A855F7', textColor: 'white' };
    }
  }

  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const getDates = () => {
    if (dateRange.start) {
      const from = new Date(dateRange.start);
      const to   = dateRange.end ? new Date(dateRange.end) : from;
      return { from: fmt(from), to: fmt(to) };
    }
    const today = new Date();
    const last  = new Date(today); last.setMonth(today.getMonth() - 1);
    return { from: fmt(last), to: fmt(today) };
  };
  const dates = getDates();

  // ── Enabled fields ────────────────────────────────────────────────────────
  const enabledKeys = ALL_KEYS.filter(k => toggles[k]);

  // ── Export ────────────────────────────────────────────────────────────────
  const filteredInvoices = filterInvoicesByCategory(selectedCategory);

  const handleCSV = async () => {
    if (enabledKeys.length === 0) {
      Alert.alert('No Columns', 'Please enable at least one column to export.'); return;
    }
    setIsLoadingCSV(true);
    try {
      const csv  = buildCSV(filteredInvoices, enabledKeys);
      const path = FileSystem.documentDirectory + `sales_report_${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Share CSV Report' });
      } else {
        Alert.alert('Saved', `CSV saved to:\n${path}`);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to generate CSV');
    } finally {
      setIsLoadingCSV(false);
    }
  };

  const handlePDF = async () => {
    if (enabledKeys.length === 0) {
      Alert.alert('No Columns', 'Please enable at least one column to export.'); return;
    }
    setIsLoadingPDF(true);
    try {
      const html = buildHTML(filteredInvoices, enabledKeys, selectedCategory, dates.from, dates.to);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      const dest = FileSystem.documentDirectory + `sales_report_${Date.now()}.pdf`;
      await FileSystem.moveAsync({ from: uri, to: dest });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(dest, { mimeType: 'application/pdf', dialogTitle: 'Share PDF Report' });
      } else {
        Alert.alert('Saved', `PDF saved to:\n${dest}`);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to generate PDF');
    } finally {
      setIsLoadingPDF(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>

      {/* ── Gradient Header ─────────────────────────────────────────── */}
      <View style={styles.gradientStrip}>
        <LinearGradient colors={colors.gradients.primary} style={StyleSheet.absoluteFill} />

        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Download Report</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Filter bar */}
        <View style={styles.filterBar}>
          {/* Category dropdown */}
          <View style={styles.dropdownWrap}>
            <TouchableOpacity
              style={styles.dropdownBtn}
              onPress={() => setIsDropdownOpen(o => !o)}
              activeOpacity={0.85}
            >
              <Text style={styles.dropdownBtnText} numberOfLines={1}>{selectedCategory}</Text>
              <Ionicons name={isDropdownOpen ? 'chevron-up' : 'chevron-down'} size={15} color="#fff" />
            </TouchableOpacity>
            {isDropdownOpen && (
              <View style={styles.dropdownList}>
                {CATEGORIES.map((cat, i) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.dropdownItem, i < CATEGORIES.length - 1 && styles.dropdownItemBorder]}
                    onPress={() => { setSelectedCategory(cat); setIsDropdownOpen(false); }}
                  >
                    <Text style={[styles.dropdownItemText, selectedCategory === cat && styles.dropdownItemActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Date display */}
          <View style={styles.dateDisplay}>
            <Text style={styles.dateText}>{dates.from}</Text>
            <Text style={styles.dateSep}>–</Text>
            <Text style={styles.dateText}>{dates.to}</Text>
          </View>

          {/* Calendar button */}
          <TouchableOpacity style={styles.calBtn} onPress={() => setIsCalendarVisible(true)}>
            <Ionicons name="calendar" size={18} color="#A855F7" />
            {dateRange.start && <View style={styles.calDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Summary strip ───────────────────────────────────────────── */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryPill}>
          <Ionicons name="receipt-outline" size={13} color="#A855F7" />
          <Text style={styles.summaryPillText}>{filteredInvoices.length} Invoices</Text>
        </View>
        <View style={styles.summaryPill}>
          <Ionicons name="list-outline" size={13} color="#A855F7" />
          <Text style={styles.summaryPillText}>{enabledKeys.length} Columns</Text>
        </View>
        <View style={styles.summaryPill}>
          <Ionicons name="cash-outline" size={13} color="#10B981" />
          <Text style={[styles.summaryPillText, { color: '#065F46' }]}>
            Rs. {filteredInvoices.reduce((s, i) => s + i.total, 0).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* ── Section Toggles ─────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map(section => (
          <View key={section.title} style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name={section.icon} size={15} color="#A855F7" style={{ marginRight: 7 }} />
              <Text style={styles.cardHeaderText}>{section.title}</Text>
            </View>
            {section.settings.map((s, idx) => (
              <View
                key={s.key}
                style={[
                  styles.settingRow,
                  idx < section.settings.length - 1 && styles.settingRowBorder,
                ]}
              >
                <Text style={styles.settingLabel}>{s.label}</Text>
                <Switch
                  value={!!toggles[s.key]}
                  onValueChange={() => toggle(s.key)}
                  trackColor={{ false: '#E2E8F0', true: '#C084FC' }}
                  thumbColor={toggles[s.key] ? '#A855F7' : '#94A3B8'}
                  ios_backgroundColor="#E2E8F0"
                />
              </View>
            ))}
          </View>
        ))}

        {/* Bulk actions */}
        <View style={styles.bulkRow}>
          <TouchableOpacity
            style={styles.bulkBtn}
            onPress={() => {
              const all: Record<string, boolean> = {};
              SECTIONS.forEach(s => s.settings.forEach(r => { all[r.key] = true; }));
              setToggles(all);
            }}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color="#A855F7" />
            <Text style={styles.bulkBtnText}>Select All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bulkBtn}
            onPress={() => {
              const none: Record<string, boolean> = {};
              SECTIONS.forEach(s => s.settings.forEach(r => { none[r.key] = false; }));
              setToggles(none);
            }}
          >
            <Ionicons name="close-circle-outline" size={16} color="#64748B" />
            <Text style={[styles.bulkBtnText, { color: '#64748B' }]}>Deselect All</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── Sticky Bottom Buttons ────────────────────────────────────── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.csvBtn, isLoadingCSV && styles.btnDisabled]}
          onPress={handleCSV}
          activeOpacity={0.85}
          disabled={isLoadingCSV || isLoadingPDF}
        >
          {isLoadingCSV
            ? <ActivityIndicator color="#fff" size="small" />
            : <>
                <Ionicons name="document-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.btnText}>CSV Report</Text>
              </>
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pdfBtnWrap, (isLoadingPDF || isLoadingCSV) && styles.btnDisabled]}
          onPress={handlePDF}
          activeOpacity={0.85}
          disabled={isLoadingCSV || isLoadingPDF}
        >
          <LinearGradient colors={colors.gradients.primary} style={styles.pdfBtn}>
            {isLoadingPDF
              ? <ActivityIndicator color="#fff" size="small" />
              : <>
                  <Ionicons name="document-text-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.btnText}>PDF Report</Text>
                </>
            }
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ── Calendar Modal ───────────────────────────────────────────── */}
      <Modal visible={isCalendarVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date Range</Text>
              <TouchableOpacity onPress={() => setIsCalendarVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textDark} />
              </TouchableOpacity>
            </View>
            <Calendar
              markingType="period"
              markedDates={markedDates}
              onDayPress={onDayPress}
              theme={{ todayTextColor: '#A855F7', arrowColor: '#A855F7' }}
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

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  gradientStrip: { paddingBottom: 16, overflow: 'visible', zIndex: 20 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 },

  filterBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 10, zIndex: 30 },
  dropdownWrap: { flex: 1, zIndex: 30 },
  dropdownBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 22, paddingHorizontal: 12, paddingVertical: 8,
  },
  dropdownBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', flex: 1, marginRight: 4 },
  dropdownList: {
    position: 'absolute', top: 44, left: 0, right: 0,
    backgroundColor: '#FFF', borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12, shadowRadius: 12, elevation: 20, zIndex: 100,
  },
  dropdownItem: { paddingVertical: 13, paddingHorizontal: 16 },
  dropdownItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownItemText: { fontSize: 14, color: '#334155' },
  dropdownItemActive: { color: '#A855F7', fontWeight: '700' },

  dateDisplay: { alignItems: 'center' },
  dateText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
  dateSep: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },

  calBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center',
  },
  calDot: {
    position: 'absolute', top: 6, right: 6,
    width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#A855F7',
  },

  // Summary strip
  summaryStrip: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  summaryPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FAF5FF', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: '#E9D5FF',
  },
  summaryPillText: { fontSize: 12, fontWeight: '700', color: '#7C3AED' },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 14 },

  // Card
  card: {
    backgroundColor: '#FFF', borderRadius: 16, marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 9,
    backgroundColor: '#FAF5FF',
    borderBottomWidth: 1, borderBottomColor: '#F3E8FF',
  },
  cardHeaderText: {
    fontSize: 12, fontWeight: '700', color: '#7E22CE',
    textTransform: 'uppercase', letterSpacing: 0.6,
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  settingRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  settingLabel: { fontSize: 14, color: '#1E293B', fontWeight: '500', flex: 1 },

  // Bulk
  bulkRow: { flexDirection: 'row', gap: 10, marginTop: 4, marginBottom: 2 },
  bulkBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, backgroundColor: '#FFF', borderRadius: 12,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  bulkBtnText: { fontSize: 13, fontWeight: '600', color: '#A855F7' },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28,
    backgroundColor: '#FFF',
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 10,
  },
  csvBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#7C3AED', borderRadius: 30, paddingVertical: 14, minHeight: 50,
  },
  pdfBtnWrap: { flex: 1, borderRadius: 30, overflow: 'hidden' },
  pdfBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 30, paddingVertical: 14, minHeight: 50,
  },
  btnText: { color: '#FFF', fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
  btnDisabled: { opacity: 0.6 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12, shadowRadius: 20, elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
  modalActions: {
    flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18, gap: 12,
  },
  clearBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  clearBtnText: { color: '#94A3B8', fontWeight: '600' },
  applyBtn: {
    backgroundColor: '#A855F7', paddingVertical: 10,
    paddingHorizontal: 24, borderRadius: 10,
  },
  applyBtnText: { color: '#FFF', fontWeight: '700' },
});
