
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    CaseDetail, CaseStatus, TaskDetail, ClientNote, ScheduleEvent, EventType, 
    CreateTaskArgs, CreateAppointmentArgs, TaskStatus as TaskStatusEnum, 
    CompositionUnitRecord, Person as PersonType, TimelineEvent, TimelineEventType, 
    BroadTimelineFilterCategory 
} from '../../types'; // Changed from '@/types'
import { MOCK_CASES_KEY, MOCK_TASKS_KEY, MOCK_CLIENT_NOTES_KEY, MOCK_SCHEDULE_EVENTS_KEY } from '../../constants';
import { askOnce } from '../../services/geminiService';
import LoadingSpinner from '../LoadingSpinner';
import TaskItem from '../tasks/TaskItem';
import EventModal from '../schedule/EventModal';
import TaskModal from '../tasks/TaskModal';
// Icons are now imported from the central index file
import { 
    PlusIcon,
    UsersIcon,
    TimelineIcon,
    StarIcon,
    BriefcaseIcon,
    PencilIcon,
    TrashIcon,
    LightbulbIcon,
    DocumentTextIconSvg,
    ClipboardListIcon,
    CalendarDaysIconSvg,
    InformationCircleIcon
} from '../icons';

// Extracted Components
import CaseNoteModal from '../cases/CaseNoteModal';
// import SimplifiedGenogram from '../cases/SimplifiedGenogram'; // To be removed
import GoJSGenogramDiagram from '../cases/GoJSGenogramDiagram'; // New Genogram
// import CaseTimelineGraph from '../cases/CaseTimelineGraph'; // To be removed
import GoJSTimelineDiagram from '../cases/GoJSTimelineDiagram'; // New Timeline

// Utils
import { transformCaseDataToGenogram } from '../../utils/genogramUtils'; 
import { transformCaseDataToTimeline } from '../../utils/timelineUtils'; // New Timeline util

// Extracted Utils
import { 
    getStatusBadgeClasses, 
    // getTimelineEventColor, // No longer needed for GoJS timeline
    // generateTimelineEvents // No longer needed, replaced by transformCaseDataToTimeline
} from '../../utils/caseDetailUtils'; 

// Calendar components for embedded view
import CalendarControls from '../schedule/CalendarControls';
import MonthView from '../schedule/MonthView';


type TabOptions = 'overview' | 'family' | 'tasks' | 'notes' | 'schedule' | 'timeline';
type TimelinePerspectiveFilter = 'general' | 'generalWithPersons' | 'familyUnit' | 'householdUnit' | string; 

