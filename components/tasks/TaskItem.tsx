
import React from 'react';
import { TaskDetail, TaskStatus, EventType } from '../../types';
import CalendarDaysIcon from '../icons/CalendarDaysIcon'; // For appointments
import CheckBadgeIcon from '../icons/CheckBadgeIcon'; // For tasks
import MapPinIcon from '../icons/MapPinIcon'; // For location

interface TaskItemProps {
  task: TaskDetail;
  onClick?: () => void; // Optional: if tasks/appointments become clickable for editing
}

const getStatusColorClasses = (status: TaskStatus): { bg: string, text: string } => {
  switch (status) {
    case TaskStatus.ToDo:
      return { bg: 'bg-gray-200', text: 'text-gray-700' };
    case TaskStatus.InProgress:
      return { bg: 'bg-status-progress-bg', text: 'text-status-progress-text' };
    case TaskStatus.Assigned:
      return { bg: 'bg-status-assigned-bg', text: 'text-status-assigned-text' };
    case TaskStatus.Completed:
      return { bg: 'bg-status-completed-bg', text: 'text-status-completed-text' };
    case TaskStatus.Pending:
      return { bg: 'bg-status-pending-bg', text: 'text-status-pending-text' };
    case TaskStatus.Scheduled: // Appointments
      return { bg: 'bg-blue-100', text: 'text-blue-700' }; // Example, adjust with theme variables if preferred
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-600' };
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
   // Check if it's a valid date and if it includes time other than midnight (which might indicate it's just a date)
  if (isNaN(date.getTime())) return 'Fecha inválida';
  
  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0 || date.getSeconds() !== 0;

  if (hasTime) {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
  // If it's likely just a date (e.g., task due date set to YYYY-MM-DD), show only date part
  // Add 1 day to counteract potential timezone issues if only date was provided
  const adjustedDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return adjustedDate.toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
};


const TaskItem: React.FC<TaskItemProps> = ({ task, onClick }) => {
  const statusColors = getStatusColorClasses(task.status);

  const Icon = task.itemType === 'appointment' ? CalendarDaysIcon : CheckBadgeIcon;
  const iconColor = task.itemType === 'appointment' ? 'text-blue-500' : 'text-green-500';
  
  const defaultStatusLabel = task.status; // Fallback to enum value if statusLabel is missing
  const displayStatusLabel = task.statusLabel || defaultStatusLabel;

  return (
    <div 
      className={`bg-theme-bg-card p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-150 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <Icon className={`w-5 h-5 mr-2 ${iconColor}`} />
          <h3 className="text-md font-semibold text-theme-text-primary">{task.title}</h3>
        </div>
        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusColors.bg} ${statusColors.text}`}>
          {displayStatusLabel}
        </span>
      </div>

      {task.description && (
        <p className="text-sm text-theme-text-secondary mb-2 whitespace-pre-wrap">{task.description}</p>
      )}

      {task.itemType === 'task' && task.caseId && (
        <p className="text-xs text-theme-text-secondary mb-2">Caso ID: {task.caseId}</p>
      )}
      
      {task.itemType === 'appointment' && task.location && (
        <div className="flex items-center text-xs text-theme-text-secondary mb-2">
          <MapPinIcon className="w-3.5 h-3.5 mr-1 text-gray-400" />
          <span>{task.location}</span>
        </div>
      )}
      
      {task.itemType === 'appointment' && task.originalEventType && (
         <p className="text-xs text-theme-text-secondary mb-2">Tipo: {task.originalEventType}</p>
      )}

      {task.itemType === 'task' && task.tags && task.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {task.tags.map(tag => (
            <span key={tag} className="text-xs bg-theme-bg-tertiary text-theme-text-secondary px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}
      
      <div className="text-right">
        <span className="px-2.5 py-1 text-xs bg-theme-bg-tertiary text-theme-text-secondary rounded-md">
          {task.itemType === 'appointment' ? 'Inicia: ' : 'Vence: '} {formatDate(task.dueDate)}
        </span>
      </div>
    </div>
  );
};

export default TaskItem;
