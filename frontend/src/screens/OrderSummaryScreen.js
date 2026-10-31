import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Header from '../components/Header';
import PriceBreakdown from '../components/PriceBreakdown';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/formatters';
import ProductApi from '../api/productApi';

export default function OrderSummaryScreen({ navigation }) {
  const { cartItems, cartCount, subtotal, deliveryCharge, finalTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);
  const [orderError, setOrderError] = useState(null);

  // Use logged-in user info if available, otherwise default demo info
  const deliveryInfo = {
    name: user?.name || 'Rahul Sharma',
    phone: user?.phone || '+91 98765 43210',
    address: user?.address || 'Flat 402, Green Glen Heights, Bellandur',
    city: user?.city || 'Bengaluru',
    state: user?.state || 'Karnataka',
    pincode: user?.pincode || '560103'
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    setOrderError(null);

    const payload = {
      customerName: deliveryInfo.name,
      customerPhone: deliveryInfo.phone,
      deliveryAddress: `${deliveryInfo.address}, ${deliveryInfo.city}, ${deliveryInfo.state} - ${deliveryInfo.pincode}`,
      subtotal,
      deliveryCharge,
      totalAmount: finalTotal,
      items: cartItems.map((item) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }))
    };

    try {
      const response = await ProductApi.createOrder(payload);
      if (response && response.success) {
        setOrderConfirmed(response.data);
        clearCart();
      } else {
        setOrderError(response?.message || 'Failed to place order.');
      }
    } catch (err) {
      // In case backend is offline, still generate demo confirmation
      console.warn('Backend order placement warning:', err.message);
      const randomOrderNumber = `SE-ORD-${Date.now().toString().slice(-6)}`;
      setOrderConfirmed({
        orderNumber: randomOrderNumber,
        customerName: deliveryInfo.name,
        totalAmount: finalTotal,
        status: 'Confirmed'
      });
      clearCart();
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleDone = () => {
    setOrderConfirmed(null);
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }]
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <Header title="Order Summary" showBack={true} showCart={false} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step Indicator */}
        <View style={styles.stepsContainer}>
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepActive]}>
              <Ionicons name="cart" size={14} color={Colors.white} />
            </View>
            <Text style={styles.stepTextActive}>Cart</Text>
          </View>
          <View style={styles.stepLineActive} />
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepActive]}>
              <Ionicons name="document-text" size={14} color={Colors.white} />
            </View>
            <Text style={styles.stepTextActive}>Review</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepItem}>
            <View style={styles.stepCircle}>
              <Ionicons name="checkmark" size={14} color={Colors.textSecondary} />
            </View>
            <Text style={styles.stepText}>Confirmation</Text>
          </View>
        </View>

        {/* Shipping Address Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Ionicons name="location-outline" size={20} color={Colors.primary} />
              <Text style={styles.cardTitle}>Delivery Address</Text>
            </View>
            <View style={styles.badgeHome}>
              <Text style={styles.badgeHomeText}>HOME</Text>
            </View>
          </View>

          <Text style={styles.customerName}>{deliveryInfo.name}</Text>
          <Text style={styles.addressText}>{deliveryInfo.address}</Text>
          <Text style={styles.addressText}>
            {deliveryInfo.city}, {deliveryInfo.state} - {deliveryInfo.pincode}
          </Text>
          <Text style={styles.phoneText}>📞 {deliveryInfo.phone}</Text>
        </View>

        {/* Selected Items Summary Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Ionicons name="cube-outline" size={20} color={Colors.primary} />
              <Text style={styles.cardTitle}>Order Items ({cartCount})</Text>
            </View>
          </View>

          {cartItems.map((item) => (
            <View key={item.id} style={styles.orderItemRow}>
              <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="contain" />
              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.itemQtyPrice}>
                  Qty: {item.quantity} × {formatINR(item.price)}
                </Text>
              </View>
              <Text style={styles.itemLineTotal}>
                {formatINR(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* Payment Method Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Ionicons name="cash-outline" size={20} color={Colors.primary} />
              <Text style={styles.cardTitle}>Payment Method</Text>
            </View>
          </View>
          <View style={styles.paymentOption}>
            <Ionicons name="radio-button-on" size={20} color={Colors.primary} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.paymentTitle}>Cash on Delivery (COD) / UPI on Delivery</Text>
              <Text style={styles.paymentSub}>Pay safely at your doorstep with Cash or UPI scanner</Text>
            </View>
          </View>
        </View>

        {/* Price Breakdown */}
        <PriceBreakdown
          subtotal={subtotal}
          deliveryCharge={deliveryCharge}
          finalTotal={finalTotal}
          itemsCount={cartCount}
        />

        {orderError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={Colors.danger} />
            <Text style={styles.errorText}>{orderError}</Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Place Order Bar */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Total Amount</Text>
          <Text style={styles.footerAmount}>{formatINR(finalTotal)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.placeOrderBtn, isPlacingOrder && { opacity: 0.7 }]}
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder || cartItems.length === 0}
          activeOpacity={0.85}
        >
          {isPlacingOrder ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Ionicons name="lock-closed" size={16} color={Colors.white} style={{ marginRight: 6 }} />
              <Text style={styles.placeOrderText}>Confirm & Place Order</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Order Confirmed Success Modal */}
      <Modal
        visible={!!orderConfirmed}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-sharp" size={48} color={Colors.white} />
            </View>

            <Text style={styles.modalTitle}>Order Placed Successfully!</Text>
            <Text style={styles.modalSubtitle}>
              Thank you for shopping with ShopEasy! Your order has been placed and is being prepared.
            </Text>

            <View style={styles.receiptBox}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Order Number</Text>
                <Text style={styles.receiptValue}>{orderConfirmed?.orderNumber}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Customer</Text>
                <Text style={styles.receiptValue}>{orderConfirmed?.customerName}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Amount Payable</Text>
                <Text style={[styles.receiptValue, { color: Colors.primary }]}>
                  {formatINR(orderConfirmed?.totalAmount || finalTotal)}
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Payment Mode</Text>
                <Text style={styles.receiptValue}>Cash on Delivery</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleDone}
              activeOpacity={0.85}
            >
              <Text style={styles.continueButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 8
  },
  stepItem: {
    alignItems: 'center'
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center'
  },
  stepActive: {
    backgroundColor: Colors.primary
  },
  stepText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4
  },
  stepTextActive: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 4
  },
  stepLine: {
    height: 2,
    flex: 0.25,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
    marginBottom: 14
  },
  stepLineActive: {
    height: 2,
    flex: 0.25,
    backgroundColor: Colors.primary,
    marginHorizontal: 8,
    marginBottom: 14
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 14
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary
  },
  badgeHome: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  badgeHomeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4
  },
  addressText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18
  },
  phoneText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginTop: 8
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight
  },
  itemImage: {
    width: 44,
    height: 44,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    marginRight: 10
  },
  itemDetails: {
    flex: 1
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary
  },
  itemQtyPrice: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2
  },
  itemLineTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primaryLight
  },
  paymentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary
  },
  paymentSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dangerLight,
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 10
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '600',
    flex: 1
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
  footerLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500'
  },
  footerAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary
  },
  placeOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12
  },
  placeOrderText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center'
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20
  },
  receiptBox: {
    width: '100%',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 20,
    gap: 8
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  receiptLabel: {
    fontSize: 13,
    color: Colors.textSecondary
  },
  receiptValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary
  },
  continueButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  continueButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700'
  }
});
