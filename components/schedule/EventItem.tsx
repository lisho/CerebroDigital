
import React from 'react';
import { ScheduleEvent, EventType } from '../../types';

interface EventItemProps {
  event: ScheduleEvent;
  onClick: () => void;
}

const getEventTypeColorClass = (type: EventType, themeColor?: string): string => {
  if (themeColor) return themeColor; // If a custom hex color is provided, this logic might need adjustment or direct style usage
  switch (type) {
    case EventType.Appointment: return 'bg-blue-500';
    case EventType.HomeVisit: return 'bg-green-500';
    case EventType.TeamMeeting: return 'bg-purple-500';
    case EventType.Personal: return 'bg-yellow-500'; // Make sure text color contrasts
    case EventType.Deadline: return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const EventItem: React.FC<EventItemProps> = ({ event, onClick }) => {
  const eventColorClass = getEventTypeColorClass(event.type, event.color);
  
  const startTime = new Date(event.start).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });

  // Determine text color based on background for better contrast if needed, or use a consistent one like text-white
  // For simplicity, using text-white, but a more robust solution might be needed for custom event.color
  const textColorClass = "text-white"; 

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Detiene la propagación del evento de clic
    onClick(); // Llama a la función onClick original (onEventClick)
  };

  return (
    <div
      onClick={handleClick} // Usar el nuevo manejador
      className={`p-1.5 mb-1 text-xs ${textColorClass} rounded-md cursor-pointer hover:opacity-80 transition-opacity truncate ${eventColorClass}`}
      title={`${startTime} - ${event.title}`}
      role="button" // Mejor semántica para un elemento clickeable
      tabIndex={0} // Hacerlo enfocable
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e as any);}} // Permitir activación con teclado
    >
      {!event.allDay && <span className="font-semibold">{startTime}</span>}
      <span className={event.allDay ? 'ml-0' : 'ml-1'}>{event.title}</span>
    </div>
  );
};

export default EventItem;
