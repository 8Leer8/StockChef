import mockData from '@/constants/mockdata.json';

type Ingredient = {
  id: string;
  user_id?: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unit_price: number;
  expiry_date?: string;
};

type Batch = {
  id: string;
  ingredient_id: string;
  quantity: number;
  unit_price: number;
  expiry_date: string;
};

type Recipe = {
  id: string;
  name: string;
  category: string;
  selling_price: number;
  target_margin_percentage: number;
};

type RecipeIngredient = {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  quantity_required: number;
};

type WasteLog = {
  id: string;
  ingredient_id: string;
  ingredient_name: string;
  quantity_wasted: number;
  reason: string;
  financial_loss: number;
  created_at: string;
};

type InventoryHistory = {
  id: string;
  ingredient_id: string;
  ingredient_name: string;
  quantity: number;
  type: 'STOCK_IN' | 'STOCK_OUT' | 'WASTE' | 'ADJUSTMENT';
  reason?: string;
  unit?: string;
  created_at: string;
};

type Category = {
  id: string;
  name: string;
  type: 'ingredient' | 'recipe';
};

type UserProfile = {
  id: string;
  display_name: string;
  role?: string;
};

type MockState = {
  ingredients: Ingredient[];
  batches: Batch[];
  recipes: Recipe[];
  recipe_ingredients: RecipeIngredient[];
  waste_logs: WasteLog[];
  inventory_history: InventoryHistory[];
  categories: Category[];
  user_profiles: UserProfile[];
};

const state: MockState = JSON.parse(JSON.stringify(mockData));
let idCounter = 1000;

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const nowIso = () => new Date().toISOString();
const nextId = (prefix: string) => `${prefix}_${idCounter++}`;

const getIngredient = (id: string) => state.ingredients.find((item) => item.id === id);

const addHistory = (entry: Omit<InventoryHistory, 'id' | 'created_at'>) => {
  state.inventory_history.unshift({
    id: nextId('hist'),
    created_at: nowIso(),
    ...entry,
  });
};

export const getInventory = () => clone(state.ingredients);

export const getRecipes = () => clone(state.recipes);

export const getRecipesWithIngredients = () =>
  clone(
    state.recipes.map((recipe) => ({
      ...recipe,
      recipe_ingredients: state.recipe_ingredients.filter(
        (ri) => ri.recipe_id === recipe.id
      ),
    }))
  );

export const getWasteLogs = () => clone(state.waste_logs);

export const getHistory = () =>
  clone(
    state.inventory_history.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  );

