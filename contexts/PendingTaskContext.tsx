
import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { CreateTaskArgs } from '../types';

interface PendingTaskContextType {
  pendingTask: CreateTaskArgs | null;
  setPendingTask: (data: CreateTaskArgs | null) => void;
  clearPendingTask: () => void;
}

const PendingTaskContext = createContext<PendingTaskContextType | undefined>(undefined);

export const PendingTaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pendingTask, setPendingTaskData] = useState<CreateTaskArgs | null>(null);

  const setPendingTask = useCallback((data: CreateTaskArgs | null) => {
    setPendingTaskData(data);
  }, []);

  const clearPendingTask = useCallback(() => {
    setPendingTaskData(null);
  }, []);

  return (
    <PendingTaskContext.Provider value={{ pendingTask, setPendingTask, clearPendingTask }}>
      {children}
    </PendingTaskContext.Provider>
  );
};

export const usePendingTask = (): PendingTaskContextType => {
  const context = useContext(PendingTaskContext);
  if (context === undefined) {
    throw new Error('usePendingTask must be used within a PendingTaskProvider');
  }
  return context;
};
