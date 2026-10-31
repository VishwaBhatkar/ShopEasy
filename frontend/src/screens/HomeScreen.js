import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import CategoryPills from '../components/CategoryPills';
import ProductCard from '../components/ProductCard';
import LoadingView from '../components/LoadingView';
import EmptyState from '../components/EmptyState';
import ProductApi from '../api/productApi';

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Load products from backend
  const loadProducts = useCallback(async (category = selectedCategory, search = searchQuery, isPullRefresh = false) => {
    if (!isPullRefresh) setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await ProductApi.getProducts(category, search);

      if (result && result.data) {
        setProducts(result.data);
        if (result.categories && result.categories.length > 0) {
          setCategories(result.categories);
        }
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.warn('Error fetching products:', err.message);
      setErrorMessage(err.friendlyMessage || 'Unable to connect to backend server. Make sure the Node.js server is running.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCategory, searchQuery]);

  // Initial load
  useEffect(() => {
    loadProducts('all', '');
  }, []);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setIsRefreshing(true);
    loadProducts(selectedCategory, searchQuery, true);
  };

  // Handle category selection
  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setSearchQuery('');
    loadProducts(cat, '');
  };

  // Handle search submit
  const handleSearchSubmit = () => {
    loadProducts(selectedCategory, searchQuery);
  };

  // Handle search clear
  const handleSearchClear = () => {
    setSearchQuery('');
    loadProducts(selectedCategory, '');
  };

  const renderProductItem = ({ item }) => (
    <ProductCard
      product={item}
      onPress={() => navigation.navigate('ProductDetails', { product: item, productId: item.id })}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <Header title="ShopEasy" showBack={false} showCart={true} />

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmit={handleSearchSubmit}
        onClear={handleSearchClear}
      />

      {/* Category Pills */}
      <CategoryPills
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <LoadingView loading={true} message="Fetching catalog..." />
      ) : errorMessage ? (
        <LoadingView
          error={errorMessage}
          onRetry={() => loadProducts(selectedCategory, searchQuery)}
        />
      ) : products.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No Products Found"
          description={
            searchQuery
              ? `We couldn't find any items matching "${searchQuery}". Try different keywords.`
              : 'There are currently no products available in this category.'
          }
          buttonText="Reset Filters"
          onButtonPress={() => {
            setSelectedCategory('all');
            setSearchQuery('');
            loadProducts('all', '');
          }}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProductItem}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.resultCount}>
                Showing {products.length} {products.length === 1 ? 'product' : 'products'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16
  },
  listContent: {
    paddingBottom: 24
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6
  },
  resultCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  }
});
