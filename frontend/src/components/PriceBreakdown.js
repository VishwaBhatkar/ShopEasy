import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';
import { formatINR } from '../utils/formatters';

export default function PriceBreakdown({
  subtotal = 0,
  deliveryCharge = 0,
  finalTotal = 0,
  freeDeliveryThreshold = 500,
  itemsCount = 0
}) {
  const isFreeDelivery = deliveryCharge === 0;
  const remainingForFree = freeDeliveryThreshold - subtotal;

  return (
    <View style={styles.card}>
      <Text style={styles.headerTitle}>Price Details ({itemsCount} items)</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Subtotal</Text>
        <Text style={styles.value}>{formatINR(subtotal)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Delivery Charges</Text>
        {isFreeDelivery ? (
          <View style={styles.freeBadgeContainer}>
            <Text style={styles.freeText}>FREE</Text>
          </View>
        ) : (
          <Text style={styles.value}>{formatINR(deliveryCharge)}</Text>
        )}
      </View>

      {!isFreeDelivery && remainingForFree > 0 && (
        <View style={styles.deliveryNoteContainer}>
          <Text style={styles.deliveryNote}>
            💡 Add {formatINR(remainingForFree)} more to get FREE Delivery!
          </Text>
        </View>
      )}

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Payable</Text>
        <Text style={styles.totalValue}>{formatINR(finalTotal)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginVertical: 12
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary
  },
  freeBadgeContainer: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  freeText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '700'
  },
  deliveryNoteContainer: {
    backgroundColor: '#EFF6FF',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10
  },
  deliveryNote: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500'
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary
  }
});
