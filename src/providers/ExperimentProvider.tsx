import React, { createContext, useContext, useState } from 'react';
import type { Experiment } from '@/types/experiment';

interface ExperimentContextType {
  currentExperiment: Experiment | null;
  createExperiment: (question: string) => void;
  clearExperiment: () => void;
  isLoading: boolean;
}

const ExperimentContext = createContext<ExperimentContextType | undefined>(undefined);

const classifyQuestion = (question: string): 'FOOD' | 'GENERAL' => {
  const foodKeywords = [
    'food', 'meal', 'burger', 'rice', 'pizza', 'breakfast', 'lunch', 'dinner', 
    'snack', 'drink', 'diet', 'millet', 'wheat', 'soy', 'maize', 'corn', 
    'beef', 'chicken', 'pork', 'dairy', 'milk', 'cheese', 'egg', 'vegetable', 
    'fruit', 'banana', 'apple', 'salad', 'crop'
  ];
  
  const normalized = question.toLowerCase();
  const isFood = foodKeywords.some(keyword => normalized.includes(keyword));
  
  return isFood ? 'FOOD' : 'GENERAL';
};

export const ExperimentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentExperiment, setCurrentExperiment] = useState<Experiment | null>(() => {
    try {
      const saved = localStorage.getItem('ripple_current_experiment');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Failed to parse current experiment from localStorage:', e);
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const createExperiment = (question: string) => {
    setIsLoading(true);
    try {
      const type = classifyQuestion(question);
      const id = `EXP-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date().toISOString();
      
      const newExperiment: Experiment = {
        id,
        question,
        experimentType: type,
        status: 'CREATED',
        createdAt: now,
        updatedAt: now,
        hypothesis: null,
        entities: [],
        confidence: 0.95,
        reasoningTrace: ['Initializing telemetry data stream...', 'Analyzing target question structure...'],
        observations: [],
        recommendations: [],
        workspaceState: {}
      };
      
      setCurrentExperiment(newExperiment);
      localStorage.setItem('ripple_current_experiment', JSON.stringify(newExperiment));
    } catch (e) {
      console.error('Failed to create experiment:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const clearExperiment = () => {
    setCurrentExperiment(null);
    localStorage.removeItem('ripple_current_experiment');
  };

  return (
    <ExperimentContext.Provider
      value={{
        currentExperiment,
        createExperiment,
        clearExperiment,
        isLoading,
      }}
    >
      {children}
    </ExperimentContext.Provider>
  );
};

export const useExperiment = () => {
  const context = useContext(ExperimentContext);
  if (context === undefined) {
    throw new Error('useExperiment must be used within an ExperimentProvider');
  }
  return context;
};
export default ExperimentProvider;
