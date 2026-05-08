import React from 'react';
import { StyleSheet, ScrollView, View, Text, Platform, ActivityIndicator, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useRouter } from 'expo-router';

import { BentoCard } from '@/components/ui/BentoCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Colors, Layout, Shadows, StatusColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useInventoryQuery, Ingredient, useDeleteIngredientMutation, useIngredientBatchesQuery } from '@/hooks/useInventory';
import { useUIStore } from '@/store/useUIStore';

export default function InventoryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];
  const router = useRouter();
  
  const { activeCategory, setActiveCategory } = useUIStore();
  const { data: inventory = [], isLoading, isError, error } = useInventoryQuery();
  const deleteMutation = useDeleteIngredientMutation();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchActive, setIsSearchActive] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);



  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Ingredient",
      `Are you sure you want to delete "${name}"? This will remove it from your stock permanently.`,
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

  // Compute categories based on data
  const categories = React.useMemo(() => {
    const counts: Record<string, number> = { 'All': inventory.length };
    inventory.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ id: key, label: key, count: counts[key] }));
  }, [inventory]);

  const filteredInventory = React.useMemo(() => {
    let result = inventory;
    if (activeCategory !== 'All') {
      result = result.filter(item => item.category === activeCategory);
    }
    if (searchQuery) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [inventory, activeCategory, searchQuery]);

  const totalItems = inventory.reduce((acc, item) => acc + item.quantity, 0);
  const inStockPercentage = inventory.length > 0 
    ? Math.round((inventory.filter(item => item.quantity > 0).length / inventory.length) * 100) 
    : 0;



  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ──────────────────────────────── */}
        <View style={styles.header}>
          {isSearchActive ? (
            <View style={[styles.searchBar, { backgroundColor: c.surface, borderColor: c.primary }]}>
              <MaterialIcons name="search" size={20} color={c.primary} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.searchInput, { color: c.text }]}
                placeholder="Search ingredients..."
                placeholderTextColor={c.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <TouchableOpacity onPress={() => { setIsSearchActive(false); setSearchQuery(''); }}>
                <MaterialIcons name="close" size={20} color={c.textTertiary} />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={[styles.title, { color: c.text }]}>Inventory</Text>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => setIsSearchActive(true)}
                style={[styles.searchBtn, { backgroundColor: c.surface, borderColor: c.border }]}
              >
                <MaterialIcons name="search" size={22} color={searchQuery ? c.primary : c.textSecondary} />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── Summary Row ──────────────────────────── */}
        <BentoCard style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <SummaryMetric value={totalItems.toLocaleString()} label="Total Items" color={c.text} muted={c.textSecondary} />
            <View style={[styles.summaryDivider, { backgroundColor: c.border }]} />
            <SummaryMetric value={categories.length > 1 ? (categories.length - 1).toString() : '0'} label="Categories" color={c.text} muted={c.textSecondary} />
            <View style={[styles.summaryDivider, { backgroundColor: c.border }]} />
            <SummaryMetric value={`${inStockPercentage}%`} label="In Stock" color={c.primary} muted={c.textSecondary} />
          </View>
        </BentoCard>

        {/* ── Category Chips ───────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setActiveCategory(cat.id)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive ? c.primary : c.surface,
                    borderColor: isActive ? c.primary : c.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    { color: isActive ? '#FFF' : c.textSecondary },
                  ]}
                >
                  {cat.label}
                </Text>
                <Text
                  style={[
                    styles.chipCount,
                    { color: isActive ? 'rgba(255,255,255,0.7)' : c.textTertiary },
                  ]}
                >
                  {cat.count}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Inventory List ───────────────────────── */}
        <BentoCard style={styles.listCard}>
          {isLoading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={c.primary} />
            </View>
          ) : isError ? (
             <View style={{ padding: 40, alignItems: 'center' }}>
               <Text style={{ color: 'red' }}>Error: {(error as Error).message}</Text>
             </View>
          ) : filteredInventory.length === 0 ? (
             <View style={{ padding: 40, alignItems: 'center' }}>
               <Text style={{ color: c.textSecondary }}>No items found.</Text>
             </View>
          ) : (
            filteredInventory.map((item, idx) => {
              const status = item.quantity === 0 ? 'Critical' : item.quantity < 5 ? 'Warning' : 'Good';
              const statusText = item.quantity === 0 ? 'Out of Stock' : item.quantity < 5 ? 'Low Stock' : 'In Stock';
              
              const icon = item.category === 'Produce' ? 'eco' : item.category === 'Dairy' ? 'water-drop' : item.category === 'Meat' ? 'set-meal' : 'inventory-2';

              return (
                <React.Fragment key={item.id}>
                  {idx > 0 && <View style={[styles.listDivider, { backgroundColor: c.borderLight }]} />}
                  <View style={[styles.listItem, expandedId === item.id && styles.itemExpanded]}>
                    <View style={styles.itemMainRow}>
                      <View style={[styles.itemIconBox, { backgroundColor: c.primary + '10' }]}>
                        <MaterialIcons name={icon as any} size={20} color={c.primary} />
                      </View>
                      
                      <View style={styles.itemInfo}>
                        <Text style={[styles.itemName, { color: c.text }]} numberOfLines={1}>{item.name}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <StatusBadge status={status} text={statusText} />
                          <TouchableOpacity 
                            onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
                            style={styles.batchToggle}
                          >
                            <Text style={[styles.itemMeta, { color: c.primary }]}>View Batches</Text>
                            <MaterialIcons 
                              name={expandedId === item.id ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                              size={16} 
                              color={c.primary} 
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      <View style={styles.itemRightColumn}>
                        <View style={styles.stockControl}>
                          <TouchableOpacity 
                            onPress={() => router.push({ pathname: '/add-ingredient', params: { id: item.id, mode: 'stock-out' } })}
                            style={[styles.stockBtn, { borderColor: c.border }]}
                          >
                            <MaterialIcons name="remove" size={14} color={c.textSecondary} />
                          </TouchableOpacity>
                          
                          <View style={styles.stockDisplay}>
                            <Text style={[styles.itemStock, { color: c.text }]}>{item.quantity}</Text>
                            <Text style={[styles.itemUnit, { color: c.textTertiary, fontSize: 10 }]}>{item.unit}</Text>
                          </View>
                          
                          <TouchableOpacity 
                            onPress={() => router.push({ pathname: '/add-ingredient', params: { id: item.id, mode: 'stock-in' } })}
                            style={[styles.stockBtn, { borderColor: c.primary, backgroundColor: c.primary + '08' }]}
                          >
                            <MaterialIcons name="add" size={14} color={c.primary} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    {expandedId === item.id && (
                      <BatchList ingredientId={item.id} unit={item.unit} colors={c} />
                    )}

                    <View style={styles.itemFooterActions}>
                      <TouchableOpacity 
                        onPress={() => router.push({ pathname: '/add-ingredient', params: { id: item.id } })}
                        style={styles.footerActionBtn}
                      >
                        <MaterialIcons name="edit" size={16} color={c.textSecondary} />
                        <Text style={[styles.footerActionText, { color: c.textSecondary }]}>Edit Item</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleDelete(item.id, item.name)}
                        style={styles.footerActionBtn}
                      >
                        <MaterialIcons name="delete-outline" size={16} color={StatusColors.danger.accent} />
                        <Text style={[styles.footerActionText, { color: StatusColors.danger.accent }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </React.Fragment>
              );
            })
          )}
        </BentoCard>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function SummaryMetric({ value, label, color, muted }: { value: string; label: string; color: string; muted: string }) {
  return (
    <View style={styles.summaryMetric}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: muted }]}>{label}</Text>
    </View>
  );
}

