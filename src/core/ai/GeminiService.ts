import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIService } from './types';
import type { MealAnalysis, MealIngredient } from '@/types/meal';

const FORBIDDEN_WORDS = [
  'biodiversity', 
  'water footprint', 
  'water', 
  'sustainability', 
  'recommendation', 
  'carbon footprint', 
  'carbon', 
  'ecological', 
  'sustainable',
  'eco-friendly',
  'planet',
  'environment'
];

const sanitizeText = (text: string): string => {
  let sanitized = text;
  FORBIDDEN_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '[telemetry-filtered]');
  });
  return sanitized;
};

const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64Data = reader.result.split(',')[1];
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: file.type
          },
        });
      } else {
        reject(new Error('Failed to read image as base64 string.'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

export class GeminiService implements AIService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  }

  async analyzeMealImage(imageFile: File): Promise<MealAnalysis> {
    if (!this.apiKey) {
      return this.runSimulationMode(imageFile);
    }

    try {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      // Using gemini-1.5-flash as the standard stable vision model
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json'
        }
      });

      const imagePart = await fileToGenerativePart(imageFile);
      const prompt = `Identify the meal shown in this image. 
Identify the primary ingredients and estimate their weight/volume percentages. The percentages must sum to 100.
Provide a short description of the dish.

CRITICAL RULES:
1. ONLY describe the physical ingredients and visual characteristics of the meal.
2. NEVER mention anything related to environmental sustainability, ecology, water footprints, carbon footprints, biodiversity, or recommendations.
3. Your output must strictly be JSON matching this schema:
{
  "detectedMeal": "Name of the meal",
  "confidence": 0.95,
  "ingredients": [
    { "name": "Ingredient Name", "percentage": 30 }
  ],
  "explanation": "A physical description of the meal."
}`;

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const jsonText = response.text();
      
      const rawAnalysis = JSON.parse(jsonText) as Omit<MealAnalysis, 'imageUrl'>;
      
      // Enforce sanitation check
      const ingredients: MealIngredient[] = (rawAnalysis.ingredients || []).map(ing => ({
        name: sanitizeText(ing.name),
        percentage: ing.percentage
      }));

      return {
        detectedMeal: sanitizeText(rawAnalysis.detectedMeal || 'Unknown Meal'),
        confidence: rawAnalysis.confidence || 0.85,
        ingredients,
        explanation: sanitizeText(rawAnalysis.explanation || ''),
        imageUrl: URL.createObjectURL(imageFile)
      };

    } catch (e) {
      console.error('Gemini Vision API error, falling back to simulation:', e);
      return this.runSimulationMode(imageFile);
    }
  }

  private async runSimulationMode(imageFile: File): Promise<MealAnalysis> {
    // Mimic API latency (1.8s)
    await new Promise(resolve => setTimeout(resolve, 1800));

    const name = imageFile.name.toLowerCase();
    let detectedMeal = 'Healthy Salad Bowl';
    let explanation = 'A fresh salad containing mixed leafy greens, sliced tomatoes, cucumbers, and olive oil dressing.';
    let ingredients: MealIngredient[] = [
      { name: 'Mixed Greens', percentage: 40 },
      { name: 'Tomatoes', percentage: 20 },
      { name: 'Cucumbers', percentage: 20 },
      { name: 'Olive Oil', percentage: 10 },
      { name: 'Feta Cheese', percentage: 10 },
    ];

    if (name.includes('dosa')) {
      detectedMeal = 'Masala Dosa with Coconut Chutney';
      explanation = 'A crispy fermented rice crepe stuffed with spiced mashed potato filling (masala) and served with fresh coconut chutney.';
      ingredients = [
        { name: 'Rice & Lentil Crepe', percentage: 50 },
        { name: 'Spiced Potato Filling', percentage: 30 },
        { name: 'Coconut Chutney', percentage: 20 },
      ];
    } else if (name.includes('pizza')) {
      detectedMeal = 'Margherita Pizza';
      explanation = 'A classic Italian pizza featuring a thin wheat crust topped with tomato sauce, fresh mozzarella cheese, and basil leaves.';
      ingredients = [
        { name: 'Wheat Dough Base', percentage: 50 },
        { name: 'Tomato Sauce', percentage: 20 },
        { name: 'Mozzarella Cheese', percentage: 25 },
        { name: 'Fresh Basil', percentage: 5 },
      ];
    } else if (name.includes('burger')) {
      detectedMeal = 'Classic Cheese Burger';
      explanation = 'A grilled meat patty served inside a toasted sesame bun with melted cheese, lettuce, tomatoes, and pickles.';
      ingredients = [
        { name: 'Sesame Bun', percentage: 30 },
        { name: 'Protein Patty', percentage: 45 },
        { name: 'Cheddar Cheese', percentage: 10 },
        { name: 'Lettuce & Tomato', percentage: 10 },
        { name: 'Sauce & Pickles', percentage: 5 },
      ];
    } else if (name.includes('rice') || name.includes('curry')) {
      detectedMeal = 'Steam Rice with Vegetable Curry';
      explanation = 'A bowl of steamed basmati rice paired with a rich, spiced yellow curry containing carrots, peas, and potatoes.';
      ingredients = [
        { name: 'Basmati Rice', percentage: 60 },
        { name: 'Curry Sauce', percentage: 20 },
        { name: 'Mixed Vegetables', percentage: 20 },
      ];
    }

    return {
      detectedMeal,
      confidence: 0.94,
      ingredients,
      explanation,
      imageUrl: URL.createObjectURL(imageFile)
    };
  }
}
