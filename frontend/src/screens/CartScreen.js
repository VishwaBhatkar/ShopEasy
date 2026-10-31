import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Header from '../components/Header';
import CartItemCard from '../components/CartItemCard';
import PriceBreakdown from '../components/PriceBreakdown';
import EmptyState from '../components/EmptyState';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/formatters';

export default function CartScreen({ navigation }) {
  const {
    cartItems,
    cartCount,
    subtotal,
    deliveryCharge,
    finalTotal,
    FREE_DELIVERY_THRESHOLD,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart
  } = useCart();

  const handleCheckout = () => {
    navigation.navigate('OrderSummary');
  };

  const renderCartItem = ({ item }) => (
    <CartItemCard
      item={item}
      onIncrease={() => increaseQuantity(item.id)}
      onDecrease={() => decreaseQuantity(item.id)}
      onRemove={() => removeFromCart(item.id)}
      onPressItem={() => navigation.navigate('ProductDetails', { product: item, productId: item.id })}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <Header title="Shopping Cart" showBack={false} showCart={false} />

      {cartItems.length === 0 ? (
        <EmptyState
          icon="cart-outline"
          title="Your Cart is Empty"
          description="Looks like you haven't added anything to your cart yet. Explore our top trending products!"
          buttonText="Explore Products"
          onButtonPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
        />
      ) : (
        <View style={styles.container}>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderCartItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.summaryBar}>
                <Text style={styles.itemsSummary}>
                  {cartCount} {cartCount === 1 ? 'Item' : 'Items'} in Cart
                </Text>
              </View>
            }
            ListFooterComponent={
              <PriceBreakdown
                subtotal={subtotal}
                deliveryCharge={deliveryCharge}
                finalTotal={finalTotal}
                freeDeliveryThreshold={FREE_DELIVERY_THRESHOLD}
                itemsCount={cartCount}
              />
            }
          />

          {/* Sticky Checkout Footer */}
          <View style={styles.footer}>
            <View style={styles.totalInfo}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>{formatINR(finalTotal)}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
              activeOpacity={0.85}
            >
              <Text style={styles.checkoutText}>Proceed to Buy</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background
  },
  container: {
    flex: 1
  },
  listContent: {
    padding: 16,
    paddingBottom: 24
  },
  summaryBar: {
    marginBottom: 12
  },
  itemsSummary: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 5
  },
  totalInfo: {
    justifyContent: 'center'
  },
  totalLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500'
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8
  },
  checkoutText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700'
  }
});
