import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BentoCard } from "@/components/ui/BentoCard";
import { PrimaryActionFab } from "@/components/ui/PrimaryActionFab";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Colors, Layout, StatusColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useProfileQuery } from "@/hooks/useInventory";

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const c = Colors[colorScheme];
  const router = useRouter();

  const {
    isLoading,
    totalInventoryValue,
    financialLoss,
    averageMargin,
    lowStockCount,
    criticalCount,
    expiringSoonItems,
    totalItems,
    inStockPercentage,
  } = useAnalytics();

  const { data: profile } = useProfileQuery();

  // Dynamic greeting
  const hour = new Date().getHours();
  const greetingPrefix =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dateStr = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  const displayName = profile?.display_name || "Fran";

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
              {greetingPrefix}, {displayName}!
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/settings')}
            style={[styles.avatarCircle, { backgroundColor: c.primary + "12" }]}
          >
            <MaterialIcons name="person" size={22} color={c.primary} />
          </TouchableOpacity>
        </View>

        {/* ── Hero Summary Card ─────────────────────── */}
        <BentoCard variant="highlight" style={[styles.heroCard, { backgroundColor: c.primary, borderColor: c.primary }]}>
          <View style={styles.heroTop}>
            <View>
              <Text style={[styles.heroLabel, { color: '#FFF', opacity: 0.8 }]}>Inventory Health</Text>
              <Text style={[styles.heroNumber, { color: '#FFF', fontSize: 32 }]}>{inStockPercentage}%</Text>
            </View>
            <StatusBadge 
              status={inStockPercentage > 90 ? "Good" : inStockPercentage > 70 ? "Warning" : "Critical"} 
              text={inStockPercentage > 90 ? "Healthy" : inStockPercentage > 70 ? "Stable" : "Low Stock"} 
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 0 }}
              textStyle={{ color: '#FFF' }}
            />
          </View>
          
          {/* Health Progress Bar */}
          <View style={styles.healthBarContainer}>
            <View style={[styles.healthBarBg, { backgroundColor: c.borderLight }]}>
              <View 
                style={[
                  styles.healthBarFill, 
                  { 
                    width: `${inStockPercentage}%`, 
                    backgroundColor: inStockPercentage > 80 ? '#4ade80' : inStockPercentage > 50 ? '#fbbf24' : '#f87171' 
                  }
                ]} 
              />
            </View>
          </View>

          <View style={[styles.heroDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
          
          <View style={styles.heroMetrics}>
            <View style={styles.heroMetric}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={[styles.heroNumber, { color: '#FFF', fontSize: 18 }]}>₱{totalInventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
              )}
              <Text style={[styles.heroLabel, { color: 'rgba(255,255,255,0.8)' }]}>Total Value</Text>
            </View>
            <View style={[styles.heroMetricDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={styles.heroMetric}>
              <Text style={[styles.heroNumber, { color: '#FFF', fontSize: 18 }]}>₱{financialLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
              <Text style={[styles.heroLabel, { color: 'rgba(255,255,255,0.8)' }]}>Waste Loss</Text>
            </View>
          </View>
        </BentoCard>

        {/* ── Metric Grid (2 columns) ─────────────── */}
        <View style={styles.gridRow}>
          <BentoCard style={styles.gridItem}>
            <View style={[styles.metricIcon, { backgroundColor: "#FFEBEE" }]}>
              <MaterialIcons name="warning-amber" size={20} color="#D32F2F" />
            </View>
            {isLoading ? (
              <ActivityIndicator size="small" color={c.primary} />
            ) : (
              <Text style={[styles.metricNumber, { color: c.text }]}>
                {lowStockCount + criticalCount}
              </Text>
            )}
            <Text style={[styles.metricLabel, { color: c.textSecondary }]}>
              Low/Critical Stock
            </Text>
            <StatusBadge status="Warning" text="Needs Restock" />
          </BentoCard>

          <BentoCard style={styles.gridItem}>
            <View
              style={[
                styles.metricIcon,
                { backgroundColor: averageMargin > 0 ? "#E8F5E9" : "#F5F5F5" },
              ]}
            >
              <MaterialIcons
                name="show-chart"
                size={20}
                color={averageMargin > 0 ? "#2E7D32" : "#9E9E9E"}
              />
            </View>
            {isLoading ? (
              <ActivityIndicator size="small" color={c.primary} />
            ) : (
              <Text style={[styles.metricNumber, { color: c.text }]}>
                {averageMargin > 0 ? `+${averageMargin.toFixed(1)}%` : "0%"}
              </Text>
            )}
            <Text style={[styles.metricLabel, { color: c.textSecondary }]}>
              Est. Margin
            </Text>
            <StatusBadge
              status={averageMargin > 0 ? "Good" : "Warning"}
              text={averageMargin > 0 ? "Trending Up" : "No Data"}
            />
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
            <TouchableOpacity
              onPress={() => router.push("/log-waste")}
              style={{
                backgroundColor: StatusColors.danger.accent,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: Layout.radius.pill,
              }}
            >
              <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "700" }}>
                Log Waste
              </Text>
            </TouchableOpacity>
          </View>

          {/* Alert Items */}
          <View style={styles.alertList}>
            {expiringSoonItems.length === 0 ? (
              <Text style={{ color: c.textTertiary, textAlign: 'center', paddingVertical: 20 }}>No items expiring soon.</Text>
            ) : (
              expiringSoonItems.map((item, index) => (
                <React.Fragment key={item.id}>
                  <AlertRow
                    name={item.name}
                    detail={`Expires ${new Date(item.expiry_date!).toLocaleDateString()}`}
                    icon="eco"
                    colors={c}
                  />
                  {index < expiringSoonItems.length - 1 && (
                    <View
                      style={[styles.alertDivider, { backgroundColor: c.borderLight }]}
                    />
                  )}
                </React.Fragment>
              ))
            )}
          </View>
        </BentoCard>

        {/* ── Quick Actions ─────────────────────────── */}
        <Text style={[styles.quickActionsTitle, { color: c.text }]}>
          Quick Actions
        </Text>
        <View style={styles.actionRow}>
          <ActionChip icon="inventory" label="Inventory" colors={c} onPress={() => router.push('/inventory')} />
          <ActionChip icon="restaurant-menu" label="Recipes" colors={c} onPress={() => router.push('/recipes')} />
          <ActionChip icon="add-circle" label="Add" colors={c} onPress={() => router.push('/add-ingredient')} />
          <ActionChip icon="history" label="History" colors={c} onPress={() => router.push('/history')} />
        </View>
      </ScrollView>

      {/* Main Floating Action Button */}
      <PrimaryActionFab
        icon="add"
        onPress={() => router.push("/add-ingredient")}
      />
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
  onPress,
}: {
  icon: string;
  label: string;
  colors: any;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
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
    </TouchableOpacity>
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

  // Hero Card Redesign Styles
  // Hero Card Styles
  heroCard: {
    marginBottom: Layout.spacing.lg,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.md,
  },
  healthBarContainer: {
    marginTop: 12,
    width: '100%',
  },
  healthBarBg: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  heroDivider: {
    height: 1,
    width: '100%',
    marginVertical: 20,
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
  heroMetricDivider: {
    width: 1,
    height: 24,
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