export const getBatches = (ingredientId?: string) => {
  const filtered = ingredientId
    ? state.batches.filter((batch) => batch.ingredient_id === ingredientId)
    : state.batches;
  return clone(
    filtered.sort(
      (a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
    )
  );
};

export const getCategories = (type: 'ingredient' | 'recipe') =>
  clone(state.categories.filter((cat) => cat.type === type));

export const addCategory = (category: { name: string; type: 'ingredient' | 'recipe' }) => {
  const newCategory: Category = { id: nextId('cat'), ...category };
  state.categories.push(newCategory);
  return clone(newCategory);
};

export const deleteCategory = (id: string) => {
  state.categories = state.categories.filter((cat) => cat.id !== id);
};

export const getProfile = () => clone(state.user_profiles[0] || null);

export const updateProfile = (updates: { id: string; display_name: string }) => {
  const profile = state.user_profiles.find((item) => item.id === updates.id);
  if (!profile) return null;
  profile.display_name = updates.display_name;
  return clone(profile);
};

export const addIngredient = (payload: Omit<Ingredient, 'id'>) => {
  const newIngredient: Ingredient = { id: nextId('ing'), ...payload };
  state.ingredients.push(newIngredient);
  return clone(newIngredient);
};

export const updateIngredient = (id: string, updates: Partial<Ingredient>) => {
  const ingredient = getIngredient(id);
  if (!ingredient) return null;
  Object.assign(ingredient, updates);
  return clone(ingredient);
};

export const deleteIngredient = (id: string) => {
  state.ingredients = state.ingredients.filter((item) => item.id !== id);
  state.batches = state.batches.filter((batch) => batch.ingredient_id !== id);
  state.recipe_ingredients = state.recipe_ingredients.filter(
    (ri) => ri.ingredient_id !== id
  );
};

export const addBatch = (batch: Omit<Batch, 'id'>) => {
  const ingredient = getIngredient(batch.ingredient_id);
  if (!ingredient) throw new Error('Ingredient not found');

  const previousQty = ingredient.quantity;
  const previousValue = ingredient.unit_price * previousQty;
  const newQty = previousQty + batch.quantity;
  const newValue = previousValue + batch.unit_price * batch.quantity;

  ingredient.quantity = newQty;
  ingredient.unit_price = newQty > 0 ? newValue / newQty : ingredient.unit_price;

  const newBatch: Batch = { id: nextId('batch'), ...batch };
  state.batches.push(newBatch);

  addHistory({
    ingredient_id: ingredient.id,
    ingredient_name: ingredient.name,
    quantity: batch.quantity,
    type: 'STOCK_IN',
    reason: 'Stock in',
    unit: ingredient.unit,
  });

  return clone(newBatch);
};

export const stockOut = (ingredientId: string, quantity: number) => {
  const ingredient = getIngredient(ingredientId);
  if (!ingredient) throw new Error('Ingredient not found');
  if (quantity <= 0) return;

  const batches = state.batches
    .filter((batch) => batch.ingredient_id === ingredientId)
    .sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());

  let remaining = quantity;

  for (const batch of batches) {
    if (remaining <= 0) break;
    if (batch.quantity <= remaining) {
      remaining -= batch.quantity;
      batch.quantity = 0;
    } else {
      batch.quantity -= remaining;
      remaining = 0;
    }
  }

  if (remaining > 0) {
    throw new Error(`Insufficient stock in batches. Remaining: ${remaining}`);
  }

  state.batches = state.batches.filter((batch) => batch.quantity > 0);
  ingredient.quantity = Math.max(0, ingredient.quantity - quantity);

  addHistory({
    ingredient_id: ingredient.id,
    ingredient_name: ingredient.name,
    quantity,
    type: 'STOCK_OUT',
    reason: 'Stock out',
    unit: ingredient.unit,
  });
};

export const logWaste = (payload: {
  ingredient_id: string;
  ingredient_name: string;
  quantity_wasted: number;
  reason: string;
  financial_loss: number;
}) => {
  stockOut(payload.ingredient_id, payload.quantity_wasted);

  const newLog: WasteLog = {
    id: nextId('waste'),
    created_at: nowIso(),
    ...payload,
  };

  state.waste_logs.unshift(newLog);

  addHistory({
    ingredient_id: payload.ingredient_id,
    ingredient_name: payload.ingredient_name,
    quantity: payload.quantity_wasted,
    type: 'WASTE',
    reason: payload.reason,
  });

  return clone(newLog);
};

export const addRecipe = (payload: {
  recipe: {
    name: string;
    category: string;
    selling_price: number;
    target_margin_percentage: number;
  };
  ingredients: { ingredient_id: string; quantity_required: number }[];
}) => {
  const newRecipe: Recipe = {
    id: nextId('rec'),
    ...payload.recipe,
  };

  state.recipes.push(newRecipe);

  payload.ingredients.forEach((ing) => {
    state.recipe_ingredients.push({
      id: nextId('ri'),
      recipe_id: newRecipe.id,
      ingredient_id: ing.ingredient_id,
      quantity_required: ing.quantity_required,
    });
  });

  return clone(newRecipe);
};

export const deleteRecipe = (id: string) => {
  state.recipes = state.recipes.filter((recipe) => recipe.id !== id);
  state.recipe_ingredients = state.recipe_ingredients.filter(
    (ri) => ri.recipe_id !== id
  );
};
