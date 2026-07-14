import React, { createContext, useContext, useState } from 'react';

interface SimulationContextType {
  isRunning: boolean;
  progress: number;
  startSimulation: () => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const startSimulation = () => {
    setIsRunning(true);
    console.log('Placeholder: Starting simulation...');
  };

  const stopSimulation = () => {
    setIsRunning(false);
    console.log('Placeholder: Stopping simulation...');
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setProgress(0);
    console.log('Placeholder: Resetting simulation...');
  };

  return (
    <SimulationContext.Provider
      value={{
        isRunning,
        progress,
        startSimulation,
        stopSimulation,
        resetSimulation,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
