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
