
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { TaskDetail, TaskStatus, ScheduleEvent, EventType, CreateTaskArgs } from '../../types';
import TaskItem from '../tasks/TaskItem';
import TaskModal from '../tasks/TaskModal';
import MagnifyingGlassIcon from '../icons/MagnifyingGlassIcon';
import PlusIcon from '../icons/PlusIcon';
import CalendarIcon from '../icons/CalendarIcon';
import CustomDatePicker from '../common/CustomDatePicker';
import { MOCK_TASKS_KEY, MOCK_SCHEDULE_EVENTS_KEY } from '../../constants';
import { usePendingTask } from '../../contexts/PendingTaskContext';
import { formatDateForDisplay, formatDateToInputString } from '../../utils/dateUtils';
import LoadingSpinner from '../LoadingSpinner'; // Added

type TaskFilterOption = 'all' | 'assignedToMe' | 'completed' | 'active';


const TasksView: React.FC = () => {
  const [allCombinedItems, setAllCombinedItems] = useState<TaskDetail[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true); // Added
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<TaskFilterOption>('active');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDetail | null>(null);

  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
  const [filterTags, setFilterTags] = useState(''); 

  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  const startDateInputRef = useRef<HTMLInputElement>(null);
  const endDateInputRef = useRef<HTMLInputElement>(null);


  const { pendingTask, clearPendingTask } = usePendingTask();

  const loadData = useCallback(async () => {
    setIsLoadingData(true);
    let tasks: TaskDetail[] = [];
    const storedTasks = localStorage.getItem(MOCK_TASKS_KEY);
    if (storedTasks) {
      tasks = JSON.parse(storedTasks).map((t: any) => ({ ...t, itemType: 'task' } as TaskDetail));
    } else {
      try {
        const response = await fetch('/data/tasks.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const fetchedTasks: TaskDetail[] = (await response.json()).map((t: any) => ({ ...t, itemType: 'task' }));
        tasks = fetchedTasks;
        localStorage.setItem(MOCK_TASKS_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.error("Error fetching initial tasks data:", error);
        tasks = [];
      }
    }

    let appointments: TaskDetail[] = [];
    const storedEvents = localStorage.getItem(MOCK_SCHEDULE_EVENTS_KEY);
    if (storedEvents) {
        const scheduleEvents: ScheduleEvent[] = JSON.parse(storedEvents);
        appointments = scheduleEvents.map((event: ScheduleEvent) => ({
            id: event.id, title: event.title,
            statusLabel: EventType[event.type] || event.type.toString() || 'Evento Programado', 
            dueDate: event.start, status: TaskStatus.Scheduled, itemType: 'appointment',
            description: event.description, location: event.location, originalEventType: event.type,
      }));
    } else {
      try {
        const response = await fetch('/data/scheduleEvents.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const fetchedEvents: ScheduleEvent[] = await response.json();
        appointments = fetchedEvents.map((event: ScheduleEvent) => ({
            id: event.id, title: event.title,
            statusLabel: EventType[event.type] || event.type.toString() || 'Evento Programado', 
            dueDate: event.start, status: TaskStatus.Scheduled, itemType: 'appointment',
            description: event.description, location: event.location, originalEventType: event.type,
        }));
        localStorage.setItem(MOCK_SCHEDULE_EVENTS_KEY, JSON.stringify(fetchedEvents)); // Store raw events
      } catch (error) {
        console.error("Error fetching initial schedule events data:", error);
        appointments = [];
      }
    }
    
    const combined = [...tasks, ...appointments].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    setAllCombinedItems(combined);
    setIsLoadingData(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (pendingTask) {
      setEditingTask(null); 
      setIsModalOpen(true); 
    }
  }, [pendingTask]);


  const filteredItems = useMemo(() => {
    let items = allCombinedItems;

    if (activeFilter === 'assignedToMe') {
      items = items.filter(t => t.itemType === 'task' && t.assignedToMe && t.status !== TaskStatus.Completed);
    } else if (activeFilter === 'completed') {
      items = items.filter(t => t.status === TaskStatus.Completed);
    } else if (activeFilter === 'active') {
      items = items.filter(t => t.status !== TaskStatus.Completed);
    }

    if (filterStartDate) {
        const start = new Date(filterStartDate);
        start.setHours(0,0,0,0);
        items = items.filter(t => new Date(t.dueDate) >= start);
    }
    if (filterEndDate) {
      const end = new Date(filterEndDate);
      end.setHours(23, 59, 59, 999);
      items = items.filter(t => new Date(t.dueDate) <= end);
    }
    
    const searchTags = filterTags.toLowerCase().split(',').map(t => t.trim()).filter(t => t);
    if (searchTags.length > 0) {
      items = items.filter(item => {
        if (item.itemType === 'task' && item.tags && item.tags.length > 0) {
          return searchTags.every(searchTag => 
            item.tags!.some(itemTag => itemTag.toLowerCase().includes(searchTag))
          );
        }
        return false; 
      });
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      items = items.filter(t => 
        t.title.toLowerCase().includes(lowerSearchTerm) ||
        (t.description && t.description.toLowerCase().includes(lowerSearchTerm)) ||
        (t.itemType === 'task' && t.caseId && t.caseId.toLowerCase().includes(lowerSearchTerm)) ||
        (t.itemType === 'appointment' && t.location && t.location.toLowerCase().includes(lowerSearchTerm)) ||
        (t.itemType === 'task' && t.tags && t.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)))
      );
    }
    return items;
  }, [allCombinedItems, searchTerm, activeFilter, filterStartDate, filterEndDate, filterTags]);

  const handleOpenModalForNew = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };
  
  const handleOpenModalForEdit = (task: TaskDetail) => {
    if (task.itemType === 'appointment') {
      alert("La edición de citas se gestiona en la Agenda.");
      return;
    }
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    if (pendingTask) { 
      clearPendingTask();
    }
  };

  const handleModalSave = (taskToSave: TaskDetail) => {
    let updatedItems;
    if (editingTask) { 
      updatedItems = allCombinedItems.map(item => item.id === taskToSave.id ? taskToSave : item);
    } else { 
      updatedItems = [...allCombinedItems, taskToSave];
    }
    
    const tasksToPersist = updatedItems.filter(item => item.itemType === 'task');
    localStorage.setItem(MOCK_TASKS_KEY, JSON.stringify(tasksToPersist));
    
    setAllCombinedItems(updatedItems.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
    
    if (pendingTask) { 
      clearPendingTask();
    }
    handleModalClose();
  };


  const filterTabs: { label: string, value: TaskFilterOption }[] = [
    { label: 'Activas', value: 'active'},
    { label: 'Todas', value: 'all'},
    { label: 'Asignadas a Mí (Activas)', value: 'assignedToMe'},
    { label: 'Completadas', value: 'completed'},
  ];

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
        <p className="ml-3 text-theme-text-secondary">Cargando tareas y eventos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-theme-text-primary">Tareas y Agenda</h2>
        <button 
          onClick={handleOpenModalForNew}
          className="w-full md:w-auto flex items-center justify-center px-4 py-2.5 bg-theme-button-primary-bg text-theme-button-primary-text rounded-lg font-medium transition-colors shadow-sm hover:bg-theme-button-primary-hover-bg text-sm"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nueva Tarea
        </button>
      </div>
      
      <div className="border-b border-theme-border-primary">
        <nav className="-mb-px flex space-x-4 overflow-x-auto pb-1" aria-label="Tabs">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeFilter === tab.value
                  ? 'border-theme-accent-primary text-theme-accent-primary'
                  : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary hover:border-gray-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-theme-bg-card p-4 rounded-lg shadow space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-theme-text-secondary" />
          </div>
          <input
            type="text"
            placeholder="Buscar por título, descripción, ID caso, ubicación, etiqueta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 border border-theme-border-primary rounded-lg bg-theme-bg-secondary text-theme-text-primary focus:ring-2 focus:ring-theme-accent-primary focus:border-transparent shadow-sm"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="filterStartDate" className="block text-xs font-medium text-theme-text-secondary mb-1">Desde Fecha</label>
            <div className="relative">
              <input
                type="text"
                id="filterStartDate"
                ref={startDateInputRef}
                value={formatDateForDisplay(filterStartDate)}
                onFocus={() => setIsStartDatePickerOpen(true)}
                readOnly
                className="w-full p-2 pr-10 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary text-sm cursor-pointer"
              />
              <button type="button" onClick={() => setIsStartDatePickerOpen(true)} className="absolute inset-y-0 right-0 px-2 flex items-center text-theme-text-secondary hover:text-theme-accent-primary">
                <CalendarIcon className="w-5 h-5"/>
              </button>
            </div>
             {isStartDatePickerOpen && startDateInputRef.current && (
              <CustomDatePicker
                isOpen={isStartDatePickerOpen}
                onClose={() => setIsStartDatePickerOpen(false)}
                onDateSelect={(date) => {
                  setFilterStartDate(date);
                  setIsStartDatePickerOpen(false);
                }}
                initialDate={filterStartDate}
                anchorEl={startDateInputRef.current}
              />
            )}
          </div>
          <div>
            <label htmlFor="filterEndDate" className="block text-xs font-medium text-theme-text-secondary mb-1">Hasta Fecha</label>
            <div className="relative">
              <input
                type="text"
                id="filterEndDate"
                ref={endDateInputRef}
                value={formatDateForDisplay(filterEndDate)}
                onFocus={() => setIsEndDatePickerOpen(true)}
                readOnly
                className="w-full p-2 pr-10 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary text-sm cursor-pointer"
              />
               <button type="button" onClick={() => setIsEndDatePickerOpen(true)} className="absolute inset-y-0 right-0 px-2 flex items-center text-theme-text-secondary hover:text-theme-accent-primary">
                <CalendarIcon className="w-5 h-5"/>
              </button>
            </div>
            {isEndDatePickerOpen && endDateInputRef.current && (
              <CustomDatePicker
                isOpen={isEndDatePickerOpen}
                onClose={() => setIsEndDatePickerOpen(false)}
                onDateSelect={(date) => {
                  setFilterEndDate(date);
                  setIsEndDatePickerOpen(false);
                }}
                initialDate={filterEndDate}
                anchorEl={endDateInputRef.current}
              />
            )}
          </div>
          <div>
            <label htmlFor="filterTags" className="block text-xs font-medium text-theme-text-secondary mb-1">Etiquetas (tareas, ej: urgente,doc)</label>
            <input type="text" id="filterTags" value={filterTags} onChange={e => setFilterTags(e.target.value)}
                   placeholder="Separadas por comas"
                   className="w-full p-2 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary text-sm"/>
          </div>
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="space-y-4">
          {filteredItems.map(item => (
            <TaskItem 
              key={item.id + item.itemType} 
              task={item} 
              onClick={item.itemType === 'task' ? () => handleOpenModalForEdit(item) : undefined} 
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-theme-text-secondary py-8">No se encontraron tareas o eventos para los filtros aplicados.</p>
      )}

      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          taskData={editingTask || pendingTask} 
          isEditing={!!editingTask}
        />
      )}
    </div>
  );
};

export default TasksView;
