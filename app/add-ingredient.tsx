import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';

import { useAddIngredientMutation, useInventoryQuery, useUpdateIngredientMutation, useAddBatchMutation, useStockOutMutation, useCategoriesQuery } from '@/hooks/useInventory';
import { Colors, Layout, StatusColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BentoCard } from '@/components/ui/BentoCard';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  totalQuantity: z.string().min(1, 'Required').regex(/^\d+(\.\d+)?$/, 'Must be a valid number'),
  unit: z.string().optional(),
  totalPrice: z.string().regex(/^\d+(\.\d+)?$/, 'Must be a valid price').optional().or(z.literal('')),
  expiryDays: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const FALLBACK_CATEGORIES = ['Produce', 'Meat', 'Dairy', 'Dry Goods', 'Beverages', 'Other'];

export default function AddIngredientModal() {
  const { id, mode } = useLocalSearchParams<{ id?: string, mode?: 'stock-in' | 'stock-out' }>();
  const isEditing = !!id;
  const isQuickStock = !!mode;
  
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];
  
  const { data: inventory = [] } = useInventoryQuery();
  const { data: dbCategories = [] } = useCategoriesQuery('ingredient');
  
  const categories = dbCategories.length > 0 ? dbCategories.map(c => c.name) : FALLBACK_CATEGORIES;

  const addMutation = useAddIngredientMutation();
  const updateMutation = useUpdateIngredientMutation();
  const addBatchMutation = useAddBatchMutation();
  const stockOutMutation = useStockOutMutation();

  const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: categories[0] || 'Produce',
      expiryDays: '7',
      totalQuantity: '',
      unit: 'kg',
      totalPrice: '',
    }
  });

  React.useEffect(() => {
    if (categories.length > 0 && !watch('category')) {
      setValue('category', categories[0]);
    }
  }, [categories]);

  React.useEffect(() => {
    if (isEditing && inventory.length > 0) {
      const item = inventory.find(i => i.id === id);
      if (item) {
        let initialQty = item.quantity.toString();
        let initialPrice = (item.quantity * item.unit_price).toString();
        
        if (mode === 'stock-in') {
          initialQty = '0';
          initialPrice = '0';
        } else if (mode === 'stock-out') {
          initialQty = '0';
          initialPrice = '0';
        }

        reset({
          name: item.name,
          category: item.category as any,
          totalQuantity: initialQty,
          unit: item.unit,
          totalPrice: initialPrice,
          expiryDays: item.expiry_date ? Math.ceil((new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)).toString() : '7',
        });
      }
    }
  }, [id, inventory, reset, mode]);

  const activeCategory = watch('category');

  const onSubmit = (data: FormData) => {
    const qtyInput = parseFloat(data.totalQuantity || '0');
    const priceInput = parseFloat(data.totalPrice || '0');
    const finalUnitPrice = qtyInput > 0 ? priceInput / qtyInput : 0;
    
    const expiryDays = parseInt(data.expiryDays || '7');
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (isNaN(expiryDays) ? 7 : expiryDays));

    if (mode === 'stock-in' && id) {
      addBatchMutation.mutate({
        ingredient_id: id,
        quantity: qtyInput,
        unit_price: isNaN(finalUnitPrice) ? 0 : finalUnitPrice,
        expiry_date: expiryDate.toISOString(),
      }, {
        onSuccess: () => router.back()
      });
      return;
    }

    if (mode === 'stock-out' && id) {
      stockOutMutation.mutate({
        ingredientId: id,
        quantity: qtyInput,
      }, {
        onSuccess: () => router.back(),
        onError: (err: any) => Alert.alert("Stock Out Error", err.message)
      });
      return;
    }

    const payload = {
      name: data.name || '',
      category: data.category || 'Other',
      quantity: 0, // Managed by batches for new items
      unit: data.unit || 'units',
      unit_price: isNaN(finalUnitPrice) ? 0 : finalUnitPrice,
      expiry_date: expiryDate.toISOString(),
    };

    if (isEditing && id) {
      updateMutation.mutate({ id, updates: payload }, {
        onSuccess: () => router.back()
      });
    } else {
      addMutation.mutate(payload, {
        onSuccess: (newIngredient) => {
          addBatchMutation.mutate({
            ingredient_id: newIngredient.id,
            quantity: qtyInput,
            unit_price: isNaN(finalUnitPrice) ? 0 : finalUnitPrice,
            expiry_date: expiryDate.toISOString(),
          }, {
            onSuccess: () => router.back()
          });
        }
      });
    }
  };

  const getTitle = () => {
    if (mode === 'stock-in') return 'Stock In';
    if (mode === 'stock-out') return 'Stock Out';
    return isEditing ? 'Edit Ingredient' : 'New Ingredient';
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
          <Text style={[styles.title, { color: c.text }]}>{getTitle()}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          
          {/* Name - Hide if stock-in or stock-out */}
          {mode !== 'stock-in' && mode !== 'stock-out' && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: c.textSecondary }]}>Ingredient Name</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: errors.name ? StatusColors.danger.accent : c.border }]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="e.g., Fresh Basil"
                    placeholderTextColor={c.textTertiary}
                  />
                )}
              />
              {errors.name && <Text style={[styles.error, { color: StatusColors.danger.accent }]}>{errors.name.message}</Text>}
            </View>
          )}

          {/* Category - Hide if stock-in or stock-out */}
          {mode !== 'stock-in' && mode !== 'stock-out' && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: c.textSecondary }]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setValue('category', cat as any)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: activeCategory === cat ? c.primary : c.surface,
                        borderColor: activeCategory === cat ? c.primary : c.border,
                      }
                    ]}
                  >
                    <Text style={[styles.chipText, { color: activeCategory === cat ? '#FFF' : c.text }]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Quantity & Unit */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 2 }]}>
              <Text style={[styles.label, { color: c.textSecondary }]}>
                {mode === 'stock-out' ? 'Quantity to Use' : mode === 'stock-in' ? 'New Stock Quantity' : 'Total Quantity'}
              </Text>
              <Controller
                control={control}
                name="totalQuantity"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: errors.totalQuantity ? StatusColors.danger.accent : c.border }]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="e.g., 5"
                    keyboardType="numeric"
                    placeholderTextColor={c.textTertiary}
                  />
                )}
              />
              {errors.totalQuantity && <Text style={[styles.error, { color: StatusColors.danger.accent }]}>{errors.totalQuantity.message}</Text>}
            </View>
            
            {mode !== 'stock-in' && mode !== 'stock-out' && (
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: c.textSecondary }]}>Unit</Text>
                <Controller
                  control={control}
                  name="unit"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: errors.unit ? StatusColors.danger.accent : c.border }]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="kg, btl"
                      placeholderTextColor={c.textTertiary}
                    />
                  )}
                />
                {errors.unit && <Text style={[styles.error, { color: StatusColors.danger.accent }]}>{errors.unit.message}</Text>}
              </View>
            )}
          </View>

          {/* Price - Hide if stock-out */}
          {mode !== 'stock-out' && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: c.textSecondary }]}>
                {mode === 'stock-in' ? 'Total Cost of this Batch (₱)' : 'Total Cost (₱)'}
              </Text>
            <Controller
              control={control}
              name="totalPrice"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: errors.totalPrice ? StatusColors.danger.accent : c.border }]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="e.g., 150.00"
                  keyboardType="numeric"
                  placeholderTextColor={c.textTertiary}
                />
              )}
            />
            {errors.totalPrice && <Text style={[styles.error, { color: StatusColors.danger.accent }]}>{errors.totalPrice.message}</Text>}
          </View>
          )}

          {/* Expiry - Hide if stock-out */}
          {mode !== 'stock-out' && (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Expires in (Days)</Text>
            <Controller
              control={control}
              name="expiryDays"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: errors.expiryDays ? StatusColors.danger.accent : c.border }]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="7"
                  keyboardType="numeric"
                  placeholderTextColor={c.textTertiary}
                />
              )}
            />
            {errors.expiryDays && <Text style={[styles.error, { color: StatusColors.danger.accent }]}>{errors.expiryDays.message}</Text>}
          </View>
          )}

        </ScrollView>

        <View style={[styles.footer, { borderTopColor: c.border }]}>
          <TouchableOpacity 
            style={[styles.submitBtn, { backgroundColor: c.primary, opacity: (addMutation.isPending || updateMutation.isPending || addBatchMutation.isPending || stockOutMutation.isPending) ? 0.7 : 1 }]} 
            onPress={handleSubmit(onSubmit)}
            disabled={addMutation.isPending || updateMutation.isPending || addBatchMutation.isPending || stockOutMutation.isPending}
          >
            <Text style={styles.submitText}>
              {(addMutation.isPending || updateMutation.isPending || addBatchMutation.isPending || stockOutMutation.isPending) 
                ? 'Saving...' 
                : (mode === 'stock-in' ? 'Stock In' : mode === 'stock-out' ? 'Stock Out' : (isEditing ? 'Save Changes' : 'Add Ingredient'))}
            </Text>
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
  row: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
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
