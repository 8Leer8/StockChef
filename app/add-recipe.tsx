import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';

import { useInventoryQuery, useAddRecipeMutation, useCategoriesQuery } from '@/hooks/useInventory';
import { Colors, Layout, StatusColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  category: z.string().min(1, 'Required'),
  sellingPrice: z.string().min(1, 'Required').regex(/^\d+(\.\d+)?$/, 'Must be a valid price'),
  targetMargin: z.string().min(1, 'Required').regex(/^\d+$/, 'Target margin %'),
});

type FormData = z.infer<typeof schema>;

const FALLBACK_CATEGORIES = ['Mains', 'Appetizers', 'Desserts', 'Drinks'];

export default function AddRecipeModal() {
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];
  
  const { data: inventory = [] } = useInventoryQuery();
  const { data: dbCategories = [] } = useCategoriesQuery('recipe');
  const addRecipeMutation = useAddRecipeMutation();

  const categories = dbCategories.length > 0 ? dbCategories.map(cat => cat.name) : FALLBACK_CATEGORIES;

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: categories[0] || 'Mains',
      name: '',
      sellingPrice: '',
      targetMargin: '70',
    }
  });

  React.useEffect(() => {
    if (categories.length > 0 && !watch('category')) {
      setValue('category', categories[0]);
    }
  }, [categories]);

  const activeCategory = watch('category');

  // State to hold selected ingredients for this recipe
  const [recipeIngredients, setRecipeIngredients] = useState<{ingredient_id: string, quantity_required: number}[]>([]);
  const [selectedIngId, setSelectedIngId] = useState<string>('');
  const [ingQty, setIngQty] = useState<string>('');

  const handleAddIngredientToRecipe = () => {
    if (!selectedIngId || !ingQty) return;
    const parsedQty = parseFloat(ingQty);
    if (isNaN(parsedQty) || parsedQty <= 0) return;

    setRecipeIngredients([...recipeIngredients, { ingredient_id: selectedIngId, quantity_required: parsedQty }]);
    setSelectedIngId('');
    setIngQty('');
  };

  const handleRemoveIngredient = (index: number) => {
    const newArr = [...recipeIngredients];
    newArr.splice(index, 1);
    setRecipeIngredients(newArr);
  };

  const onSubmit = (data: FormData) => {
    if (recipeIngredients.length === 0) {
      alert("Please add at least one ingredient to the recipe.");
      return;
    }

    addRecipeMutation.mutate({
      recipe: {
        name: data.name,
        category: data.category,
        selling_price: parseFloat(data.sellingPrice),
        target_margin_percentage: parseFloat(data.targetMargin),
      },
      ingredients: recipeIngredients,
    }, {
      onSuccess: () => {
        router.back();
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
          <Text style={[styles.title, { color: c.text }]}>New Recipe</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          
          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Recipe Name</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: errors.name ? StatusColors.danger.accent : c.border }]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="e.g., Margherita Pizza"
                  placeholderTextColor={c.textTertiary}
                />
              )}
            />
            {errors.name && <Text style={[styles.error, { color: StatusColors.danger.accent }]}>{errors.name.message}</Text>}
          </View>

          {/* Category */}
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

          {/* Selling Price & Margin */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 2 }]}>
              <Text style={[styles.label, { color: c.textSecondary }]}>Selling Price (₱)</Text>
              <Controller
                control={control}
                name="sellingPrice"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: errors.sellingPrice ? StatusColors.danger.accent : c.border }]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="e.g., 450.00"
                    keyboardType="numeric"
                    placeholderTextColor={c.textTertiary}
                  />
                )}
              />
              {errors.sellingPrice && <Text style={[styles.error, { color: StatusColors.danger.accent }]}>{errors.sellingPrice.message}</Text>}
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: c.textSecondary }]}>Target Margin %</Text>
              <Controller
                control={control}
                name="targetMargin"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: errors.targetMargin ? StatusColors.danger.accent : c.border }]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="70"
                    keyboardType="numeric"
                    placeholderTextColor={c.textTertiary}
                  />
                )}
              />
              {errors.targetMargin && <Text style={[styles.error, { color: StatusColors.danger.accent }]}>{errors.targetMargin.message}</Text>}
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: c.border }]} />

          {/* Recipe Ingredients Builder */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: c.textSecondary, fontSize: 16 }]}>Recipe Ingredients</Text>
            
            {/* Added Ingredients List */}
            {recipeIngredients.length > 0 && (
              <View style={[styles.addedIngredientsContainer, { borderColor: c.borderLight, backgroundColor: c.surface }]}>
                {recipeIngredients.map((ri, idx) => {
                  const item = inventory.find(i => i.id === ri.ingredient_id);
                  return (
                    <View key={idx} style={[styles.addedIngredientRow, { borderBottomColor: c.borderLight }]}>
                      <Text style={{ color: c.text, flex: 1 }}>{item?.name || 'Unknown'}</Text>
                      <Text style={{ color: c.textSecondary, marginRight: 12 }}>{ri.quantity_required} {item?.unit}</Text>
                      <TouchableOpacity onPress={() => handleRemoveIngredient(idx)}>
                        <MaterialIcons name="remove-circle-outline" size={20} color={StatusColors.danger.accent} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Add ingredient controls */}
            <Text style={[styles.label, { color: c.textTertiary, marginTop: 8 }]}>Add to recipe:</Text>
            {inventory.length === 0 ? (
                <Text style={{ color: c.textTertiary }}>No inventory items to add.</Text>
            ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                  {inventory.map((item) => {
                    const isAlreadyAdded = recipeIngredients.some(ri => ri.ingredient_id === item.id);
                    if (isAlreadyAdded) return null;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => setSelectedIngId(item.id)}
                        style={[
                            styles.chip,
                            {
                            backgroundColor: selectedIngId === item.id ? c.primary : c.surface,
                            borderColor: selectedIngId === item.id ? c.primary : c.border,
                            }
                        ]}
                      >
                        <Text style={[styles.chipText, { color: selectedIngId === item.id ? '#FFF' : c.text }]}>
                            {item.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
            )}
            
            {selectedIngId !== '' && (
              <View style={[styles.row, { alignItems: 'flex-end', marginTop: 8 }]}>
                <View style={{ flex: 1, gap: 8 }}>
                  <Text style={[styles.label, { color: c.textSecondary }]}>Required Qty</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
                    onChangeText={setIngQty}
                    value={ingQty}
                    placeholder="e.g., 0.2"
                    keyboardType="numeric"
                    placeholderTextColor={c.textTertiary}
                  />
                </View>
                <TouchableOpacity 
                  style={[styles.addIngBtn, { backgroundColor: c.borderLight }]}
                  onPress={handleAddIngredientToRecipe}
                >
                  <Text style={{ color: c.text, fontWeight: '600' }}>Add</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

        </ScrollView>

        <View style={[styles.footer, { borderTopColor: c.border }]}>
          <TouchableOpacity 
            style={[styles.submitBtn, { backgroundColor: c.primary, opacity: addRecipeMutation.isPending ? 0.7 : 1 }]} 
            onPress={handleSubmit(onSubmit)}
            disabled={addRecipeMutation.isPending}
          >
            <Text style={styles.submitText}>{addRecipeMutation.isPending ? 'Saving...' : 'Create Recipe'}</Text>
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
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 8,
  },
  addedIngredientsContainer: {
    borderWidth: 1,
    borderRadius: Layout.radius.md,
    padding: 12,
    gap: 8,
  },
  addedIngredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  addIngBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: Layout.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
