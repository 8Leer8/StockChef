import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BentoCard } from "@/components/ui/BentoCard";
import { PrimaryActionFab } from "@/components/ui/PrimaryActionFab";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Colors, Layout } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useInventoryQuery, useAddIngredientMutation } from "@/hooks/useInventory";

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const c = Colors[colorScheme];

  const { data: inventory = [], isLoading } = useInventoryQuery();
  const addMutation = useAddIngredientMutation();

  const handleAddMockItem = () => {
    addMutation.mutate({
      name: 'Fresh Basil',
      category: 'Produce',
      quantity: 10,
      unit: 'bunch',
      unit_price: 2.50,
      expiry_date: new Date(Date.now() + 86400000 * 5).toISOString()
    });
  };

  const totalItems = inventory.reduce((acc, item) => acc + item.quantity, 0);
  const inStockPercentage = inventory.length > 0 
    ? Math.round((inventory.filter(item => item.quantity > 0).length / inventory.length) * 100) 
    : 0;
  
  const lowStockCount = inventory.filter(item => item.quantity > 0 && item.quantity < 5).length;
  const criticalCount = inventory.filter(item => item.quantity === 0).length;

  // Dynamic greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dateStr = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: c.background }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.dateLabel, { color: c.primary }]}>
              {dateStr}
            </Text>
            <Text style={[styles.greeting, { color: c.text }]}>
              {greeting}, Fran!
            </Text>
          </View>
          <View
            style={[styles.avatarCircle, { backgroundColor: c.primary + "12" }]}
          >
            <MaterialIcons name="person" size={22} color={c.primary} />
          </View>
        </View>

        {/* ── Hero Summary Card ─────────────────────── */}
        <BentoCard variant="highlight" style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View
              style={[
                styles.heroIconBox,
                { backgroundColor: c.primary + "20" },
              ]}
            >
              <MaterialIcons name="trending-up" size={20} color={c.primary} />
            </View>
            <StatusBadge status="Good" text="All Systems Go" />
          </View>
          <Text style={[styles.heroTitle, { color: c.text }]}>
            Inventory Health
          </Text>
          <View style={styles.heroMetrics}>
            <View style={styles.heroMetric}>
              {isLoading ? <ActivityIndicator size="small" color={c.primary} /> : <Text style={[styles.heroNumber, { color: c.primary }]}>{inStockPercentage}%</Text>}
              <Text style={[styles.heroLabel, { color: c.textSecondary }]}>
                Stock Level
              </Text>
            </View>
            <View style={[styles.heroDivider, { backgroundColor: c.border }]} />
            <View style={styles.heroMetric}>
              <Text style={[styles.heroNumber, { color: c.primary }]}>
                ↓ 3%
              </Text>
              <Text style={[styles.heroLabel, { color: c.textSecondary }]}>
                Waste Rate
              </Text>
            </View>
            <View style={[styles.heroDivider, { backgroundColor: c.border }]} />
            <View style={styles.heroMetric}>
              <Text style={[styles.heroNumber, { color: c.primary }]}>
                ₱24k
              </Text>
              <Text style={[styles.heroLabel, { color: c.textSecondary }]}>
                Saved
              </Text>
            </View>
          </View>
        </BentoCard>

        {/* ── Metric Grid (2 columns) ─────────────── */}
        <View style={styles.gridRow}>
          <BentoCard style={styles.gridItem}>
            <View style={[styles.metricIcon, { backgroundColor: "#FFEBEE" }]}>
              <MaterialIcons name="warning-amber" size={20} color="#D32F2F" />
            </View>
            {isLoading ? <ActivityIndicator size="small" color={c.primary} /> : <Text style={[styles.metricNumber, { color: c.text }]}>{lowStockCount + criticalCount}</Text>}
            <Text style={[styles.metricLabel, { color: c.textSecondary }]}>
              Low/Critical Stock
            </Text>
            <StatusBadge status="Warning" text="Needs Restock" />
          </BentoCard>

          <BentoCard style={styles.gridItem}>
            <View style={[styles.metricIcon, { backgroundColor: "#E8F5E9" }]}>
              <MaterialIcons name="show-chart" size={20} color="#2E7D32" />
            </View>
            <Text style={[styles.metricNumber, { color: c.text }]}>+15%</Text>
            <Text style={[styles.metricLabel, { color: c.textSecondary }]}>
              Est. Margin
            </Text>
            <StatusBadge status="Good" text="Trending Up" />
          </BentoCard>
        </View>

        {/* ── Expiry Alerts ─────────────────────────── */}
        <BentoCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.metricIcon, { backgroundColor: "#FFEBEE" }]}>
                <MaterialIcons name="schedule" size={18} color="#D32F2F" />
              </View>
              <Text style={[styles.sectionTitle, { color: c.text }]}>
                Expiry Alerts
              </Text>
            </View>
            <StatusBadge status="Critical" text="2 Items" />
          </View>

          {/* Alert Items */}
          <View style={styles.alertList}>
            <AlertRow
              name="Fresh Basil"
              detail="Expires tomorrow"
              icon="eco"
              colors={c}
            />
            <View
              style={[styles.alertDivider, { backgroundColor: c.borderLight }]}
            />
            <AlertRow
              name="Heavy Cream"
              detail="Expires in 2 days"
              icon="water-drop"
              colors={c}
            />
          </View>
        </BentoCard>

        {/* ── Quick Actions ─────────────────────────── */}
        <Text style={[styles.quickActionsTitle, { color: c.text }]}>
          Quick Actions
        </Text>
        <View style={styles.actionRow}>
          <ActionChip icon="qr-code-scanner" label="Scan" colors={c} />
          <ActionChip icon="add-shopping-cart" label="Restock" colors={c} />
          <ActionChip icon="receipt-long" label="Recipes" colors={c} />
          <ActionChip icon="insights" label="Reports" colors={c} />
        </View>
      </ScrollView>

      <PrimaryActionFab icon="add" onPress={handleAddMockItem} />
    </SafeAreaView>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function AlertRow({
  name,
  detail,
  icon,
  colors,
}: {
  name: string;
  detail: string;
  icon: string;
  colors: any;
}) {
  return (
    <View style={styles.alertRow}>
      <View style={[styles.alertIconBox, { backgroundColor: "#FFEBEE" }]}>
        <MaterialIcons name={icon as any} size={18} color="#D32F2F" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.alertName, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.alertDetail, { color: colors.textTertiary }]}>
          {detail}
        </Text>
      </View>
      <MaterialIcons
        name="chevron-right"
        size={20}
        color={colors.textTertiary}
      />
    </View>
  );
}

