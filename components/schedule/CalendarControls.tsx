
import React from 'react';
import ChevronLeftIcon from '../icons/ChevronLeftIcon';
import ChevronRightIcon from '../icons/ChevronRightIcon';

interface CalendarControlsProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

const CalendarControls: React.FC<CalendarControlsProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}) => {
  const monthYearString = currentDate.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex items-center justify-between p-4 bg-theme-bg-card rounded-t-lg shadow">
      <button
        onClick={onToday}
        className="px-4 py-2 text-sm font-medium bg-theme-button-secondary-bg text-theme-button-secondary-text rounded-md hover:bg-theme-button-secondary-hover-bg transition-colors"
      >
        Hoy
      </button>
      <div className="flex items-center space-x-2">
        <button
          onClick={onPrevMonth}
          aria-label="Mes anterior"
          className="p-2 rounded-full hover:bg-theme-bg-tertiary transition-colors text-theme-text-secondary hover:text-theme-text-primary"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-theme-text-primary capitalize w-40 text-center">
          {monthYearString}
        </h2>
        <button
          onClick={onNextMonth}
          aria-label="Mes siguiente"
          className="p-2 rounded-full hover:bg-theme-bg-tertiary transition-colors text-theme-text-secondary hover:text-theme-text-primary"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
      <button 
        // Placeholder for "Add Event" - will be in ScheduleView for modal control
        className="px-4 py-2 text-sm font-medium bg-theme-button-primary-bg text-theme-button-primary-text rounded-md hover:bg-theme-button-primary-hover-bg transition-colors opacity-0 pointer-events-none" // Hidden, actual button in parent
      >
        Nuevo Evento
      </button>
    </div>
  );
};

export default CalendarControls;
