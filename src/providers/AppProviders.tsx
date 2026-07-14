import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { ExperimentProvider } from './ExperimentProvider';
import { ExplorerProvider } from './ExplorerProvider';
import { SimulationProvider } from './SimulationProvider';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <ExperimentProvider>
        <ExplorerProvider>
          <SimulationProvider>
            {children}
          </SimulationProvider>
        </ExplorerProvider>
      </ExperimentProvider>
    </ThemeProvider>
  );
};
