import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Colors from '../constants/colors';
import { capitalizeWord } from '../utils/formatters';

export default function CategoryPills({
  categories = ['all'],
  selectedCategory = 'all',
  onSelectCategory
}) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
          const displayName = cat === 'all' ? 'All Items' : capitalizeWord(cat.replace('-', ' '));

          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.pill,
                isSelected ? styles.pillSelected : styles.pillDefault
              ]}
              onPress={() => onSelectCategory(cat)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  isSelected ? styles.pillTextSelected : styles.pillTextDefault
                ]}
              >
                {displayName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pillDefault: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border
  },
  pillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600'
  },
  pillTextDefault: {
    color: Colors.textSecondary
  },
  pillTextSelected: {
    color: Colors.white
  }
});
