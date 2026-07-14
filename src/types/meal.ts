export interface MealIngredient {
  name: string;
  percentage: number;
}

export interface MealAnalysis {
  detectedMeal: string;
  confidence: number;
  ingredients: MealIngredient[];
  explanation: string;
  imageUrl?: string;
}

export interface ExperimentCanvas {
  question: string;
  meal: string;
  ingredients: MealIngredient[];
  experimentType: 'FOOD' | 'GENERAL';
  location: {
    state: string;
    district: string;
  };
  dietPreference: string;
  objective: string;
}
