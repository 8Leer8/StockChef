import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';

import { useInventoryQuery, useLogWasteMutation } from '@/hooks/useInventory';
import { Colors, Layout, StatusColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const schema = z.object({
  ingredientId: z.string().min(1, 'Required'),
  quantity: z.string().min(1, 'Required').regex(/^\d+(\.\d+)?$/, 'Must be a valid number'),
  reason: z.enum(['Expired', 'Spoiled', 'Over-prepped', 'Quality Control', 'Other']),
});

type FormData = z.infer<typeof schema>;

const REASONS = ['Expired', 'Spoiled', 'Over-prepped', 'Quality Control', 'Other'];

export default function LogWasteModal() {
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];
  
  const { data: inventory = [] } = useInventoryQuery();
  const wasteMutation = useLogWasteMutation();

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      reason: 'Expired',
      quantity: '',
      ingredientId: '',
    }
  });

  const activeReason = watch('reason');
  const activeIngredientId = watch('ingredientId');

  const selectedIngredient = inventory.find(i => i.id === activeIngredientId);

  const onSubmit = (data: FormData) => {
    if (!selectedIngredient) return;

    const qty = parseFloat(data.quantity);
    
    // Check if the user is trying to waste more than they have
    if (qty > selectedIngredient.quantity) {
      alert("You cannot waste more than the current stock amount.");
      return;
    }

    wasteMutation.mutate({
      ingredient_id: data.ingredientId,
      ingredient_name: selectedIngredient.name,
      quantity_wasted: qty,
      reason: data.reason,
      financial_loss: qty * selectedIngredient.unit_price,
    }, {
      onSuccess: () => {
        router.back();
      },
      onError: (err: any) => {
        alert(err.message || 'Failed to log waste');
      }
    });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        style={styles.keyboard} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <MaterialIcons name="close" size={24} color={c.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: c.text }]}>Log Waste</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
          
          {/* Select Ingredient */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Select Ingredient</Text>
            {inventory.length === 0 ? (
                <Text style={{ color: c.textTertiary }}>No ingredients available.</Text>
            ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {inventory.map((item) => (
                    <TouchableOpacity
                    key={item.id}
                    onPress={() => setValue('ingredientId', item.id)}
                    style={[
                        styles.chip,
                        {
                        backgroundColor: activeIngredientId === item.id ? StatusColors.danger.accent : c.surface,
                        borderColor: activeIngredientId === item.id ? StatusColors.danger.accent : c.border,
                        }
                    ]}
                    >
                    <Text style={[styles.chipText, { color: activeIngredientId === item.id ? '#FFF' : c.text }]}>
                        {item.name} ({item.quantity} {item.unit} left)
                    </Text>
                    </TouchableOpacity>
                ))}
                </ScrollView>
            )}
            {errors.ingredientId && <Text style={[styles.error, { color: StatusColors.danger.accent }]}>{errors.ingredientId.message}</Text>}
          </View>

          {/* Quantity */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Quantity Wasted</Text>
            <Controller
              control={control}
              name="quantity"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: errors.quantity ? StatusColors.danger.accent : c.border }]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder={selectedIngredient ? `Max: ${selectedIngredient.quantity} ${selectedIngredient.unit}` : "0"}
                  keyboardType="numeric"
                  placeholderTextColor={c.textTertiary}
                />
              )}
            />
            {errors.quantity && <Text style={[styles.error, { color: StatusColors.danger.accent }]}>{errors.quantity.message}</Text>}
          </View>

          {/* Reason */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Reason</Text>
            <View style={styles.wrapRow}>
              {REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  onPress={() => setValue('reason', reason as any)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: activeReason === reason ? c.primary : c.surface,
                      borderColor: activeReason === reason ? c.primary : c.border,
                      marginBottom: 8,
                      marginRight: 8,
                    }
                  ]}
                >
                  <Text style={[styles.chipText, { color: activeReason === reason ? '#FFF' : c.text }]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

        </ScrollView>

        <View style={[styles.footer, { borderTopColor: c.border }]}>
          <TouchableOpacity 
            style={[styles.submitBtn, { backgroundColor: StatusColors.danger.accent, opacity: wasteMutation.isPending ? 0.7 : 1 }]} 
            onPress={handleSubmit(onSubmit)}
            disabled={wasteMutation.isPending}
          >
            <Text style={styles.submitText}>{wasteMutation.isPending ? 'Logging...' : 'Confirm Waste'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  keyboard: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.xl,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 4,
    marginLeft: -4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: {
    padding: Layout.spacing.xl,
    gap: Layout.spacing.lg,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: Layout.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginTop: -4,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Layout.radius.pill,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: Layout.spacing.xl,
    borderTopWidth: 1,
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: Layout.radius.lg,
    alignItems: 'center',
  },
  submitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
