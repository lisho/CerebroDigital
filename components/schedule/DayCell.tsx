
import React from 'react';
import { ScheduleEvent } from '../../types';
import EventItem from './EventItem';

interface DayCellProps {
  date: Date;
  events: ScheduleEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
  onDayClick: (date: Date) => void;
  onEventClick: (event: ScheduleEvent) => void;
}

const DayCell: React.FC<DayCellProps> = ({
  date,
  events,
  isCurrentMonth,
  isToday,
  onDayClick,
  onEventClick,
}) => {
  const dayNumber = date.getDate();

  let cellClasses = "relative p-2 border border-theme-border-secondary h-28 flex flex-col overflow-hidden"; // Min height
  if (!isCurrentMonth) {
    cellClasses += " bg-theme-bg-tertiary opacity-70";
  } else {
    cellClasses += " bg-theme-bg-card hover:bg-theme-bg-secondary transition-colors";
  }

  let dayNumberClasses = "text-sm mb-1";
  if (isToday) {
    dayNumberClasses += " bg-theme-accent-primary text-theme-text-inverted rounded-full w-6 h-6 flex items-center justify-center font-bold";
  } else if (isCurrentMonth) {
    dayNumberClasses += " text-theme-text-primary";
  } else {
    dayNumberClasses += " text-theme-text-secondary";
  }

  return (
    <div className={cellClasses} onClick={() => onDayClick(date)} role="gridcell">
      <div className={dayNumberClasses}>{dayNumber}</div>
      <div className="flex-grow overflow-y-auto text-xs space-y-0.5 pr-1">
        {events.map((event) => (
          <EventItem key={event.id} event={event} onClick={() => onEventClick(event)} />
        ))}
      </div>
    </div>
  );
};

export default DayCell;
