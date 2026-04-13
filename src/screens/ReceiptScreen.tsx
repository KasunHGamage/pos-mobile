import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Receipt'>;

function formatDate(d: Date) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTime(d: Date) {
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default function ReceiptScreen({ route, navigation }: Props) {
  const {
    total = 0,
    subTotal = 0,
    itemDiscountTotal = 0,
    invoiceDiscountAmt = 0,
    invoiceLabel = '',
    items = [],
    customerName,
    paymentMethod = 'Cash',
    paidAmount: initPaid = 0,
  } = route.params || {};

  const now = new Date();
  const invoiceNum = `INV${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

  const [paidAmountStr, setPaidAmountStr] = useState(initPaid > 0 ? initPaid.toFixed(2) : '');
  const paid = parseFloat(paidAmountStr) || 0;
  const balance = paid > 0 ? paid - total : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Shop Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="cart" size={22} color="#16A34A" />
            <Text style={styles.logoLabel}>SHOP</Text>
          </View>
          <Text style={styles.shopName}>Disanayaka Stores</Text>
          <Text style={styles.shopSub}>Colombo, Sri Lanka</Text>
          <Text style={styles.shopTel}>Tel 0703034509</Text>
        </View>

        <View style={styles.dividerThin} />

        {/* Invoice Meta */}
        <View style={styles.metaRow}>
          <Text style={styles.metaEmpty}>{' '}</Text>
          <Text style={styles.metaDate}>{formatDate(now)}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaInvNo}>{invoiceNum}</Text>
          <Text style={styles.metaTime}>{formatTime(now)}</Text>
        </View>
        <Text style={styles.cashierText}>Cashier: cashier</Text>
        {customerName ? (
          <Text style={styles.customerText}>Customer: {customerName}</Text>
        ) : null}
        {invoiceLabel.length > 0 && (
          <Text style={styles.invLabelText}>{invoiceLabel}</Text>
        )}
        {/* Payment method badge */}
        <View style={styles.payBadgeRow}>
          <View style={[styles.payBadge, paymentMethod === 'Cash' && { backgroundColor: '#D1FAE5' },
            paymentMethod === 'Credit' && { backgroundColor: '#FEF3C7' },
            paymentMethod === 'Cheque' && { backgroundColor: '#DBEAFE' },
            paymentMethod === 'QR' && { backgroundColor: '#F3E8FF' },
          ]}>
            <Ionicons
              name={paymentMethod === 'Cash' ? 'cash-outline' : paymentMethod === 'QR' ? 'qr-code-outline' : paymentMethod === 'Cheque' ? 'document-text-outline' : 'card-outline'}
              size={13}
              color={paymentMethod === 'Cash' ? '#065F46' : paymentMethod === 'Credit' ? '#92400E' : paymentMethod === 'Cheque' ? '#1E40AF' : '#6B21A8'}
            />
            <Text style={[styles.payBadgeText, paymentMethod === 'Cash' && { color: '#065F46' },
              paymentMethod === 'Credit' && { color: '#92400E' },
              paymentMethod === 'Cheque' && { color: '#1E40AF' },
              paymentMethod === 'QR' && { color: '#6B21A8' },
            ]}>{paymentMethod} Payment</Text>
          </View>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderNo}>No:</Text>
          <Text style={styles.tableHeaderDesc}>Item Description</Text>
          <Text style={styles.tableHeaderAmt}>Amount</Text>
        </View>
        <View style={styles.dividerThick} />

        {/* Items List */}
        <View style={styles.itemsContainer}>
          {items.map((item: any, index: number) => {
            const lineTotal = (item.originalPrice ?? item.price) * item.qty;
            const discLKR = item.itemDiscountLKR ?? 0;
            const netAmt = lineTotal - discLKR;
            return (
              <View key={`item-${index}`} style={styles.itemBlock}>
                <View style={styles.itemTopRow}>
                  <Text style={styles.itemNo}>{`${index + 1}.)`}</Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemAmt}>{`${netAmt.toFixed(2)} LKR`}</Text>
                </View>
                <Text style={styles.itemCalcLine}>
                  {`   ${(item.originalPrice ?? item.price).toFixed(1)} x ${Number(item.qty).toFixed(1)} ${item.unit ?? ''} = ${lineTotal.toFixed(2)}`}
                </Text>
                {discLKR > 0 && (
                  <Text style={styles.itemDiscLine}>
                    {`   (${discLKR.toFixed(1)} off) x 1 = -${discLKR.toFixed(2)}`}
                  </Text>
                )}
              </View>
            );
          })}
          {items.length === 0 && (
            <Text style={styles.emptyText}>No items in bill</Text>
          )}
        </View>

        <View style={styles.dividerThin} />

        {/* Totals */}
        <View style={styles.totalsBlock}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabelBold}>Sub Total:</Text>
            <Text style={styles.totalValueBold}>{`${Number(subTotal).toFixed(2)} LKR`}</Text>
          </View>
          {itemDiscountTotal > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Item Discount:</Text>
              <Text style={styles.totalValueDisc}>{`-${Number(itemDiscountTotal).toFixed(2)} LKR`}</Text>
            </View>
          )}
          {invoiceDiscountAmt > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Invoice Discount:</Text>
              <Text style={styles.totalValueDisc}>{`-${Number(invoiceDiscountAmt).toFixed(2)} LKR`}</Text>
            </View>
          )}
        </View>

        <View style={styles.dividerThick} />

        <View style={styles.totalRow}>
          <Text style={styles.grandLabelBold}>Total:</Text>
          <Text style={styles.grandValueBold}>{`${Number(total).toFixed(2)} LKR`}</Text>
        </View>

        <View style={styles.dividerThin} />

        {/* Payment */}
        <Text style={styles.cashInvoiceLabel}>{paymentMethod} Invoice</Text>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Paid Amount:</Text>
          <TextInput
            style={styles.paidInput}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor="#94A3B8"
            value={paidAmountStr}
            onChangeText={setPaidAmountStr}
          />
        </View>

        {paid > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Balance:</Text>
            <Text style={[styles.totalValueBold, balance < 0 ? { color: '#EF4444' } : {}]}>
              {`${balance.toFixed(2)} LKR`}
            </Text>
          </View>
        )}

        <Text style={styles.thankYou}>thank you</Text>
      </ScrollView>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#A855F7' }]}>
          <Ionicons name="share-social" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#EC4899' }]}>
          <Ionicons name="print" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="exit-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#fff' },
  scroll:           { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },

  // Header
  header:           { alignItems: 'center', marginBottom: 16 },
  logoCircle:       { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEF9C3', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  logoLabel:        { fontSize: 9, fontWeight: '800', color: '#1E293B', letterSpacing: 1 },
  shopName:         { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  shopSub:          { fontSize: 13, color: '#64748B', marginBottom: 2 },
  shopTel:          { fontSize: 13, color: '#64748B' },

  customerText:     { fontSize: 13, color: '#1E293B', fontWeight: '600', marginBottom: 2 },
  payBadgeRow:      { flexDirection: 'row', justifyContent: 'center', marginTop: 6, marginBottom: 2 },
  payBadge:         { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: '#F1F5F9' },
  payBadgeText:     { fontSize: 12, fontWeight: '700' },

  // Dividers
  dividerThin:      { height: 1, backgroundColor: '#E2E8F0', marginVertical: 10 },
  dividerThick:     { height: 1.5, backgroundColor: '#1E293B', marginVertical: 8 },

  // Meta
  metaRow:          { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  metaEmpty:        { color: 'transparent' },
  metaDate:         { fontSize: 13, color: '#475569' },
  metaInvNo:        { fontSize: 13, fontWeight: '600', color: '#1E293B' },
  metaTime:         { fontSize: 13, color: '#475569' },
  cashierText:      { fontSize: 13, color: '#475569', marginBottom: 2 },
  invLabelText:     { fontSize: 13, color: '#A855F7', marginBottom: 6, fontWeight: '600' },

  // Table header
  tableHeader:      { flexDirection: 'row', marginTop: 8 },
  tableHeaderNo:    { fontSize: 13, fontWeight: '600', color: '#1E293B', width: 36 },
  tableHeaderDesc:  { flex: 1, fontSize: 13, fontWeight: '600', color: '#1E293B' },
  tableHeaderAmt:   { fontSize: 13, fontWeight: '600', color: '#1E293B', textAlign: 'right' },

  // Items
  itemsContainer:   { marginBottom: 8 },
  itemBlock:        { marginBottom: 12 },
  itemTopRow:       { flexDirection: 'row', alignItems: 'flex-start' },
  itemNo:           { width: 36, fontSize: 14, color: '#1E293B' },
  itemName:         { flex: 1, fontSize: 14, fontWeight: '500', color: '#1E293B' },
  itemAmt:          { fontSize: 14, fontWeight: '500', color: '#1E293B', textAlign: 'right' },
  itemCalcLine:     { fontSize: 12, color: '#64748B', marginTop: 2 },
  itemDiscLine:     { fontSize: 12, color: '#EF4444', marginTop: 1 },
  emptyText:        { textAlign: 'center', color: '#94A3B8', paddingVertical: 16 },

  // Totals
  totalsBlock:      { marginVertical: 4 },
  totalRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  totalLabel:       { fontSize: 13, color: '#475569' },
  totalLabelBold:   { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  totalValueBold:   { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  totalValueDisc:   { fontSize: 13, color: '#475569' },
  grandLabelBold:   { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  grandValueBold:   { fontSize: 16, fontWeight: '800', color: '#1E293B' },

  // Payment
  cashInvoiceLabel: { fontSize: 13, color: '#1E293B', fontWeight: '500', marginBottom: 6, marginTop: 4 },
  paidInput:        { fontSize: 13, fontWeight: '600', color: '#1E293B', textAlign: 'right', minWidth: 80, borderBottomWidth: 1, borderBottomColor: '#CBD5E1', paddingBottom: 2 },

  thankYou:         { textAlign: 'center', fontSize: 14, color: '#94A3B8', marginTop: 24, marginBottom: 8 },

  // Action bar
  actionBar:        { flexDirection: 'row', justifyContent: 'center', gap: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', backgroundColor: '#fff' },
  actionBtn:        { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6 },
});
