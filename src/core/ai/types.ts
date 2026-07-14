import type { MealAnalysis } from '@/types/meal';

export interface AIService {
  analyzeMealImage(imageFile: File): Promise<MealAnalysis>;
}
