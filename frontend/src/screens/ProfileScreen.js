import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function ProfileScreen({ navigation }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutFeedback, setLogoutFeedback] = useState(null);

  const handleLogoutPress = () => {
    const performLogout = async () => {
      setIsLoggingOut(true);
      await logout();
      setIsLoggingOut(false);
      setLogoutFeedback('You have been logged out successfully.');
      setTimeout(() => setLogoutFeedback(null), 3000);
    };

    if (Platform.OS === 'web') {
      // In web browser environment
      if (window.confirm('Are you sure you want to log out of ShopEasy?')) {
        performLogout();
      }
    } else {
      Alert.alert(
        'Log Out',
        'Are you sure you want to log out of your ShopEasy account?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Log Out',
            style: 'destructive',
            onPress: performLogout
          }
        ]
      );
    }
  };

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="My Account" showCart={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {logoutFeedback && (
          <View style={styles.feedbackBanner}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={styles.feedbackText}>{logoutFeedback}</Text>
          </View>
        )}

        {isAuthenticated && user ? (
          /* ================= Authenticated User View ================= */
          <View>
            {/* User Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
              </View>

              <View style={styles.profileDetails}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {user.name}
                  </Text>
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark" size={12} color={Colors.white} />
                  </View>
                </View>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {user.email}
                </Text>
                <View style={styles.memberTag}>
                  <Text style={styles.memberTagText}>ShopEasy Member</Text>
                </View>
              </View>
            </View>

            {/* Quick Stat Bar */}
            <View style={styles.statsCard}>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => navigation.navigate('MainTabs', { screen: 'CartTab' })}
              >
                <Ionicons name="bag-handle-outline" size={22} color={Colors.primary} />
                <Text style={styles.statNumber}>{cartCount}</Text>
                <Text style={styles.statLabel}>Cart Items</Text>
              </TouchableOpacity>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Ionicons name="shield-checkmark-outline" size={22} color={Colors.success} />
                <Text style={styles.statNumber}>100%</Text>
                <Text style={styles.statLabel}>Secure Buyer</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Ionicons name="flash-outline" size={22} color={Colors.star} />
                <Text style={styles.statNumber}>Fast</Text>
                <Text style={styles.statLabel}>Delivery</Text>
              </View>
            </View>

            {/* Delivery Information Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="location-outline" size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Default Delivery Details</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={16} color={Colors.textSecondary} style={styles.infoIcon} />
                <Text style={styles.infoText}>
                  {user.phone || '+91 98765 43210 (Demo Contact)'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="home-outline" size={16} color={Colors.textSecondary} style={styles.infoIcon} />
                <Text style={styles.infoText}>
                  {user.address
                    ? `${user.address}${user.city ? ', ' + user.city : ''}${user.state ? ', ' + user.state : ''}${user.pincode ? ' - ' + user.pincode : ''}`
                    : 'Flat 402, Green Glen Heights, Bellandur, Bengaluru - 560103'}
                </Text>
              </View>
            </View>

            {/* App Features / Actions */}
            <View style={styles.menuSection}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('MainTabs', { screen: 'CartTab' })}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIconContainer, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="bag-outline" size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.menuText}>My Shopping Cart</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIconContainer, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="storefront-outline" size={20} color={Colors.success} />
                  </View>
                  <Text style={styles.menuText}>Explore Products</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
              </TouchableOpacity>
            </View>

            {/* Prominent Log Out Button */}
            <View style={styles.logoutWrapper}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogoutPress}
                disabled={isLoggingOut}
                accessibilityLabel="Log out of ShopEasy"
              >
                {isLoggingOut ? (
                  <ActivityIndicator size="small" color={Colors.danger} />
                ) : (
                  <>
                    <Ionicons name="log-out-outline" size={22} color={Colors.danger} />
                    <Text style={styles.logoutText}>Log Out</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* ================= Guest / Logged Out View ================= */
          <View style={styles.guestContainer}>
            <View style={styles.guestGraphic}>
              <View style={styles.guestAvatar}>
                <Ionicons name="person" size={54} color={Colors.primary} />
              </View>
            </View>

            <Text style={styles.guestTitle}>Welcome to ShopEasy</Text>
            <Text style={styles.guestSubtitle}>
              Sign in to manage your orders, save delivery addresses, and enjoy faster checkout.
            </Text>

            {/* Primary Action: Log In */}
            <TouchableOpacity
              style={styles.primaryLoginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Ionicons name="log-in-outline" size={20} color={Colors.white} />
              <Text style={styles.primaryLoginText}>Log In to Account</Text>
            </TouchableOpacity>

            {/* Secondary Action: Create Account */}
            <TouchableOpacity
              style={styles.secondaryRegisterButton}
              onPress={() => navigation.navigate('Register')}
            >
              <Ionicons name="person-add-outline" size={18} color={Colors.primary} />
              <Text style={styles.secondaryRegisterText}>Create New Account</Text>
            </TouchableOpacity>

            {/* Member Benefits */}
            <View style={styles.benefitsCard}>
              <Text style={styles.benefitsHeading}>Member Perks</Text>

              <View style={styles.benefitItem}>
                <Ionicons name="flash" size={18} color={Colors.primary} />
                <View style={styles.benefitTextCol}>
                  <Text style={styles.benefitTitle}>Fast 1-Click Checkout</Text>
                  <Text style={styles.benefitDesc}>Pre-filled delivery details for fast ordering</Text>
                </View>
              </View>

              <View style={styles.benefitItem}>
                <Ionicons name="shield-checkmark" size={18} color={Colors.success} />
                <View style={styles.benefitTextCol}>
                  <Text style={styles.benefitTitle}>100% Genuine Products</Text>
                  <Text style={styles.benefitDesc}>Directly sourced products with verified ratings</Text>
                </View>
              </View>

              <View style={styles.benefitItem}>
                <Ionicons name="cube-outline" size={18} color={Colors.star} />
                <View style={styles.benefitTextCol}>
                  <Text style={styles.benefitTitle}>Easy Order Tracking</Text>
                  <Text style={styles.benefitDesc}>Stay updated on dispatch and delivery progress</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Footer info */}
        <View style={styles.footerInfo}>
          <Text style={styles.versionText}>ShopEasy Mobile v1.0.0</Text>
          <Text style={styles.copyrightText}>Safe & Secure Indian Shopping</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16
  },
  feedbackText: {
    fontSize: 13,
    color: Colors.success,
    fontWeight: '600',
    marginLeft: 8
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4
      },
      android: {
        elevation: 2
      }
    })
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white
  },
  profileDetails: {
    flex: 1
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: 6
  },
  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8
  },
  memberTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  memberTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 16
  },
  statItem: {
    alignItems: 'center',
    flex: 1
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginLeft: 8
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18
  },
  menuSection: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    marginBottom: 20,
    overflow: 'hidden'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary
  },
  logoutWrapper: {
    marginTop: 8,
    marginBottom: 20
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 12,
    height: 52
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.danger,
    marginLeft: 8
  },
  guestContainer: {
    alignItems: 'center',
    paddingVertical: 10
  },
  guestGraphic: {
    marginBottom: 16
  },
  guestAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center'
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center'
  },
  guestSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 24
  },
  primaryLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    width: '100%',
    height: 52,
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6
      },
      android: {
        elevation: 4
      }
    })
  },
  primaryLoginText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8
  },
  secondaryRegisterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    width: '100%',
    height: 52,
    borderRadius: 12,
    marginBottom: 28
  },
  secondaryRegisterText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8
  },
  benefitsCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20
  },
  benefitsHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  benefitTextCol: {
    marginLeft: 10,
    flex: 1
  },
  benefitTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2
  },
  benefitDesc: {
    fontSize: 12,
    color: Colors.textSecondary
  },
  footerInfo: {
    alignItems: 'center',
    marginTop: 10
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textLight
  },
  copyrightText: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2
  }
});
