
import React from 'react';
import { ScheduleEvent } from '../../types';
import DayCell from './DayCell';

interface MonthViewProps {
  currentDate: Date;
  events: ScheduleEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: ScheduleEvent) => void;
}

const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const getDaysInMonth = (year: number, month: number): Date[] => {
  const date = new Date(year, month, 1);
  const days: Date[] = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

const MonthView: React.FC<MonthViewProps> = ({ currentDate, events, onDayClick, onEventClick }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const daysInMonth = getDaysInMonth(year, month);
  const calendarGrid: (Date | null)[] = [];

  // Calculate starting day of the week (0 for Sunday, 1 for Monday, etc.)
  // Adjust to make Monday the first day (0 for Monday, 6 for Sunday)
  let startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; 

  // Add padding for days from previous month
  for (let i = 0; i < startDayOfWeek; i++) {
    const prevMonthDay = new Date(year, month, 0); // Last day of prev month
    prevMonthDay.setDate(prevMonthDay.getDate() - (startDayOfWeek - 1 - i));
    calendarGrid.push(prevMonthDay);
  }

  daysInMonth.forEach(day => calendarGrid.push(day));

  // Add padding for days from next month to fill the grid (usually 6 weeks = 42 cells)
  const cellsToFill = 42 - calendarGrid.length; // Common display for 6 weeks
  for (let i = 1; i <= cellsToFill; i++) {
    calendarGrid.push(new Date(year, month + 1, i));
  }
  
  const today = new Date();
  today.setHours(0,0,0,0); // Normalize today for comparison

  return (
    <div className="bg-theme-bg-card shadow rounded-b-lg">
      <div className="grid grid-cols-7 border-b border-l border-r border-theme-border-primary">
        {daysOfWeek.map(day => (
          <div key={day} className="py-2 px-1 text-center text-xs font-medium text-theme-text-secondary bg-theme-bg-secondary border-r border-theme-border-secondary last:border-r-0">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {calendarGrid.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} className="border border-theme-border-secondary h-24"></div>;
          
          const dayEvents = events.filter(event => {
            const eventStartDate = new Date(event.start);
            eventStartDate.setHours(0,0,0,0); // Normalize event start date
            return eventStartDate.getTime() === date.getTime();
          });
          
          const normalizedDate = new Date(date);
          normalizedDate.setHours(0,0,0,0);

          return (
            <DayCell
              key={date.toISOString()}
              date={date}
              events={dayEvents}
              isCurrentMonth={date.getMonth() === month}
              isToday={normalizedDate.getTime() === today.getTime()}
              onDayClick={onDayClick}
              onEventClick={onEventClick}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
