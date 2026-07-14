import React, { createContext, useContext, useState } from 'react';

interface ExplorerContextType {
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  isSidebarExpanded: boolean;
  toggleSidebar: () => void;
}

const ExplorerContext = createContext<ExplorerContextType | undefined>(undefined);

export const ExplorerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true);

  const toggleSidebar = () => {
    setIsSidebarExpanded((prev) => !prev);
  };

  return (
    <ExplorerContext.Provider
      value={{
        selectedNodeId,
        setSelectedNodeId,
        isSidebarExpanded,
        toggleSidebar,
      }}
    >
      {children}
    </ExplorerContext.Provider>
  );
};

export const useExplorer = () => {
  const context = useContext(ExplorerContext);
  if (context === undefined) {
    throw new Error('useExplorer must be used within an ExplorerProvider');
  }
  return context;
};
