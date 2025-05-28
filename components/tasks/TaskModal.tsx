import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TaskDetail, TaskStatus, CreateTaskArgs } from '../../types';
import CustomDatePicker from '../common/CustomDatePicker';
import CalendarIcon from '../icons/CalendarIcon';
import { formatDateForDisplay, formatDateToInputString, parseDateTimeLocalString } from '../../utils/dateUtils';


interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: TaskDetail) => void;
  taskData?: TaskDetail | CreateTaskArgs | null; 
  isEditing: boolean; 
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskData,
  isEditing,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [caseId, setCaseId] = useState('');
  const [tags, setTags] = useState('');

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const dueDateInputRef = useRef<HTMLInputElement>(null);

  const resetForm = useCallback(() => {
    if (taskData) {
      setTitle(taskData.title || '');
      setDescription(taskData.description || '');
      
      let initialDueDate: Date | null = null;
      if (taskData.dueDate) {
        // Try to parse YYYY-MM-DD or full ISO string
        const parsedDate = new Date(taskData.dueDate);
        // Check if the date string was just YYYY-MM-DD, which JS Date parses as UTC midnight.
        // If so, create date in local timezone to avoid off-by-one.
        if (taskData.dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = taskData.dueDate.split('-').map(Number);
            initialDueDate = new Date(year, month - 1, day);
        } else if (!isNaN(parsedDate.getTime())) {
            initialDueDate = parsedDate;
        }
      }
      setDueDate(initialDueDate);
      setCaseId(taskData.caseId || '');
      setTags(taskData.tags?.join(', ') || '');
    } else {
      setTitle('');
      setDescription('');
      setDueDate(new Date()); // Default to today
      setCaseId('');
      setTags('');
    }
  }, [taskData]);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('El título de la tarea es obligatorio.');
      return;
    }
    if (!dueDate) {
        alert('La fecha de vencimiento es obligatoria.');
        return;
    }

    const finalTask: TaskDetail = {
      id: isEditing && (taskData as TaskDetail)?.id ? (taskData as TaskDetail).id : Date.now().toString(),
      title,
      description,
      dueDate: formatDateToInputString(dueDate), // Save as YYYY-MM-DD string
      caseId: caseId.trim() || undefined,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      status: isEditing ? (taskData as TaskDetail).status : TaskStatus.ToDo, 
      statusLabel: isEditing ? (taskData as TaskDetail).statusLabel : TaskStatus.ToDo,
      itemType: 'task', 
      assignedToMe: isEditing ? (taskData as TaskDetail).assignedToMe : true, 
    };
    onSave(finalTask);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
      <div className="bg-theme-bg-card p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold text-theme-text-primary mb-4">
            {isEditing ? 'Editar Tarea' : 'Nueva Tarea'}
          </h2>

          <div>
            <label htmlFor="taskTitle" className="block text-sm font-medium text-theme-text-secondary">Título</label>
            <input
              id="taskTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full p-2 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary focus:ring-theme-accent-primary focus:border-theme-accent-primary"
              required
            />
          </div>
          
          <div>
            <label htmlFor="taskDescription" className="block text-sm font-medium text-theme-text-secondary">Descripción (Opcional)</label>
            <textarea
              id="taskDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Detalles adicionales sobre la tarea..."
              className="mt-1 block w-full p-2 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary focus:ring-theme-accent-primary focus:border-theme-accent-primary"
            />
          </div>

          <div>
            <label htmlFor="taskDueDate" className="block text-sm font-medium text-theme-text-secondary">Fecha de Vencimiento</label>
            <div className="relative mt-1">
              <input
                type="text"
                id="taskDueDate"
                ref={dueDateInputRef}
                value={formatDateForDisplay(dueDate)}
                onFocus={() => setIsDatePickerOpen(true)}
                readOnly
                className="w-full p-2 pr-10 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary cursor-pointer"
                required
              />
              <button 
                type="button" 
                onClick={() => setIsDatePickerOpen(true)} 
                className="absolute inset-y-0 right-0 px-2 flex items-center text-theme-text-secondary hover:text-theme-accent-primary"
                aria-label="Abrir selector de fecha"
              >
                <CalendarIcon className="w-5 h-5"/>
              </button>
            </div>
            {isDatePickerOpen && dueDateInputRef.current && (
              <CustomDatePicker
                isOpen={isDatePickerOpen}
                onClose={() => setIsDatePickerOpen(false)}
                onDateSelect={(date) => {
                  setDueDate(date);
                  setIsDatePickerOpen(false);
                }}
                initialDate={dueDate}
                anchorEl={dueDateInputRef.current}
              />
            )}
          </div>
          
          <div>
            <label htmlFor="taskCaseId" className="block text-sm font-medium text-theme-text-secondary">ID de Caso (Opcional)</label>
            <input
              id="taskCaseId"
              type="text"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              placeholder="Ej: CASO-001"
              className="mt-1 block w-full p-2 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary focus:ring-theme-accent-primary focus:border-theme-accent-primary"
            />
          </div>

          <div>
            <label htmlFor="taskTags" className="block text-sm font-medium text-theme-text-secondary">Etiquetas (Opcional, separadas por comas)</label>
            <input
              id="taskTags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Ej: urgente, seguimiento, documentación"
              className="mt-1 block w-full p-2 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary focus:ring-theme-accent-primary focus:border-theme-accent-primary"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium bg-theme-button-secondary-bg text-theme-button-secondary-text rounded-md hover:bg-theme-button-secondary-hover-bg transition-colors w-full sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-theme-button-primary-bg text-theme-button-primary-text rounded-md hover:bg-theme-button-primary-hover-bg transition-colors w-full sm:w-auto"
            >
              {isEditing ? 'Guardar Cambios' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;