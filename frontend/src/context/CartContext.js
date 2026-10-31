import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_STORAGE_KEY = '@shopeasy_cart_items_v1';
const FREE_DELIVERY_THRESHOLD = 500;
const STANDARD_DELIVERY_CHARGE = 49;

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // 1. Restore Cart from AsyncStorage on App launch
  useEffect(() => {
    const loadSavedCart = async () => {
      try {
        const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setCartItems(parsed);
          }
        }
      } catch (err) {
        console.error('Failed to load cart from AsyncStorage:', err);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSavedCart();
  }, []);

  // 2. Persist Cart to AsyncStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return;

    const saveCart = async () => {
      try {
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      } catch (err) {
        console.error('Failed to save cart to AsyncStorage:', err);
      }
    };

    saveCart();
  }, [cartItems, isLoaded]);

  // Display a temporary toast notification
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 2500);
  };

  /**
   * Add a product to cart.
   * If product already exists, increase its quantity (prevent duplicate entries).
   */
  const addToCart = (product, quantity = 1) => {
    if (!product || !product.id) return;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === product.id);

      if (existingIndex > -1) {
        // Product exists - update quantity
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        showToast(`Increased "${product.title}" quantity in cart!`);
        return updated;
      } else {
        // Product is new - append
        showToast(`Added "${product.title}" to cart!`);
        return [
          ...prevItems,
          {
            id: product.id,
            title: product.title,
            price: Number(product.price) || 0,
            image: product.image,
            category: product.category,
            rating: product.rating,
            quantity: quantity
          }
        ];
      }
    });
  };

  /**
   * Increase quantity of an item by 1
   */
  const increaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  /**
   * Internal helper to delete an item
   */
  const executeRemove = (id) => {
    setCartItems((prevItems) => {
      const target = prevItems.find((item) => item.id === id);
      if (target) {
        showToast(`Removed "${target.title}" from cart`);
      }
      return prevItems.filter((item) => item.id !== id);
    });
  };

  /**
   * Decrease quantity of an item by 1.
   * If quantity reaches 1, asks user confirmation before removing.
   */
  const decreaseQuantity = (id) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;

    if (item.quantity > 1) {
      setCartItems((prevItems) =>
        prevItems.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        )
      );
    } else {
      // Prompt confirmation before removing
      promptRemoveConfirmation(id, item.title);
    }
  };

  /**
   * Remove item from cart with confirmation dialog
   */
  const removeFromCart = (id) => {
    const item = cartItems.find((i) => i.id === id);
    const title = item ? item.title : 'this item';
    promptRemoveConfirmation(id, title);
  };

  /**
   * Confirmation alert before deleting
   */
  const promptRemoveConfirmation = (id, title) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to remove "${title}" from your cart?`);
      if (confirmed) executeRemove(id);
      return;
    }

    Alert.alert(
      'Remove Product',
      `Are you sure you want to remove "${title}" from your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => executeRemove(id)
        }
      ],
      { cancelable: true }
    );
  };

  /**
   * Clear the entire cart (e.g. after successful checkout)
   */
  const clearCart = async () => {
    setCartItems([]);
    try {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      console.warn('Error clearing cart storage', e);
    }
  };

  /**
   * Check if a product is already in the cart
   */
  const isInCart = (id) => {
    return cartItems.some((item) => item.id === id);
  };

  /**
   * Get quantity of a product currently in the cart
   */
  const getItemQuantity = (id) => {
    const item = cartItems.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

  // Calculations
  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  // Delivery charge rule: Free delivery for subtotal >= ₹500, otherwise ₹49
  const deliveryCharge = useMemo(() => {
    if (cartItems.length === 0) return 0;
    return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_CHARGE;
  }, [subtotal, cartItems.length]);

  const finalTotal = useMemo(() => {
    if (cartItems.length === 0) return 0;
    return subtotal + deliveryCharge;
  }, [subtotal, deliveryCharge, cartItems.length]);

  const value = {
    cartItems,
    isLoaded,
    toastMessage,
    cartCount,
    subtotal,
    deliveryCharge,
    finalTotal,
    FREE_DELIVERY_THRESHOLD,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    isInCart,
    getItemQuantity
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
