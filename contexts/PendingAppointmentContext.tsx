
import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { CreateAppointmentArgs } from '../types';

interface PendingAppointmentContextType {
  pendingAppointment: CreateAppointmentArgs | null;
  setPendingAppointment: (data: CreateAppointmentArgs | null) => void;
  clearPendingAppointment: () => void;
}

const PendingAppointmentContext = createContext<PendingAppointmentContextType | undefined>(undefined);

export const PendingAppointmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pendingAppointment, setPendingAppointmentData] = useState<CreateAppointmentArgs | null>(null);

  const setPendingAppointment = useCallback((data: CreateAppointmentArgs | null) => {
    setPendingAppointmentData(data);
  }, []);

  const clearPendingAppointment = useCallback(() => {
    setPendingAppointmentData(null);
  }, []);

  return (
    <PendingAppointmentContext.Provider value={{ pendingAppointment, setPendingAppointment, clearPendingAppointment }}>
      {children}
    </PendingAppointmentContext.Provider>
  );
};

export const usePendingAppointment = (): PendingAppointmentContextType => {
  const context = useContext(PendingAppointmentContext);
  if (context === undefined) {
    throw new Error('usePendingAppointment must be used within a PendingAppointmentProvider');
  }
  return context;
};