function ActionChip({
  icon,
  label,
  colors,
}: {
  icon: string;
  label: string;
  colors: any;
}) {
  return (
    <View
      style={[
        styles.actionChip,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View
        style={[
          styles.actionChipIcon,
          { backgroundColor: colors.primary + "10" },
        ]}
      >
        <MaterialIcons name={icon as any} size={20} color={colors.primary} />
      </View>
      <Text style={[styles.actionChipLabel, { color: colors.text }]}>
        {label}
      </Text>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: Layout.spacing.xl,
    paddingBottom: 140,
    paddingTop: Platform.OS === "android" ? 8 : 0,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Layout.spacing.xxl,
    marginTop: Layout.spacing.md,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  // Hero Card
  heroCard: {
    marginBottom: Layout.spacing.lg,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Layout.spacing.md,
  },
  heroIconBox: {
    width: 36,
    height: 36,
    borderRadius: Layout.radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Layout.spacing.lg,
    letterSpacing: -0.3,
  },
  heroMetrics: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroMetric: {
    flex: 1,
    alignItems: "center",
  },
  heroNumber: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  heroDivider: {
    width: 1,
    height: 32,
  },

  // Grid
  gridRow: {
    flexDirection: "row",
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  gridItem: {
    flex: 1,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: Layout.radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Layout.spacing.md,
  },
  metricNumber: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -1,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: Layout.spacing.sm,
  },

  // Section Card
  sectionCard: {
    marginBottom: Layout.spacing.xxl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Layout.spacing.lg,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.2,
  },

  // Alert list
  alertList: {},
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Layout.spacing.md,
    gap: Layout.spacing.md,
  },
  alertIconBox: {
    width: 36,
    height: 36,
    borderRadius: Layout.radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  alertName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  alertDetail: {
    fontSize: 12,
    fontWeight: "500",
  },
  alertDivider: {
    height: 1,
    marginLeft: 48,
  },

  // Quick Actions
  quickActionsTitle: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.2,
    marginBottom: Layout.spacing.md,
  },
  actionRow: {
    flexDirection: "row",
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.lg,
  },
  actionChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.radius.lg,
    borderWidth: 1,
    gap: 6,
  },
  actionChipIcon: {
    width: 36,
    height: 36,
    borderRadius: Layout.radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  actionChipLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
