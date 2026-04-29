import React from 'react';
import { StyleSheet, ScrollView, View, Text, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { BentoCard } from '@/components/ui/BentoCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Colors, Layout, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useInventoryQuery, Ingredient } from '@/hooks/useInventory';
import { useUIStore } from '@/store/useUIStore';

export default function InventoryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];
  
  const { activeCategory, setActiveCategory } = useUIStore();
  const { data: inventory = [], isLoading, isError, error } = useInventoryQuery();

  // Compute categories based on data
  const categories = React.useMemo(() => {
    const counts: Record<string, number> = { 'All': inventory.length };
    inventory.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ id: key, label: key, count: counts[key] }));
  }, [inventory]);

  const filteredInventory = React.useMemo(() => {
    if (activeCategory === 'All') return inventory;
    return inventory.filter(item => item.category === activeCategory);
  }, [inventory, activeCategory]);

  const totalItems = inventory.reduce((acc, item) => acc + item.quantity, 0);
  const inStockPercentage = inventory.length > 0 
    ? Math.round((inventory.filter(item => item.quantity > 0).length / inventory.length) * 100) 
    : 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────── */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: c.text }]}>Inventory</Text>
          <View style={[styles.searchBtn, { backgroundColor: c.surface, borderColor: c.border }]}>
            <MaterialIcons name="search" size={20} color={c.textSecondary} />
          </View>
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
              <View
                key={cat.id}
                onTouchEnd={() => setActiveCategory(cat.id)}
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
              </View>
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
              
              // We could use category logic to determine icon, but for now we'll default to 'eco'
              const icon = item.category === 'Produce' ? 'eco' : item.category === 'Dairy' ? 'water-drop' : item.category === 'Meat' ? 'set-meal' : 'inventory-2';

              return (
                <React.Fragment key={item.id}>
                  {idx > 0 && <View style={[styles.listDivider, { backgroundColor: c.borderLight }]} />}
                  <View style={styles.listItem}>
                    <View style={[styles.itemIconBox, { backgroundColor: c.primary + '10' }]}>
                      <MaterialIcons name={icon as any} size={20} color={c.primary} />
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemName, { color: c.text }]}>{item.name}</Text>
                      <Text style={[styles.itemMeta, { color: c.textTertiary }]}>{item.category}</Text>
                    </View>
                    <View style={styles.itemRight}>
                      <Text style={[styles.itemStock, { color: c.text }]}>
                        {item.quantity} <Text style={[styles.itemUnit, { color: c.textTertiary }]}>{item.unit}</Text>
                      </Text>
                      <StatusBadge status={status} text={statusText} />
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

// ── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: Layout.spacing.xl,
    paddingBottom: 140,
    paddingTop: Platform.OS === 'android' ? 8 : 0,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.xl,
    paddingVertical: Layout.spacing.lg,
    gap: Layout.spacing.md,
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
});
