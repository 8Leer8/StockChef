import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addBatch,
  addCategory,
  addIngredient,
  addRecipe,
  deleteCategory,
  deleteIngredient,
  deleteRecipe,
  getBatches,
  getCategories,
  getHistory,
  getInventory,
  getProfile,
  getRecipes,
  logWaste,
  stockOut,
  updateIngredient,
  updateProfile,
} from '@/lib/mockData';

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
      const data = getInventory();
      return data as Ingredient[];
    },
  });
}
export function useRecipesQuery() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      return getRecipes();
    },
  });
}
export function useAddIngredientMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newIngredient: Omit<Ingredient, 'id'>) => {
      return addIngredient(newIngredient);
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
      deleteIngredient(id);
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
      return logWaste(wasteLog);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['waste_logs'] });
      queryClient.invalidateQueries({ queryKey: ['inventory_history'] });
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
      return addRecipe({ recipe, ingredients });
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
      const updated = updateIngredient(id, updates);
      if (!updated) {
        throw new Error('Ingredient not found');
      }
      return updated;
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
      deleteRecipe(id);
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
      return getBatches(ingredientId);
    },
    enabled: !!ingredientId,
  });
}

export function useAddBatchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (batch: any) => {
      return addBatch(batch);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['inventory_history'] });
    },
  });
}

export function useStockOutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ingredientId, quantity }: { ingredientId: string; quantity: number }) => {
      stockOut(ingredientId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['inventory_history'] });
    },
  });
}

export function useCategoriesQuery(type: 'ingredient' | 'recipe') {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: async () => {
      return getCategories(type);
    },
  });
}

export function useAddCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: { name: string, type: 'ingredient' | 'recipe' }) => {
      return addCategory(category);
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
      deleteCategory(id);
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
      return getProfile();
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: { id: string, display_name: string }) => {
      const updated = updateProfile(updates);
      if (!updated) throw new Error('Profile not found');
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useHistoryQuery() {
  return useQuery({
    queryKey: ['inventory_history'],
    queryFn: async () => getHistory(),
  });
}
