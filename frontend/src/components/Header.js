import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Colors from '../constants/colors';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Header({
  title = 'ShopEasy',
  showBack = false,
  showCart = true,
  showUser = true,
  rightAction = null
}) {
  const navigation = useNavigation();
  const { cartCount } = useCart();
  const { user, isAuthenticated } = useAuth();

  const handleUserPress = () => {
    if (isAuthenticated) {
      navigation.navigate('MainTabs', { screen: 'AccountTab' });
    } else {
      navigation.navigate('Login');
    }
  };

  const getFirstName = () => {
    if (!user?.name) return '';
    return user.name.trim().split(' ')[0];
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {title === 'ShopEasy' && (
            <Text style={styles.subtitle}>
              {isAuthenticated ? `Welcome, ${getFirstName()} 👋` : 'Smart Shopping, Easy Living'}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightRow}>
        {rightAction}

        {showUser && (
          <TouchableOpacity
            style={styles.userButton}
            onPress={handleUserPress}
            accessibilityLabel={isAuthenticated ? 'Account Profile' : 'Log In'}
          >
            {isAuthenticated ? (
              <View style={styles.userAvatarPill}>
                <Ionicons name="person" size={16} color={Colors.primary} />
                <Text style={styles.userAvatarText} numberOfLines={1}>
                  {getFirstName()}
                </Text>
              </View>
            ) : (
              <View style={styles.loginPill}>
                <Ionicons name="person-outline" size={18} color={Colors.primary} />
                <Text style={styles.loginPillText}>Login</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {showCart && (
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate('MainTabs', { screen: 'CartTab' })}
            accessibilityLabel="Open Cart"
          >
            <Ionicons name="bag-handle-outline" size={24} color={Colors.primary} />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: Colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3
      },
      android: {
        elevation: 2
      }
    })
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  backButton: {
    padding: 6,
    marginRight: 8,
    borderRadius: 8
  },
  titleContainer: {
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.3
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
    letterSpacing: 0.2
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  userButton: {
    marginRight: 4
  },
  userAvatarPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    maxWidth: 100
  },
  userAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 4
  },
  loginPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14
  },
  loginPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 4
  },
  cartButton: {
    padding: 8,
    position: 'relative'
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700'
  }
});
