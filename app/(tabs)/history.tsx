import React from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useHistoryQuery } from '@/hooks/useInventory';

import { BentoCard } from '@/components/ui/BentoCard';
import { Colors, Layout, StatusColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HistoryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];

  const { data: logs = [], isLoading } = useHistoryQuery();

  const getMovementStyle = (type: string) => {
    switch(type) {
      case 'STOCK_IN': return { icon: 'add-circle-outline', color: c.primary, label: 'Stock In', bg: c.primary + '15' };
      case 'STOCK_OUT': return { icon: 'remove-circle-outline', color: c.textSecondary, label: 'Stock Out', bg: c.border };
      case 'WASTE': return { icon: 'delete-sweep', color: StatusColors.danger.accent, label: 'Waste', bg: StatusColors.danger.bg };
      case 'ADJUSTMENT': return { icon: 'settings-backup-restore', color: '#f59e0b', label: 'Adjustment', bg: '#fef3c7' };
      default: return { icon: 'history', color: c.textTertiary, label: 'Event', bg: c.border };
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: c.text }]}>Inventory History</Text>
          <View style={[styles.badge, { backgroundColor: c.primary + '15' }]}>
            <Text style={[styles.badgeText, { color: c.primary }]}>LOGS</Text>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={c.primary} style={{ marginTop: 40 }} />
        ) : logs.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="history" size={64} color={c.border} />
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>No history records found.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {logs.map((log: any) => {
              const style = getMovementStyle(log.type);
              return (
                <BentoCard key={log.id} style={styles.logCard}>
                  <View style={styles.logHeader}>
                    <View style={[styles.iconWrap, { backgroundColor: style.bg }]}>
                      <MaterialIcons name={style.icon as any} size={20} color={style.color} />
                    </View>
                    <View style={styles.logInfo}>
                      <Text style={[styles.ingredientName, { color: c.text }]}>{log.ingredient_name}</Text>
                      <Text style={[styles.logDate, { color: c.textTertiary }]}>
                        {new Date(log.created_at).toLocaleDateString()} at {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <Text style={[styles.lossValue, { color: style.color }]}>
                      {log.type === 'STOCK_IN' ? '+' : '-'}{log.quantity}
                    </Text>
                  </View>
                  
                  <View style={[styles.divider, { backgroundColor: c.borderLight }]} />
                  
                  <View style={styles.logFooter}>
                    <Text style={[styles.footerText, { color: c.textSecondary }]}>
                      Type: <Text style={{ color: c.text, fontWeight: '600' }}>{style.label}</Text>
                    </Text>
                    {log.reason ? (
                      <View style={[styles.reasonBadge, { backgroundColor: c.border }]}>
                        <Text style={[styles.reasonText, { color: c.textSecondary }]}>{log.reason}</Text>
                      </View>
                    ) : (
                       <Text style={[styles.footerText, { color: c.textTertiary, fontSize: 11 }]}>{log.unit || 'units'}</Text>
                    )}
                  </View>
                </BentoCard>
              );
            })}
          </View>
        )}
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
    alignItems: 'center',
    gap: 12,
    marginBottom: Layout.spacing.xxl,
    marginTop: Layout.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  list: {
    gap: Layout.spacing.md,
  },
  logCard: {
    padding: Layout.spacing.md,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF1F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  logDate: {
    fontSize: 12,
  },
  lossValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  logFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
  },
  reasonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Layout.radius.sm,
  },
  reasonText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