const CaseDetailView: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [caseTasks, setCaseTasks] = useState<TaskDetail[]>([]);
  const [caseNotes, setCaseNotes] = useState<ClientNote[]>([]);
  const [caseEvents, setCaseEvents] = useState<ScheduleEvent[]>([]);
  // const [allTimelineEvents, setAllTimelineEvents] = useState<TimelineEvent[]>([]); // Replaced by goJsTimelineEvents
  
  const [activeTab, setActiveTab] = useState<TabOptions>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEventForModal, setSelectedEventForModal] = useState<ScheduleEvent | null>(null);
  const [selectedDateForNewEventModal, setSelectedDateForNewEventModal] = useState<Date | null>(null);
  
  const [currentCaseCalendarDate, setCurrentCaseCalendarDate] = useState(new Date());

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<TaskDetail | CreateTaskArgs | null>(null);
  const [isEditingTask, setIsEditingTask] = useState(false);
  
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedNoteForModal, setSelectedNoteForModal] = useState<ClientNote | null>(null);

  // const [selectedTimelineFilters, setSelectedTimelineFilters] = useState<BroadTimelineFilterCategory[]>([]); // Old timeline filters
  // const [expandedTimelineEventId, setExpandedTimelineEventId] = useState<string | null>(null);  // Old timeline state
  // const [timelinePerspectiveFilter, setTimelinePerspectiveFilter] = useState<TimelinePerspectiveFilter>('generalWithPersons'); // Old timeline state
  
  // const broadFilterButtonCategories: { category: BroadTimelineFilterCategory; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>>; }[] = [ // Old timeline filters
  //   { category: "Eventos Personales", label: "Eventos Personales", icon: StarIcon },
  //   { category: "Eventos de Unidad Familiar", label: "Unidad Familiar", icon: UsersIcon },
  //   { category: "Actuaciones sobre el Caso", label: "Actuaciones", icon: BriefcaseIcon },
  //   { category: "Documentación Generada", label: "Documentación", icon: DocumentTextIconSvg },
  // ];

  const loadData = useCallback(() => {
    setIsLoading(true);
    if (!caseId) { navigate('/cases'); setIsLoading(false); return; }

    const storedCases = localStorage.getItem(MOCK_CASES_KEY);
    const allCasesData: CaseDetail[] = storedCases ? JSON.parse(storedCases) : [];
    const foundCase = allCasesData.find(c => c.id === caseId);
    
    if (foundCase) {
        foundCase.compositionHistory = foundCase.compositionHistory || [];
        setCaseDetail(foundCase);
        
        const allTasksData: TaskDetail[] = JSON.parse(localStorage.getItem(MOCK_TASKS_KEY) || '[]').map((t: any) => ({ ...t, itemType: 'task' as 'task' | 'appointment' }));
        const currentCaseTasks = allTasksData.filter(task => task.caseId === caseId).sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime() );
        setCaseTasks(currentCaseTasks);

        const allNotesData: ClientNote[] = JSON.parse(localStorage.getItem(MOCK_CLIENT_NOTES_KEY) || '[]');
        const currentCaseNotes = allNotesData.filter(note => note.caseId === caseId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime() );
        setCaseNotes(currentCaseNotes);

        const allEventsData: ScheduleEvent[] = JSON.parse(localStorage.getItem(MOCK_SCHEDULE_EVENTS_KEY) || '[]').map((e: ScheduleEvent) => ({
            ...e, start: new Date(e.start).toISOString(), end: new Date(e.end).toISOString(),
        }));
        const currentCaseEvents = allEventsData.filter(event => event.caseId === caseId).sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime());
        setCaseEvents(currentCaseEvents);

        // setAllTimelineEvents(generateTimelineEvents(foundCase, currentCaseTasks, currentCaseNotes, currentCaseEvents)); // Old timeline data generation
    } else {
        setCaseDetail(null); 
        // setAllTimelineEvents([]); // No longer needed
    }
    setIsLoading(false);
  }, [caseId, navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAiAnalysis = async (analysisType: 'summary' | 'risks' | 'steps') => {
    if (!caseDetail) return;
    setIsAiLoading(true); setAiInsight(null);
    let promptContent = `Analiza la siguiente información del caso para el cliente "${caseDetail.clientName}".\nDescripción del caso: ${caseDetail.description || 'No proporcionada'}\n`;
    if (caseDetail.compositionHistory && caseDetail.compositionHistory.length > 0) {
      const currentComposition = caseDetail.compositionHistory.sort((a,b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())[0]; 
      promptContent += `\nEntorno Familiar/Convivencia (desde ${new Date(currentComposition.effectiveDate).toLocaleDateString()}):\n`;
      if (currentComposition.familyUnit.length > 0) {
        promptContent += "  Unidad Familiar:\n";
        currentComposition.familyUnit.forEach(fm => { promptContent += `    - ${fm.fullName} (${fm.relationshipToCaseHolder}${fm.dateOfBirth ? ', Nac: ' + new Date(fm.dateOfBirth).toLocaleDateString() : ''})\n`; });
      }
      if (currentComposition.householdUnit.length > 0) {
        promptContent += "  Unidad de Convivencia (todos los miembros):\n";
        currentComposition.householdUnit.forEach(hm => { promptContent += `    - ${hm.fullName}${hm.isFamilyMember ? ' (Familiar)' : (hm.cohabitationNotes ? ` (${hm.cohabitationNotes})` : '')}${hm.dateOfBirth ? ', Nac: ' + new Date(hm.dateOfBirth).toLocaleDateString() : ''}\n`; });
      }
    }
    if (caseNotes.length > 0) {
      promptContent += "\nNotas Relevantes (más recientes primero, máx 5 extractos breves):\n";
      caseNotes.slice(0, 5).forEach(note => { promptContent += `- "${note.title}" (Fecha: ${new Date(note.date).toLocaleDateString()}): ${note.content.substring(0, 150)}...\n`; });
    }
    if (caseTasks.length > 0) {
      promptContent += "\nTareas Relevantes (más recientes primero, máx 5 extractos breves):\n";
      caseTasks.slice(0,5).forEach(task => { promptContent += `- "${task.title}" (Vence: ${new Date(task.dueDate).toLocaleDateString()}, Estado: ${task.statusLabel})${task.description ? ': ' + task.description.substring(0,100)+'...' : ''}\n`; });
    }
    let specificInstruction = "";
    if (analysisType === 'summary') specificInstruction = "Proporciona un resumen conciso del estado actual del caso y los puntos clave, considerando el entorno familiar.";
    else if (analysisType === 'risks') specificInstruction = "Identifica posibles riesgos, desafíos y necesidades no cubiertas del cliente y su entorno familiar/convivencia. Sé específico y práctico.";
    else if (analysisType === 'steps') specificInstruction = "Sugiere 2-3 próximos pasos concretos o consideraciones importantes para el trabajador social basándote en la información proporcionada, incluyendo el contexto familiar.";
    
    const fullPrompt = `${promptContent}\n\nInstrucción Específica: ${specificInstruction}\nPor favor, estructura tu respuesta claramente.`;
    try {
      const result = await askOnce(fullPrompt, undefined, true); setAiInsight(result.text);
    } catch (error) { setAiInsight(`Error al contactar a Eulogio: ${error instanceof Error ? error.message : String(error)}`);
    } finally { setIsAiLoading(false); }
  };
  
  const handleSaveEvent = (eventToSave: ScheduleEvent) => {
    const allStoredEvents: ScheduleEvent[] = JSON.parse(localStorage.getItem(MOCK_SCHEDULE_EVENTS_KEY) || '[]');
    const eventWithCaseId = { ...eventToSave, caseId: eventToSave.caseId || caseId }; 
    const existingIdx = allStoredEvents.findIndex(e => e.id === eventWithCaseId.id);
    const updatedEvents = (existingIdx > -1) 
      ? allStoredEvents.map(e => e.id === eventWithCaseId.id ? eventWithCaseId : e)
      : [...allStoredEvents, { ...eventWithCaseId, id: Date.now().toString() }];
    localStorage.setItem(MOCK_SCHEDULE_EVENTS_KEY, JSON.stringify(updatedEvents));
    loadData(); setIsEventModalOpen(false); setSelectedEventForModal(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    const allStoredEvents: ScheduleEvent[] = JSON.parse(localStorage.getItem(MOCK_SCHEDULE_EVENTS_KEY) || '[]');
    const globalUpdatedEvents = allStoredEvents.filter(e => e.id !== eventId);
    localStorage.setItem(MOCK_SCHEDULE_EVENTS_KEY, JSON.stringify(globalUpdatedEvents));
    loadData(); setIsEventModalOpen(false); setSelectedEventForModal(null);
  };
  
  const handleSaveTask = (taskToSave: TaskDetail) => {
    const allStoredTasks: TaskDetail[] = JSON.parse(localStorage.getItem(MOCK_TASKS_KEY) || '[]');
    const taskWithCaseId = { ...taskToSave, caseId }; 
    const existingIdx = allStoredTasks.findIndex(t => t.id === taskWithCaseId.id);
    const updatedTasks = (existingIdx > -1)
      ? allStoredTasks.map(t => t.id === taskWithCaseId.id ? taskWithCaseId : t)
      : [...allStoredTasks, { ...taskWithCaseId, id: Date.now().toString(), status: TaskStatusEnum.ToDo, statusLabel: 'Por Hacer', itemType: 'task' as 'task' }];
    localStorage.setItem(MOCK_TASKS_KEY, JSON.stringify(updatedTasks));
    loadData(); setIsTaskModalOpen(false); setSelectedTaskForModal(null);
  };

  const handleSaveNote = (noteData: { title: string; content: string; tags: string; }) => {
    const allStoredNotes: ClientNote[] = JSON.parse(localStorage.getItem(MOCK_CLIENT_NOTES_KEY) || '[]');
    const noteWithCaseId: ClientNote = {
        id: selectedNoteForModal?.id || Date.now().toString(), title: noteData.title, content: noteData.content,
        tags: noteData.tags.split(',').map(t => t.trim()).filter(t => t), date: selectedNoteForModal?.date || new Date().toISOString(), caseId: caseId!,
    };
    const existingIdx = allStoredNotes.findIndex(n => n.id === noteWithCaseId.id);
    const updatedNotes = (existingIdx > -1) ? allStoredNotes.map(n => n.id === noteWithCaseId.id ? noteWithCaseId : n) : [...allStoredNotes, noteWithCaseId];
    localStorage.setItem(MOCK_CLIENT_NOTES_KEY, JSON.stringify(updatedNotes));
    loadData(); setIsNoteModalOpen(false); setSelectedNoteForModal(null);
  };

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
      const allStoredNotes: ClientNote[] = JSON.parse(localStorage.getItem(MOCK_CLIENT_NOTES_KEY) || '[]');
      const globalUpdatedNotes = allStoredNotes.filter(n => n.id !== noteId);
      localStorage.setItem(MOCK_CLIENT_NOTES_KEY, JSON.stringify(globalUpdatedNotes));
      loadData(); if(selectedNoteForModal?.id === noteId) setSelectedNoteForModal(null);
    }
  };
  
  // const toggleTimelineFilter = (filterType: BroadTimelineFilterCategory) => { // Old filter logic
  //   setSelectedTimelineFilters(prevFilters =>
  //     prevFilters.includes(filterType)
  //       ? prevFilters.filter(f => f !== filterType)
  //       : [...prevFilters, filterType]
  //   );
  // };

  // const handleTimelineEventClick = (event: TimelineEvent) => { // Old click logic
  //   setExpandedTimelineEventId(prev => prev === event.id ? null : event.id); 
  //   if (!event.sourceId || !event.sourceType) return;
  //   switch (event.sourceType) {
  //     case 'note':
  //       const note = caseNotes.find(n => n.id === event.sourceId);
  //       if (note) { setSelectedNoteForModal(note); setIsNoteModalOpen(true); }
  //       break;
  //     case 'task':
  //       const task = caseTasks.find(t => t.id === event.sourceId);
  //       if (task) { setSelectedTaskForModal(task); setIsEditingTask(true); setIsTaskModalOpen(true); }
  //       break;
  //     case 'scheduleEvent':
  //       const scheduleItem = caseEvents.find(se => se.id === event.sourceId);
  //       if (scheduleItem) { setSelectedEventForModal(scheduleItem); setIsEventModalOpen(true); }
  //       break;
  //   }
  // };

  const currentCompositionRecord = useMemo(() => {
    if (!caseDetail || !caseDetail.compositionHistory || caseDetail.compositionHistory.length === 0) {
      return null;
    }
    return caseDetail.compositionHistory.sort((a,b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())[0];
  }, [caseDetail]);

  // const perspectiveFilterOptions = useMemo(() => { // Old timeline graph options
  //   const options = [
  //     { value: 'generalWithPersons', label: 'General con Personas Vinculadas (Gráfico Vertical)' },
  //     { value: 'general', label: 'Historial General del Caso (Lista)' },
  //     { value: 'familyUnit', label: 'Perspectiva Gráfica: Unidad Familiar' },
  //     { value: 'householdUnit', label: 'Perspectiva Gráfica: Unidad de Convivencia' },
  //   ];
  //   if (currentCompositionRecord) {
  //     const individuals: { id: string; fullName: string }[] = [];
  //      (currentCompositionRecord.familyUnit || []).forEach(p => { if (!individuals.find(i => i.id === p.id)) individuals.push({ id: p.id, fullName: p.fullName }); });
  //      (currentCompositionRecord.householdUnit || []).forEach(p => { if (!individuals.find(i => i.id === p.id)) individuals.push({ id: p.id, fullName: p.fullName }); });
  //     individuals.forEach(p => { options.push({ value: p.id, label: `Perspectiva Gráfica: ${p.fullName}` }); });
  //   }
  //   return options;
  // }, [currentCompositionRecord]);

  // const eventsForDisplay = useMemo(() => { // Old timeline data
  //   let filtered = allTimelineEvents;
  //   if (selectedTimelineFilters.length > 0) {
  //     filtered = filtered.filter(event => event.broadCategory && selectedTimelineFilters.includes(event.broadCategory));
  //   }
  //   return filtered;
  // }, [allTimelineEvents, selectedTimelineFilters]);

  // Graph constants and graphData memo are removed as they belong to the old CaseTimelineGraph

  const handlePrevMonthForCaseCalendar = () => setCurrentCaseCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonthForCaseCalendar = () => setCurrentCaseCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const handleTodayForCaseCalendar = () => setCurrentCaseCalendarDate(new Date());

  const handleCaseCalendarDayClick = (date: Date) => {
    setSelectedEventForModal(null); setSelectedDateForNewEventModal(date); setIsEventModalOpen(true);
  };
  const handleCaseCalendarEventClick = (event: ScheduleEvent) => {
    setSelectedEventForModal(event); setSelectedDateForNewEventModal(null); setIsEventModalOpen(true);
  };

  // Transform data for GoJS Genogram
  const { nodes: genogramNodes, links: genogramLinks } = useMemo(() => {
    if (caseDetail) { 
      return transformCaseDataToGenogram(caseDetail);
    }
    return { nodes: [], links: [] };
  }, [caseDetail]);
  
  // Transform data for GoJS Timeline
  const goJsTimelineEvents = useMemo(() => {
    // caseDetail, caseTasks, caseEvents, caseNotes are already in the component's state
    // and are filtered for the current caseId by the loadData function.
    return transformCaseDataToTimeline(caseDetail, caseTasks, caseEvents, caseNotes);
  }, [caseDetail, caseTasks, caseEvents, caseNotes]);

  if (isLoading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg" /></div>;
  if (!caseDetail) return <div className="text-center text-theme-text-secondary p-8">Caso no encontrado o ID de caso inválido. <Link to="/cases" className="text-theme-accent-primary hover:underline">Volver a Casos</Link></div>;

  const tabItems = [
    { id: 'overview', label: 'Resumen e IA', icon: <LightbulbIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" /> },
    { id: 'family', label: 'Entorno Familiar', icon: <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" /> },
    { id: 'timeline', label: 'Historial', icon: <TimelineIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" /> },
    { id: 'tasks', label: 'Tareas', icon: <ClipboardListIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" /> },
    { id: 'notes', label: 'Notas', icon: <DocumentTextIconSvg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" /> },
    { id: 'schedule', label: 'Agenda', icon: <CalendarDaysIconSvg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" /> },
  ];

  const currentComposition = caseDetail.compositionHistory && caseDetail.compositionHistory.length > 0 
    ? caseDetail.compositionHistory.sort((a,b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())[0]
    : null;
    
  const familyUnitCount = currentComposition?.familyUnit?.length || 0;
  const householdUnitCount = currentComposition?.householdUnit?.length || 0;
  const completedTasksCount = caseTasks.filter(t => t.status === TaskStatusEnum.Completed).length;
  const pastEventsCount = caseEvents.filter(e => new Date(e.end) < new Date()).length;
  const interventionsCount = caseNotes.length + completedTasksCount + pastEventsCount;
  const pendingTasksCount = caseTasks.filter(t => t.status !== TaskStatusEnum.Completed).length;
  const upcomingEventsCount = caseEvents.filter(e => new Date(e.start) >= new Date()).length;


  return (
    <div className="space-y-6 pb-8">
      <div className="bg-theme-bg-card p-4 sm:p-5 rounded-lg shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <img 
            src={caseDetail.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(caseDetail.clientName)}&background=random&color=fff`} 
            alt={`Avatar de ${caseDetail.clientName}`}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 sm:border-4 border-theme-bg-tertiary" 
          />
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-text-primary">{caseDetail.clientName}</h2>
            <p className="text-xs sm:text-sm text-theme-text-secondary">ID Caso: {caseDetail.id}</p>
            <p className="text-xs sm:text-sm text-theme-text-secondary">Asignado a: {caseDetail.assignedTo}</p>
          </div>
        </div>
        <div className="flex flex-col items-start sm:items-end mt-3 sm:mt-0 w-full sm:w-auto">
          <span className={`px-2.5 py-1 text-xs sm:text-sm font-semibold rounded-full ${getStatusBadgeClasses(caseDetail.status)}`}>
            {caseDetail.status}
          </span>
          {caseDetail.dateOpened && <p className="text-xs text-theme-text-secondary mt-1">Abierto: {new Date(caseDetail.dateOpened).toLocaleDateString('es-ES')}</p>}
          {caseDetail.lastUpdate && <p className="text-xs text-theme-text-secondary mt-1">Últ. Act.: {new Date(caseDetail.lastUpdate).toLocaleDateString('es-ES')}</p>}
        </div>
      </div>

      <div className="border-b border-theme-border-primary">
        <nav className="-mb-px flex space-x-1 sm:space-x-2 overflow-x-auto" aria-label="Tabs">
          {tabItems.map(tab => (
            <button
              key={tab.id} onClick={() => setActiveTab(tab.id as TabOptions)}
              className={`whitespace-nowrap flex items-center py-2.5 sm:py-3 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors
                ${activeTab === tab.id ? 'border-theme-accent-primary text-theme-accent-primary' : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary hover:border-gray-300'}`}
            > {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-4 bg-theme-bg-card p-4 sm:p-6 rounded-lg shadow">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
                <h3 className="text-lg sm:text-xl font-semibold text-theme-text-primary mb-3">Información General del Caso</h3>
                <p className="text-sm text-theme-text-secondary whitespace-pre-wrap leading-relaxed">{caseDetail.description || 'No hay descripción detallada para este caso.'}</p>
            </div>
            <hr className="border-theme-border-secondary"/>
            <div>
                <h3 className="text-lg sm:text-xl font-semibold text-theme-text-primary mb-4">Estadísticas Clave del Caso</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-theme-bg-secondary p-4 rounded-lg flex items-center space-x-3">
                        <UsersIcon className="w-7 h-7 text-theme-accent-primary"/>
                        <div>
                            <p className="text-2xl font-bold text-theme-text-primary">{familyUnitCount} / {householdUnitCount}</p>
                            <p className="text-xs text-theme-text-secondary">Miembros U.Familiar / U.Convivencia</p>
                        </div>
                    </div>
                    <div className="bg-theme-bg-secondary p-4 rounded-lg flex items-center space-x-3">
                        <BriefcaseIcon className="w-7 h-7 text-theme-accent-primary"/>
                        <div>
                            <p className="text-2xl font-bold text-theme-text-primary">{interventionsCount}</p>
                            <p className="text-xs text-theme-text-secondary">Intervenciones Registradas</p>
                        </div>
                    </div>
                    <div className="bg-theme-bg-secondary p-4 rounded-lg flex items-center space-x-3">
                        <ClipboardListIcon className="w-7 h-7 text-theme-accent-primary"/>
                        <div>
                            <p className="text-2xl font-bold text-theme-text-primary">{pendingTasksCount}</p>
                            <p className="text-xs text-theme-text-secondary">Tareas Pendientes</p>
                        </div>
                    </div>
                     <div className="bg-theme-bg-secondary p-4 rounded-lg flex items-center space-x-3">
                        <CalendarDaysIconSvg className="w-7 h-7 text-theme-accent-primary"/>
                        <div>
                            <p className="text-2xl font-bold text-theme-text-primary">{upcomingEventsCount}</p>
                            <p className="text-xs text-theme-text-secondary">Próximos Eventos</p>
                        </div>
                    </div>
                </div>
            </div>
             <hr className="border-theme-border-secondary"/>
            <div>
                <h3 className="text-lg sm:text-xl font-semibold text-theme-text-primary">Perspectivas de Eulogio (IA)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 my-3">
                {['summary', 'risks', 'steps'].map(type => (
                    <button key={type} onClick={() => handleAiAnalysis(type as 'summary'|'risks'|'steps')} disabled={isAiLoading} 
                            className="p-2 sm:p-2.5 bg-theme-button-secondary-bg text-theme-button-secondary-text rounded-md hover:bg-theme-button-secondary-hover-bg text-xs sm:text-sm font-medium disabled:opacity-50">
                    {type === 'summary' ? 'Generar Resumen' : type === 'risks' ? 'Identificar Riesgos/Necesidades' : 'Sugerir Próximos Pasos'}
                    </button>
                ))}
                </div>
                {isAiLoading && <div className="flex justify-center p-4"><LoadingSpinner /></div>}
                {aiInsight && <div className="mt-3 p-3 bg-theme-bg-tertiary rounded text-sm text-theme-text-primary whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none">{aiInsight}</div>}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3">
                    <h3 className="text-lg sm:text-xl font-semibold text-theme-text-primary">Línea de Tiempo del Caso</h3>
                     {/* Old filter UI is removed. New filtering mechanism can be added later if needed for GoJSTimelineDiagram */}
                </div>
                
                <GoJSTimelineDiagram eventDataArray={goJsTimelineEvents} />
                
                 {/* Interaction handlers like handleTimelineEventClick and states like expandedTimelineEventId
                     are removed as GoJSTimelineDiagram currently does not support item interaction.
                     This can be added in a future iteration. */}
            </div>
        )}

        {activeTab === 'family' && (
          <div className="space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-theme-text-primary mb-1">Entorno Familiar y de Convivencia</h3>
            {currentComposition ? (
              <div className="space-y-5">
                <p className="text-sm text-theme-text-secondary mb-4">
                  Composición efectiva desde: <span className="font-medium text-theme-text-primary">{new Date(currentComposition.effectiveDate).toLocaleDateString('es-ES')}</span>
                </p>
                {currentComposition.notes && (
                  <div className="p-3 bg-theme-bg-tertiary rounded-md mb-4">
                    <p className="text-sm font-semibold text-theme-text-primary">Notas sobre esta composición:</p>
                    <p className="text-sm text-theme-text-secondary whitespace-pre-wrap">{currentComposition.notes}</p>
                  </div>
                )}
                <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
                  <div className="flex-1 bg-theme-bg-secondary p-4 rounded-lg border border-theme-border-secondary">
                    <h4 className="text-md sm:text-lg font-semibold text-theme-text-primary mb-2">Unidad Familiar (Parientes)</h4>
                    {currentComposition.familyUnit.length > 0 ? (
                      <ul className="space-y-2">
                        {currentComposition.familyUnit.map(member => (
                          <li key={member.id} className="p-2.5 bg-theme-bg-card rounded border border-theme-border-primary">
                            <p className="font-medium text-theme-text-primary">{member.fullName}</p>
                            <p className="text-xs text-theme-text-secondary">Relación: {member.relationshipToCaseHolder}</p>
                            {member.dateOfBirth && <p className="text-xs text-theme-text-secondary">Nacimiento: {new Date(member.dateOfBirth).toLocaleDateString('es-ES')}</p>}
                          </li>
                        ))}
                      </ul>
                    ) : <p className="text-sm text-theme-text-secondary">No hay miembros familiares registrados.</p>}
                  </div>
                  <div className="flex-1 bg-theme-bg-secondary p-4 rounded-lg border border-theme-border-secondary">
                    <h4 className="text-md sm:text-lg font-semibold text-theme-text-primary mb-2">Unidad de Convivencia</h4>
                    {currentComposition.householdUnit.length > 0 ? (
                       <ul className="space-y-2">
                        {currentComposition.householdUnit.map(member => (
                          <li key={member.id} className="p-2.5 bg-theme-bg-card rounded border border-theme-border-primary">
                            <p className="font-medium text-theme-text-primary">{member.fullName}</p>
                            {!member.isFamilyMember && member.cohabitationNotes && <p className="text-xs text-theme-text-secondary">Notas Convivencia: {member.cohabitationNotes}</p>}
                            {member.isFamilyMember && <p className="text-xs text-theme-text-accent italic">También es miembro familiar</p>}
                             {member.dateOfBirth && <p className="text-xs text-theme-text-secondary">Nacimiento: {new Date(member.dateOfBirth).toLocaleDateString('es-ES')}</p>}
                          </li>
                        ))}
                      </ul>
                    ) : <p className="text-sm text-theme-text-secondary">No hay miembros convivientes registrados.</p>}
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-theme-border-secondary">
                    <h4 className="text-md sm:text-lg font-semibold text-theme-text-primary mb-3">Genograma Familiar</h4>
                    {/* Replace SimplifiedGenogram with GoJSGenogramDiagram */}
                    {/* Ensure caseDetail is not null before passing to genogram for safety, though already checked by isLoading/!caseDetail */}
                    {caseDetail && currentComposition ? (
                        <GoJSGenogramDiagram nodeDataArray={genogramNodes} linkDataArray={genogramLinks} />
                    ) : (
                        <p className="text-sm text-theme-text-secondary">Datos insuficientes para mostrar el genograma.</p>
                    )}
                </div>
                 <p className="text-xs text-theme-text-secondary italic mt-4">La gestión del historial de composición y la edición se implementarán en futuras versiones.</p>
              </div>
            ) : <p className="text-theme-text-secondary text-sm">No hay información sobre el entorno familiar o de convivencia para este caso.</p>}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-semibold text-theme-text-primary">Tareas del Caso</h3>
              <button onClick={() => {setSelectedTaskForModal({title: '', caseId: caseId}); setIsEditingTask(false); setIsTaskModalOpen(true);}} className="flex items-center px-3 py-1.5 bg-theme-button-primary-bg text-theme-button-primary-text text-xs sm:text-sm rounded-md hover:bg-theme-button-primary-hover-bg"><PlusIcon className="w-4 h-4 mr-1"/>Añadir Tarea</button>
            </div>
            {caseTasks.length > 0 ? caseTasks.map(task => (
              <TaskItem key={task.id} task={task} onClick={() => {setSelectedTaskForModal(task); setIsEditingTask(true); setIsTaskModalOpen(true);}} />
            )) : <p className="text-theme-text-secondary text-sm">No hay tareas asociadas a este caso.</p>}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-semibold text-theme-text-primary">Notas del Caso</h3>
              <button onClick={() => {setSelectedNoteForModal(null); setIsNoteModalOpen(true);}} className="flex items-center px-3 py-1.5 bg-theme-button-primary-bg text-theme-button-primary-text text-xs sm:text-sm rounded-md hover:bg-theme-button-primary-hover-bg"><PlusIcon className="w-4 h-4 mr-1"/>Añadir Nota</button>
            </div>
            {caseNotes.length > 0 ? caseNotes.map(note => (
              <div key={note.id} className="p-3 bg-theme-bg-secondary rounded-md border border-theme-border-primary">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-theme-text-primary">{note.title}</h4>
                    <p className="text-xs text-theme-text-secondary">{new Date(note.date).toLocaleDateString('es-ES')}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => {setSelectedNoteForModal(note); setIsNoteModalOpen(true);}} className="text-theme-accent-primary hover:text-theme-accent-primary-dark p-1" title="Editar Nota"><PencilIcon className="w-4 h-4"/></button>
                    <button onClick={() => handleDeleteNote(note.id)} className="text-red-500 hover:text-red-700 p-1" title="Eliminar Nota"><TrashIcon className="w-4 h-4"/></button>
                  </div>
                </div>
                <p className="text-sm text-theme-text-secondary mt-1 whitespace-pre-wrap">{note.content}</p>
                {note.tags.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{note.tags.map(tag => (<span key={tag} className="text-xs bg-theme-bg-tertiary text-theme-text-secondary px-1.5 py-0.5 rounded-full">{tag}</span>))}</div>}
              </div>
            )) : <p className="text-theme-text-secondary text-sm">No hay notas asociadas a este caso.</p>}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-4">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-theme-text-primary">Agenda del Caso</h3>
                <button 
                  onClick={() => {
                    setSelectedEventForModal(null); 
                    setSelectedDateForNewEventModal(new Date(currentCaseCalendarDate)); 
                    setIsEventModalOpen(true);
                  }} 
                  className="flex items-center px-3 py-1.5 bg-theme-button-primary-bg text-theme-button-primary-text text-xs sm:text-sm rounded-md hover:bg-theme-button-primary-hover-bg">
                  <PlusIcon className="w-4 h-4 mr-1"/>Programar Evento
                </button>
            </div>
            <CalendarControls
              currentDate={currentCaseCalendarDate}
              onPrevMonth={handlePrevMonthForCaseCalendar}
              onNextMonth={handleNextMonthForCaseCalendar}
              onToday={handleTodayForCaseCalendar}
            />
            <MonthView
              currentDate={currentCaseCalendarDate}
              events={caseEvents} 
              onDayClick={handleCaseCalendarDayClick}
              onEventClick={handleCaseCalendarEventClick}
            />
          </div>
        )}
      </div>

      {isTaskModalOpen && (
        <TaskModal 
          isOpen={isTaskModalOpen} 
          onClose={() => {setIsTaskModalOpen(false); setSelectedTaskForModal(null);}} 
          onSave={handleSaveTask} 
          taskData={selectedTaskForModal} 
          isEditing={isEditingTask}
        />
      )}
      {isEventModalOpen && (
        <EventModal 
          isOpen={isEventModalOpen} 
          onClose={() => {setIsEventModalOpen(false); setSelectedEventForModal(null);}} 
          onSave={handleSaveEvent}
          onDelete={selectedEventForModal ? handleDeleteEvent : undefined}
          eventData={selectedEventForModal}
          selectedDate={selectedDateForNewEventModal}
          caseIdToAssociate={activeTab === 'schedule' && caseDetail ? caseDetail.id : undefined}
        />
      )}
      {isNoteModalOpen && (
        <CaseNoteModal
          isOpen={isNoteModalOpen}
          onClose={() => {setIsNoteModalOpen(false); setSelectedNoteForModal(null);}}
          onSave={handleSaveNote}
          noteToEdit={selectedNoteForModal}
        />
      )}
    </div>
  );
};

export default CaseDetailView;
