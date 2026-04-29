import React from 'react';
import { StyleSheet, ScrollView, View, Text, Platform, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

import { BentoCard } from '@/components/ui/BentoCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Colors, Layout } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useDeleteRecipeMutation, useRecipesQuery } from '@/hooks/useInventory';

export default function RecipesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];
  const router = useRouter();
  
  const { averageMargin } = useAnalytics();
  const { data: recipes = [], isLoading: isRecipesLoading } = useRecipesQuery(); 

  const deleteMutation = useDeleteRecipeMutation();

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Recipe",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => deleteMutation.mutate(id)
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: c.text }]}>Recipes</Text>
          <TouchableOpacity 
            onPress={() => router.push('/add-recipe')}
            style={[styles.addBtn, { backgroundColor: c.primary }]}
          >
            <MaterialIcons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <BentoCard style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: c.text }]}>{recipes.length}</Text>
              <Text style={[styles.summaryLabel, { color: c.textSecondary }]}>Total Recipes</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: c.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: c.primary }]}>
                {averageMargin > 0 ? `${averageMargin.toFixed(1)}%` : '0%'}
              </Text>
              <Text style={[styles.summaryLabel, { color: c.textSecondary }]}>Avg. Margin</Text>
            </View>
          </View>
        </BentoCard>

        <View style={styles.list}>
          {isRecipesLoading ? (
            <ActivityIndicator size="large" color={c.primary} style={{ marginTop: 40 }} />
          ) : recipes.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="restaurant" size={64} color={c.border} />
              <Text style={[styles.emptyText, { color: c.textSecondary }]}>No recipes added yet.</Text>
            </View>
          ) : (
            recipes.map((recipe: any) => (
              <BentoCard key={recipe.id} style={styles.recipeCard}>
                <View style={styles.recipeHeader}>
                  <View style={styles.recipeInfo}>
                    <Text style={[styles.recipeName, { color: c.text }]}>{recipe.name}</Text>
                    <Text style={[styles.recipeCategory, { color: c.textTertiary }]}>{recipe.category}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(recipe.id, recipe.name)}>
                    <MaterialIcons name="delete-outline" size={22} color={c.danger} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.recipeMetrics}>
                  <View style={styles.metric}>
                    <Text style={[styles.metricLabel, { color: c.textTertiary }]}>Price</Text>
                    <Text style={[styles.metricValue, { color: c.text }]}>₱{recipe.selling_price}</Text>
                  </View>
                  <View style={styles.metric}>
                    <Text style={[styles.metricLabel, { color: c.textTertiary }]}>Target Margin</Text>
                    <Text style={[styles.metricValue, { color: c.primary }]}>{recipe.target_margin_percentage}%</Text>
                  </View>
                </View>
              </BentoCard>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: Layout.spacing.xl,
    paddingBottom: 140,
    paddingTop: Platform.OS === 'android' ? 8 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.xxl,
    marginTop: Layout.spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    marginBottom: Layout.spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  summaryDivider: {
    width: 1,
    height: 28,
  },
  list: {
    gap: Layout.spacing.md,
  },
  recipeCard: {
    marginBottom: Layout.spacing.sm,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.md,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  recipeCategory: {
    fontSize: 13,
    fontWeight: '500',
  },
  recipeMetrics: {
    flexDirection: 'row',
    gap: 24,
  },
  metric: {
    gap: 2,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
