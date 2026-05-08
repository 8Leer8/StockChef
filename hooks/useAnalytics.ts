import { useQuery } from '@tanstack/react-query';
import { getRecipesWithIngredients, getWasteLogs } from '@/lib/mockData';
import { Ingredient, useInventoryQuery } from './useInventory';

export function useAnalytics() {
  const { data: inventory = [], isLoading: isInvLoading } = useInventoryQuery();

  // Fetch all waste logs
  const { data: wasteLogs = [], isLoading: isWasteLoading } = useQuery({
    queryKey: ['waste_logs'],
    queryFn: async () => {
      return getWasteLogs();
    }
  });

  // Fetch all recipes with their ingredients
  const { data: recipes = [], isLoading: isRecipesLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      return getRecipesWithIngredients();
    }
  });

  const isLoading = isInvLoading || isWasteLoading || isRecipesLoading;

  // 1. Total Inventory Value
  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  // 2. Financial Loss (Waste)
  const financialLoss = wasteLogs.reduce((sum, log) => sum + Number(log.financial_loss || 0), 0);

  // 3. Est. Margin
  // Calculate average margin across all recipes based on current ingredient costs
  let totalMargin = 0;
  let recipeCount = 0;

  recipes.forEach(recipe => {
    let recipeCost = 0;
    
    // Sum up the cost of ingredients
    recipe.recipe_ingredients.forEach((ri: any) => {
      const ingredient = inventory.find(i => i.id === ri.ingredient_id);
      if (ingredient) {
        recipeCost += (ingredient.unit_price * ri.quantity_required);
      }
    });

    if (recipe.selling_price > 0) {
      const margin = ((recipe.selling_price - recipeCost) / recipe.selling_price) * 100;
      totalMargin += margin;
      recipeCount++;
    }
  });

  const averageMargin = recipeCount > 0 ? (totalMargin / recipeCount) : 0;

  // 4. Stock Levels
  const lowStockCount = inventory.filter(item => item.quantity > 0 && item.quantity < 5).length;
  const criticalCount = inventory.filter(item => item.quantity === 0).length;

  // 5. Expiring Soon (Next 7 days)
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);

  const expiringSoonItems = inventory
    .filter(item => {
      if (!item.expiry_date) return false;
      const expiry = new Date(item.expiry_date);
      return expiry > now && expiry <= nextWeek;
    })
    .sort((a, b) => new Date(a.expiry_date!).getTime() - new Date(b.expiry_date!).getTime());

  return {
    isLoading,
    totalInventoryValue,
    financialLoss,
    averageMargin,
    lowStockCount,
    criticalCount,
    expiringSoonItems,
    totalItems: inventory.reduce((acc, item) => acc + item.quantity, 0),
    inStockPercentage: inventory.length > 0 ? Math.round(((inventory.length - criticalCount) / inventory.length) * 100) : 100,
  };
}
