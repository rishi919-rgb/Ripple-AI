import { GeminiService } from './GeminiService';
import type { AIService } from './types';

export const aiService: AIService = new GeminiService();
export type { AIService };