function BatchList({ ingredientId, unit, colors }: { ingredientId: string; unit: string; colors: any }) {
  const { data: batches = [], isLoading } = useIngredientBatchesQuery(ingredientId);

  if (isLoading) return <ActivityIndicator size="small" color={colors.primary} style={{ margin: 10 }} />;
  if (batches.length === 0) return <Text style={{ padding: 10, color: colors.textTertiary, fontSize: 12 }}>No batch data found.</Text>;

  return (
    <View style={styles.batchListContainer}>
      <Text style={styles.batchSectionTitle}>Stock Batches</Text>
      {batches.map((batch: any) => {
        const isExpired = new Date(batch.expiry_date) < new Date();
        const isWarning = !isExpired && new Date(batch.expiry_date) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        
        return (
          <View key={batch.id} style={styles.batchRow}>
            <View style={styles.batchMain}>
              <MaterialIcons 
                name="event" 
                size={14} 
                color={isExpired ? colors.danger : isWarning ? '#f59e0b' : colors.textTertiary} 
              />
              <Text style={[styles.batchDate, { color: colors.textSecondary }]}>
                Exp: {new Date(batch.expiry_date).toLocaleDateString()}
              </Text>
            </View>
            <Text style={[styles.batchQty, { color: colors.text }]}>
              {batch.quantity} {unit}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: Layout.spacing.xl,
    paddingBottom: 140,
    paddingTop: Platform.OS === 'android' ? 8 : 0,
  },
  batchListContainer: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.md,
    marginTop: Layout.spacing.sm,
    marginBottom: Layout.spacing.sm,
  },
  batchSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  batchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  batchMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  batchDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  batchQty: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Header
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
  searchBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 8,
  },

  // Summary
  summaryCard: {
    marginBottom: Layout.spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryMetric: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  summaryDivider: {
    width: 1,
    height: 28,
  },

  // Category Chips
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Layout.spacing.lg,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Layout.radius.pill,
    borderWidth: 1,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipCount: {
    fontSize: 12,
    fontWeight: '500',
  },

  // List
  listCard: {
    padding: 0,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'column',
    padding: Layout.spacing.lg,
  },
  listDivider: {
    height: 1,
    marginLeft: 68,
  },
  itemIconBox: {
    width: 40,
    height: 40,
    borderRadius: Layout.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    paddingRight: 8,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemMeta: {
    fontSize: 12,
    fontWeight: '500',
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  itemStock: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  itemUnit: {
    fontSize: 12,
    fontWeight: '500',
  },
  itemRightColumn: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  itemMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemExpanded: {
    paddingBottom: Layout.spacing.sm,
  },
  batchToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },

  // Footer Actions
  itemFooterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Layout.spacing.lg,
    marginTop: Layout.spacing.md,
    paddingTop: Layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerActionText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Stock Control
  stockControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0,0,0,0.04)',
    padding: 2,
    borderRadius: Layout.radius.md,
  },
  stockBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockDisplay: {
    alignItems: 'center',
    minWidth: 40,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 4,
  },
});
