import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { formatINR, capitalizeWord } from '../utils/formatters';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2; // 16px outer margin on each side + 12px gap

export default function ProductCard({ product, onPress }) {
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const inCart = isInCart(product.id);
  const qty = getItemQuantity(product.id);

  const handleAdd = (e) => {
    // Prevent navigating when pressing the add button
    addToCart(product, 1);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="contain"
        />
        {/* Rating Badge */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color={Colors.star} />
          <Text style={styles.ratingText}>
            {Number(product.rating || 4.5).toFixed(1)}
          </Text>
        </View>
      </View>

      {/* Product Information */}
      <View style={styles.infoContainer}>
        <Text style={styles.category} numberOfLines={1}>
          {capitalizeWord(product.category || 'General')}
        </Text>

        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatINR(product.price)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.addButton, inCart ? styles.addButtonActive : styles.addButtonDefault]}
            onPress={handleAdd}
            activeOpacity={0.7}
            accessibilityLabel={`Add ${product.title} to cart`}
          >
            {inCart ? (
              <View style={styles.activeAddInner}>
                <Ionicons name="checkmark" size={14} color={Colors.white} />
                <Text style={styles.activeAddText}>{qty}</Text>
              </View>
            ) : (
              <Ionicons name="add" size={18} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 5
      },
      android: {
        elevation: 2
      }
    })
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 8
  },
  image: {
    width: '100%',
    height: '100%'
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
    borderWidth: 1,
    borderColor: Colors.borderLight
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary
  },
  infoContainer: {
    padding: 10,
    justifyContent: 'space-between',
    flex: 1
  },
  category: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 18,
    minHeight: 36,
    marginBottom: 8
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2
  },
  priceContainer: {
    flex: 1
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addButtonDefault: {
    backgroundColor: Colors.primary
  },
  addButtonActive: {
    backgroundColor: Colors.success
  },
  activeAddInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  activeAddText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700'
  }
});
