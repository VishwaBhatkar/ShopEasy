import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Header from '../components/Header';
import LoadingView from '../components/LoadingView';
import { formatINR, capitalizeWord } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import ProductApi from '../api/productApi';

const { width } = Dimensions.get('window');

export default function ProductDetailsScreen({ route, navigation }) {
  const initialProduct = route.params?.product;
  const productId = route.params?.productId || initialProduct?.id;

  const [product, setProduct] = useState(initialProduct || null);
  const [isLoading, setIsLoading] = useState(!initialProduct);
  const [error, setError] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const { addToCart, isInCart, getItemQuantity } = useCart();
  const alreadyInCart = product ? isInCart(product.id) : false;
  const currentCartQuantity = product ? getItemQuantity(product.id) : 0;

  useEffect(() => {
    // If details need fetching or refresh from API
    if (!product && productId) {
      const fetchDetails = async () => {
        try {
          setIsLoading(true);
          const res = await ProductApi.getProductById(productId);
          if (res && res.data) {
            setProduct(res.data);
          } else {
            setError('Product not found.');
          }
        } catch (err) {
          setError(err.friendlyMessage || 'Failed to load product details.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, selectedQuantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Product Details" showBack={true} />
        <LoadingView loading={true} message="Loading details..." />
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Product Details" showBack={true} />
        <LoadingView
          error={error || 'Product not found'}
          onRetry={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <Header title="Product Details" showBack={true} showCart={true} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Large Product Image */}
        <View style={styles.imageCard}>
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Content Box */}
        <View style={styles.infoSection}>
          {/* Category & Rating Row */}
          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {capitalizeWord(product.category || 'General')}
              </Text>
            </View>

            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color={Colors.star} />
              <Text style={styles.ratingText}>
                {Number(product.rating || 4.5).toFixed(1)} / 5.0
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{product.title}</Text>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatINR(product.price)}</Text>
            <Text style={styles.taxInclusive}>Inclusive of all taxes</Text>
          </View>

          {/* Features Highlights */}
          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
              <Text style={styles.featureLabel}>100% Genuine</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="refresh-outline" size={20} color={Colors.primary} />
              <Text style={styles.featureLabel}>7 Days Return</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="flash-outline" size={20} color={Colors.primary} />
              <Text style={styles.featureLabel}>Fast Delivery</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionHeading}>Product Description</Text>
          <Text style={styles.description}>
            {product.description || 'No detailed description available for this item.'}
          </Text>

          {/* Success Banner */}
          {addedSuccess && (
            <View style={styles.toastBanner}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.toastText}>Item added to your shopping cart!</Text>
            </View>
          )}

          {/* Already in cart notice */}
          {alreadyInCart && (
            <View style={styles.inCartNotice}>
              <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
              <Text style={styles.inCartNoticeText}>
                You already have {currentCartQuantity} of this item in your cart.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        {/* Quantity Stepper */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setSelectedQuantity((q) => Math.max(1, q - 1))}
            disabled={selectedQuantity <= 1}
          >
            <Ionicons
              name="remove"
              size={18}
              color={selectedQuantity <= 1 ? Colors.textLight : Colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.qtyNumber}>{selectedQuantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setSelectedQuantity((q) => q + 1)}
          >
            <Ionicons name="add" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
            activeOpacity={0.85}
          >
            <Ionicons name="cart-outline" size={20} color={Colors.white} style={{ marginRight: 6 }} />
            <Text style={styles.addToCartText}>
              {alreadyInCart ? 'Add More' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>

          {alreadyInCart && (
            <TouchableOpacity
              style={styles.goToCartButton}
              onPress={() => navigation.navigate('MainTabs', { screen: 'CartTab' })}
              activeOpacity={0.85}
            >
              <Text style={styles.goToCartText}>View Cart</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
    paddingBottom: 40
  },
  imageCard: {
    width: width,
    height: 300,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight
  },
  image: {
    width: '100%',
    height: '100%'
  },
  infoSection: {
    padding: 20
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  categoryBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8
  },
  categoryText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FEF3C7'
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309'
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 28,
    marginBottom: 12
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 20
  },
  price: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary
  },
  taxInclusive: {
    fontSize: 12,
    color: Colors.textSecondary
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 20
  },
  featureItem: {
    alignItems: 'center',
    gap: 4
  },
  featureLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginBottom: 18
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 8
  },
  toastText: {
    color: Colors.success,
    fontSize: 13,
    fontWeight: '600'
  },
  inCartNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 12
  },
  inCartNoticeText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '500'
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 4
      },
      android: {
        elevation: 6
      }
    })
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 4,
    height: 48
  },
  qtyBtn: {
    width: 34,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  qtyNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: 8
  },
  actionButtonsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 8
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addToCartText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700'
  },
  goToCartButton: {
    paddingHorizontal: 16,
    backgroundColor: Colors.primaryLight,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary
  },
  goToCartText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700'
  }
});
