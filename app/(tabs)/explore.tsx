import React from 'react';
import { StyleSheet, ScrollView, View, Text, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { BentoCard } from '@/components/ui/BentoCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Colors, Layout, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ── Mock Data ─────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all', label: 'All', count: 156 },
  { id: 'produce', label: 'Produce', count: 42 },
  { id: 'dairy', label: 'Dairy', count: 28 },
  { id: 'meat', label: 'Meat', count: 35 },
  { id: 'dry', label: 'Dry Goods', count: 51 },
];

const INVENTORY = [
  { id: '1', name: 'Avocados (Hass)',    stock: 45,  unit: 'pcs', status: 'Good' as const,     statusText: 'In Stock',     icon: 'eco',        cat: 'Produce' },
  { id: '2', name: 'Fresh Whole Milk',   stock: 12,  unit: 'L',   status: 'Warning' as const,  statusText: 'Low Stock',    icon: 'water-drop', cat: 'Dairy' },
  { id: '3', name: 'Atlantic Salmon',    stock: 0,   unit: 'kg',  status: 'Critical' as const,  statusText: 'Out of Stock', icon: 'set-meal',   cat: 'Meat' },
  { id: '4', name: 'Sourdough Buns',     stock: 120, unit: 'pcs', status: 'Good' as const,     statusText: 'In Stock',     icon: 'bakery-dining', cat: 'Dry Goods' },
  { id: '5', name: 'Truffle Oil',        stock: 2,   unit: 'btl', status: 'Warning' as const,  statusText: 'Low Stock',    icon: 'local-dining', cat: 'Dry Goods' },
  { id: '6', name: 'Organic Eggs',       stock: 60,  unit: 'pcs', status: 'Good' as const,     statusText: 'In Stock',     icon: 'egg',        cat: 'Dairy' },
];

export default function InventoryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];
  const [activeCategory, setActiveCategory] = React.useState('all');

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
            <SummaryMetric value="1,204" label="Total Items" color={c.text} muted={c.textSecondary} />
            <View style={[styles.summaryDivider, { backgroundColor: c.border }]} />
            <SummaryMetric value="18" label="Categories" color={c.text} muted={c.textSecondary} />
            <View style={[styles.summaryDivider, { backgroundColor: c.border }]} />
            <SummaryMetric value="96%" label="In Stock" color={c.primary} muted={c.textSecondary} />
          </View>
        </BentoCard>

        {/* ── Category Chips ───────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <View
                key={cat.id}
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
          {INVENTORY.map((item, idx) => (
            <React.Fragment key={item.id}>
              {idx > 0 && <View style={[styles.listDivider, { backgroundColor: c.borderLight }]} />}
              <View style={styles.listItem}>
                <View style={[styles.itemIconBox, { backgroundColor: c.primary + '10' }]}>
                  <MaterialIcons name={item.icon as any} size={20} color={c.primary} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: c.text }]}>{item.name}</Text>
                  <Text style={[styles.itemMeta, { color: c.textTertiary }]}>{item.cat}</Text>
                </View>
                <View style={styles.itemRight}>
                  <Text style={[styles.itemStock, { color: c.text }]}>
                    {item.stock} <Text style={[styles.itemUnit, { color: c.textTertiary }]}>{item.unit}</Text>
                  </Text>
                  <StatusBadge status={item.status} text={item.statusText} />
                </View>
              </View>
            </React.Fragment>
          ))}
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
