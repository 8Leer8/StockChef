import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Ingredient {
  id: string;
  user_id?: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unit_price: number;
  expiry_date: string;
}

export function useInventoryQuery() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        throw new Error(error.message);
      }
      return data as Ingredient[];
    },
  });
}
export function useRecipesQuery() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
}
export function useAddIngredientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newIngredient: Omit<Ingredient, 'id'>) => {
      const { data, error } = await supabase
        .from('ingredients')
        .insert([newIngredient])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

// Optional: For deleting
export function useDeleteIngredientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useLogWasteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (wasteLog: { ingredient_id: string, ingredient_name: string, quantity_wasted: number, reason: string, financial_loss: number }) => {
      // 1. Insert waste log
      const { data: logData, error: logError } = await supabase
        .from('waste_logs')
        .insert([wasteLog])
        .select()
        .single();

      if (logError) throw new Error(logError.message);

      // 2. Fetch current ingredient to update its quantity
      const { data: ingData, error: ingError } = await supabase
        .from('ingredients')
        .select('quantity')
        .eq('id', wasteLog.ingredient_id)
        .single();
      
      if (ingError) throw new Error(ingError.message);

      // 3. Update quantity
      const newQty = Math.max(0, ingData.quantity - wasteLog.quantity_wasted);
      const { error: updateError } = await supabase
        .from('ingredients')
        .update({ quantity: newQty })
        .eq('id', wasteLog.ingredient_id);

      if (updateError) throw new Error(updateError.message);

      return logData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['waste_logs'] });
    },
  });
}

export function useAddRecipeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recipe, ingredients }: { 
      recipe: { name: string, category: string, selling_price: number, target_margin_percentage: number },
      ingredients: { ingredient_id: string, quantity_required: number }[]
    }) => {
      // 1. Insert recipe
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .insert([recipe])
        .select()
        .single();

      if (recipeError) throw new Error(recipeError.message);

      // 2. Insert recipe ingredients
      const r_ingredients = ingredients.map(ing => ({
        ...ing,
        recipe_id: recipeData.id
      }));

      const { error: riError } = await supabase
        .from('recipe_ingredients')
        .insert(r_ingredients);

      if (riError) throw new Error(riError.message);

      return recipeData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}
export function useUpdateIngredientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Ingredient> }) => {
      const { data, error } = await supabase
        .from('ingredients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useDeleteRecipeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}

export function useIngredientBatchesQuery(ingredientId: string | undefined) {
  return useQuery({
    queryKey: ['batches', ingredientId],
    queryFn: async () => {
      if (!ingredientId) return [];
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('ingredient_id', ingredientId)
        .order('expiry_date', { ascending: true });
      
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!ingredientId,
  });
}

export function useAddBatchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (batch: any) => {
      const { data, error } = await supabase
        .from('batches')
        .insert([batch])
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });
}

export function useStockOutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ingredientId, quantity }: { ingredientId: string; quantity: number }) => {
      // Fetch batches for this ingredient, ordered by expiry date (FIFO)
      const { data: batches, error: fetchError } = await supabase
        .from('batches')
        .select('*')
        .eq('ingredient_id', ingredientId)
        .order('expiry_date', { ascending: true });

      if (fetchError) throw new Error(fetchError.message);
      
      let remainingToSubtract = quantity;
      const updates = [];
      const deletes = [];

      for (const batch of batches) {
        if (remainingToSubtract <= 0) break;

        if (batch.quantity <= remainingToSubtract) {
          remainingToSubtract -= batch.quantity;
          deletes.push(batch.id);
        } else {
          updates.push({ id: batch.id, quantity: batch.quantity - remainingToSubtract });
          remainingToSubtract = 0;
        }
      }

      if (remainingToSubtract > 0) {
        throw new Error(`Insufficient stock in batches. Remaining: ${remainingToSubtract}`);
      }

      // Execute updates and deletes
      if (deletes.length > 0) {
        await supabase.from('batches').delete().in('id', deletes);
      }
      for (const update of updates) {
        await supabase.from('batches').update({ quantity: update.quantity }).eq('id', update.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });
}

export function useCategoriesQuery(type: 'ingredient' | 'recipe') {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', type)
        .order('name', { ascending: true });
      
      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useAddCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: { name: string, type: 'ingredient' | 'recipe' }) => {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.type] });
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, type }: { id: string, type: 'ingredient' | 'recipe' }) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories', variables.type] });
    },
  });
}

export function useProfileQuery() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: { id: string, display_name: string }) => {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ display_name: updates.display_name, updated_at: new Date().toISOString() })
        .eq('id', updates.id)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
