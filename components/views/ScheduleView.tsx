
import React, { useState, useEffect, useCallback } from 'react';
import { ScheduleEvent, EventType, CreateAppointmentArgs } from '../../types';
import CalendarControls from '../schedule/CalendarControls';
import MonthView from '../schedule/MonthView';
import EventModal from '../schedule/EventModal';
import { MOCK_SCHEDULE_EVENTS_KEY } from '../../constants';
import PlusIcon from '../icons/PlusIcon';
import { usePendingAppointment } from '../../contexts/PendingAppointmentContext';
import LoadingSpinner from '../LoadingSpinner'; // Added

const ScheduleView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoadingEvents] = useState(true); // Added
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [selectedDateForNewEvent, setSelectedDateForNewEvent] = useState<Date | null>(null);
  const [caseIdForPendingEvent, setCaseIdForPendingEvent] = useState<string | undefined>(undefined);


  const { pendingAppointment, clearPendingAppointment } = usePendingAppointment();

  // Load events from localStorage or fetch from JSON
  const loadEvents = useCallback(async () => {
    setIsLoadingEvents(true);
    const storedEvents = localStorage.getItem(MOCK_SCHEDULE_EVENTS_KEY);
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents).map((e: ScheduleEvent) => ({
        ...e,
        start: new Date(e.start).toISOString(), 
        end: new Date(e.end).toISOString(),
      })));
      setIsLoadingEvents(false);
    } else {
        try {
            const response = await fetch('/data/scheduleEvents.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const fetchedEvents: ScheduleEvent[] = (await response.json()).map((e: ScheduleEvent) => ({
                ...e,
                start: new Date(e.start).toISOString(), 
                end: new Date(e.end).toISOString(),
            }));
            setEvents(fetchedEvents);
            localStorage.setItem(MOCK_SCHEDULE_EVENTS_KEY, JSON.stringify(fetchedEvents));
        } catch (error) {
            console.error("Error fetching initial schedule events:", error);
            setEvents([]);
        } finally {
            setIsLoadingEvents(false);
        }
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);
  
  // Effect to handle pending appointment from context
  useEffect(() => {
    if (pendingAppointment) {
      const newEventFromPending: ScheduleEvent = {
        id: Date.now().toString(), // Generate a new ID for this potential event
        title: pendingAppointment.title,
        start: new Date(pendingAppointment.startDateTime).toISOString(),
        end: new Date(pendingAppointment.endDateTime).toISOString(),
        description: pendingAppointment.description || '',
        type: pendingAppointment.eventType || EventType.Appointment,
        location: pendingAppointment.location || '',
        allDay: pendingAppointment.allDay || false,
        alertMinutesBefore: pendingAppointment.alertMinutesBefore,
        alertTriggered: false,
        caseId: pendingAppointment.caseId, // Include caseId from pendingAppointment
      };
      setSelectedEvent(newEventFromPending); 
      setSelectedDateForNewEvent(null);
      setCaseIdForPendingEvent(pendingAppointment.caseId); // Store caseId for the modal
      setIsModalOpen(true);
      clearPendingAppointment(); 
    }
  }, [pendingAppointment, clearPendingAppointment]);


  // Save events to localStorage
  const saveEvents = (updatedEvents: ScheduleEvent[]) => {
    localStorage.setItem(MOCK_SCHEDULE_EVENTS_KEY, JSON.stringify(updatedEvents));
    setEvents(updatedEvents);
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (date: Date) => {
    setSelectedDateForNewEvent(date);
    setSelectedEvent(null); 
    setCaseIdForPendingEvent(undefined); // No caseId for general schedule event
    setIsModalOpen(true);
  };

  const handleEventClick = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setSelectedDateForNewEvent(null); 
    setCaseIdForPendingEvent(event.caseId); // Use existing caseId if editing
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setSelectedDateForNewEvent(null);
    setCaseIdForPendingEvent(undefined);
  };

  const handleModalSave = (eventToSave: ScheduleEvent) => {
    const existingEventIndex = events.findIndex(e => e.id === eventToSave.id);
    let updatedEvents;
    if (existingEventIndex > -1) {
      updatedEvents = events.map(e => e.id === eventToSave.id ? eventToSave : e);
    } else {
      // Ensure truly new events get a unique ID if one wasn't already pre-filled (e.g., from pendingAppointment)
      const trulyNewEvent = {...eventToSave, id: events.find(e => e.id === eventToSave.id) ? Date.now().toString() : eventToSave.id};
      updatedEvents = [...events, trulyNewEvent];
    }
    saveEvents(updatedEvents);
    handleModalClose();
  };
  
  const handleModalDelete = (eventId: string) => {
    saveEvents(events.filter(e => e.id !== eventId));
    handleModalClose();
  };

  // Alert System
  useEffect(() => {
    const checkAlerts = () => {
      const now = new Date().getTime();
      events.forEach(event => {
        if (event.alertMinutesBefore !== undefined && !event.alertTriggered) { // Check for undefined explicitly
          const eventStartTime = new Date(event.start).getTime();
          const alertTime = eventStartTime - (event.alertMinutesBefore * 60000);
          if (now >= alertTime && now < eventStartTime) {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                new Notification('Alerta de Evento: Cerebro Digital', {
                  body: `${event.title} - comienza en ${event.alertMinutesBefore} minutos.`,
                });
                const updatedEvents = events.map(e => e.id === event.id ? { ...e, alertTriggered: true } : e);
                saveEvents(updatedEvents);
              }
            });
          }
        }
      });
    };

    const intervalId = setInterval(checkAlerts, 60000); 
    return () => clearInterval(intervalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]); 

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
        <p className="ml-3 text-theme-text-secondary">Cargando agenda...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-theme-text-primary">Agenda</h2>
        <button
          onClick={() => {
            setSelectedEvent(null); 
            setSelectedDateForNewEvent(new Date(currentDate));
            setCaseIdForPendingEvent(undefined); // No caseId for general schedule event
            setIsModalOpen(true);
          }}
          className="w-full md:w-auto flex items-center justify-center px-4 py-2.5 bg-theme-button-primary-bg text-theme-button-primary-text rounded-lg font-medium transition-colors shadow-sm hover:bg-theme-button-primary-hover-bg text-sm"
          aria-label="Añadir nuevo evento"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nuevo Evento
        </button>
      </div>
      
      <CalendarControls
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />
      <MonthView
        currentDate={currentDate}
        events={events}
        onDayClick={handleDayClick}
        onEventClick={handleEventClick}
      />
      <EventModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        onDelete={selectedEvent ? handleModalDelete : undefined}
        eventData={selectedEvent}
        selectedDate={selectedDateForNewEvent}
        caseIdToAssociate={caseIdForPendingEvent} // Pass the caseId
      />
    </div>
  );
};

export default ScheduleView;
