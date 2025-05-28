import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChevronLeftIcon from '../icons/ChevronLeftIcon';
import ChevronRightIcon from '../icons/ChevronRightIcon';
import { daysOfWeekShort, getDaysInMonthGrid } from '../../utils/dateUtils';
import { DayObject } from '../../types';

interface CustomDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  initialDate?: Date | null;
  anchorEl: HTMLElement | null; // Element to anchor the picker to
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  isOpen,
  onClose,
  onDateSelect,
  initialDate,
  anchorEl,
}) => {
  const [displayDate, setDisplayDate] = useState(initialDate || new Date());
  const [selectedDateState, setSelectedDateState] = useState(initialDate ? new Date(initialDate.getFullYear(), initialDate.getMonth(), initialDate.getDate()) : null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: string; left: string } | null>(null);

  useEffect(() => {
    if (initialDate) {
      const normalizedInitial = new Date(initialDate.getFullYear(), initialDate.getMonth(), initialDate.getDate());
      setDisplayDate(normalizedInitial);
      setSelectedDateState(normalizedInitial);
    } else {
        const today = new Date();
        setDisplayDate(new Date(today.getFullYear(), today.getMonth(), 1)); // Start of current month
        setSelectedDateState(null);
    }
  }, [initialDate, isOpen]); // Re-evaluate when isOpen changes too, to reset initialDate if needed

  const calculateAndSetPosition = useCallback(() => {
    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      setPosition({
        top: `${rect.bottom + window.scrollY + 5}px`, // 5px gap below anchor
        left: `${rect.left + window.scrollX}px`,
      });
    }
  }, [anchorEl]);

  useEffect(() => {
    if (isOpen) {
      calculateAndSetPosition();
      window.addEventListener('resize', calculateAndSetPosition);
      window.addEventListener('scroll', calculateAndSetPosition, true); // Listen on scroll too
    } else {
      window.removeEventListener('resize', calculateAndSetPosition);
      window.removeEventListener('scroll', calculateAndSetPosition, true);
    }
    return () => {
      window.removeEventListener('resize', calculateAndSetPosition);
      window.removeEventListener('scroll', calculateAndSetPosition, true);
    };
  }, [isOpen, calculateAndSetPosition]);


  const handleMonthChange = (offset: number) => {
    setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const handleDayClick = (day: Date) => {
    const normalizedDay = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    setSelectedDateState(normalizedDay);
    onDateSelect(normalizedDay); // Pass the normalized date (without time)
    onClose(); // Close after selection
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node) &&
          anchorEl && !anchorEl.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorEl]);
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);


  if (!isOpen || !position) return null;

  const calendarGrid: DayObject[] = getDaysInMonthGrid(displayDate.getFullYear(), displayDate.getMonth())
    .map(dObj => ({
      ...dObj,
      isSelected: selectedDateState ? dObj.date.getTime() === selectedDateState.getTime() : false,
    }));

  return (
    <div
      ref={pickerRef}
      className="absolute z-[1000] bg-theme-bg-card shadow-2xl rounded-lg p-3 border border-theme-border-primary w-72 md:w-80"
      style={{ top: position.top, left: position.left }}
      aria-modal="true"
      role="dialog"
    >
      <div className="flex items-center justify-between mb-2.5">
        <button
          type="button"
          onClick={() => handleMonthChange(-1)}
          className="p-1.5 rounded-full hover:bg-theme-bg-tertiary text-theme-text-secondary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
          aria-label="Mes anterior"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <h3 className="text-sm font-semibold text-theme-text-primary capitalize">
          {displayDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          type="button"
          onClick={() => handleMonthChange(1)}
          className="p-1.5 rounded-full hover:bg-theme-bg-tertiary text-theme-text-secondary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
          aria-label="Mes siguiente"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-theme-text-secondary mb-1.5">
        {daysOfWeekShort.map(day => <div key={day}>{day}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {calendarGrid.map((dayObj) => {
          let dayClasses = "p-1.5 text-xs rounded-md text-center cursor-pointer transition-colors aspect-square flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-theme-accent-primary ";
          if (dayObj.isSelected) {
            dayClasses += "bg-theme-accent-primary text-theme-text-inverted font-semibold";
          } else if (dayObj.isToday) {
            dayClasses += "bg-theme-accent-primary-light text-theme-accent-primary-dark ring-1 ring-theme-accent-primary";
          } else if (dayObj.isCurrentMonth) {
            dayClasses += "text-theme-text-primary hover:bg-theme-bg-tertiary";
          } else {
            dayClasses += "text-theme-text-secondary opacity-40 cursor-default"; // Not clickable or visually distinct
          }

          return (
            <button
              type="button"
              key={dayObj.date.toISOString()}
              onClick={() => dayObj.isCurrentMonth && handleDayClick(dayObj.date)}
              className={dayClasses}
              disabled={!dayObj.isCurrentMonth}
              aria-label={`Seleccionar fecha ${dayObj.date.toLocaleDateString('es-ES')}`}
            >
              {dayObj.date.getDate()}
            </button>
          );
        })}
      </div>
       <button 
        type="button" 
        onClick={onClose} 
        className="mt-3 w-full text-xs py-1.5 bg-theme-button-secondary-bg text-theme-button-secondary-text rounded-md hover:bg-theme-button-secondary-hover-bg transition-colors"
      >
        Cerrar
      </button>
    </div>
  );
};

export default CustomDatePicker;