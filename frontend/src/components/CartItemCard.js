import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { formatINR } from '../utils/formatters';

export default function CartItemCard({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  onPressItem
}) {
  const itemTotal = (item.price || 0) * (item.quantity || 1);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.imageWrapper}
        onPress={onPressItem}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onPressItem} style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onRemove}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={`Remove ${item.title}`}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.danger} />
          </TouchableOpacity>
        </View>

        <Text style={styles.unitPrice}>{formatINR(item.price)} each</Text>

        <View style={styles.actionRow}>
          {/* Quantity Stepper */}
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={onDecrease}
              accessibilityLabel="Decrease quantity"
            >
              <Ionicons
                name={item.quantity === 1 ? 'trash-outline' : 'remove'}
                size={16}
                color={item.quantity === 1 ? Colors.danger : Colors.textPrimary}
              />
            </TouchableOpacity>

            <Text style={styles.quantityText}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.stepperButton}
              onPress={onIncrease}
              accessibilityLabel="Increase quantity"
            >
              <Ionicons name="add" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Line Total */}
          <View style={styles.totalWrapper}>
            <Text style={styles.totalText}>{formatINR(itemTotal)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center'
  },
  imageWrapper: {
    width: 80,
    height: 80,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  image: {
    width: '100%',
    height: '100%'
  },
  content: {
    flex: 1
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 18,
    paddingRight: 6
  },
  deleteButton: {
    padding: 4
  },
  unitPrice: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginVertical: 4
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8
  },
  stepperButton: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  quantityText: {
    paddingHorizontal: 8,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary
  },
  totalWrapper: {
    alignItems: 'flex-end'
  },
  totalText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary
  }
});
