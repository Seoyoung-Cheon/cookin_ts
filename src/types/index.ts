export interface Ingredient {
  name: string;
  translatedName?: string;
  originalName?: string;
  amount?: string;
  unit?: string;
}

export interface Recipe {
  id: string;
  title: string;
  translatedTitle?: string;
  description?: string;
  translatedDescription?: string;
  imageUrl?: string;
  cookingTime?: number;
  servingSize?: number;
  ingredients?: Ingredient[];
  translatedIngredients?: Ingredient[];
  steps?: string[];
  translatedSteps?: string[];
  recipeType?: string;
  recipeMethod?: string;
  calories?: number;
  weight?: string;
  matchRate?: number;
}

export type RecipeType = 'korean' | 'western';
