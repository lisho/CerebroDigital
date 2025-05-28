
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScheduleEvent, EventType } from '../../types';
import ClockIcon from '../icons/ClockIcon';
import MapPinIcon from '../icons/MapPinIcon';
import CalendarIcon from '../icons/CalendarIcon';
import CustomDatePicker from '../common/CustomDatePicker';
import { formatToDateTimeLocalString, parseDateTimeLocalString, formatFullDateTimeForDisplay } from '../../utils/dateUtils';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: ScheduleEvent) => void;
  onDelete?: (eventId: string) => void;
  eventData?: ScheduleEvent | null;
  selectedDate?: Date | null; // This is the date clicked on the calendar for a new event
  caseIdToAssociate?: string; // New prop for associating event with a case
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  eventData,
  selectedDate,
  caseIdToAssociate, // Destructure new prop
}) => {

  const getInitialDateTimeString = (dateInput?: Date | string | null, defaultTime?: string): string => {
    let baseDate: Date;

    if (dateInput instanceof Date) {
      baseDate = new Date(dateInput);
    } else if (typeof dateInput === 'string') {
      const parsed = parseDateTimeLocalString(dateInput);
      baseDate = parsed || new Date();
    } else {
      baseDate = new Date();
    }

    if (defaultTime) {
      const [hours, minutes] = defaultTime.split(':').map(Number);
      baseDate.setHours(hours, minutes, 0, 0);
    } else if (!(typeof dateInput === 'string' && parseDateTimeLocalString(dateInput))) {
      // If not from existing event data string, and no default time, round to nearest hour or next hour.
      const currentMinutes = baseDate.getMinutes();
      if (currentMinutes > 0 && currentMinutes <=30) baseDate.setMinutes(30);
      else if (currentMinutes > 30) {
        baseDate.setHours(baseDate.getHours() + 1);
        baseDate.setMinutes(0);
      } else {
        baseDate.setMinutes(0); // Set to 00 if already at an hour
      }
    }
    return formatToDateTimeLocalString(baseDate);
  };

  const [title, setTitle] = useState('');
  const [startDateTimeString, setStartDateTimeString] = useState('');
  const [endDateTimeString, setEndDateTimeString] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<EventType>(EventType.Appointment);
  const [location, setLocation] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [alertMinutesBefore, setAlertMinutesBefore] = useState<number | undefined>(undefined);
  const [currentCaseId, setCurrentCaseId] = useState<string | undefined>(undefined); // Store caseId

  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  const startDateInputRef = useRef<HTMLInputElement>(null);
  const endDateInputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<HTMLInputElement>(null);
  const endTimeRef = useRef<HTMLInputElement>(null);

  const resetForm = useCallback(() => {
    const initialStart = eventData?.start || selectedDate || new Date();
    const initialEnd = eventData?.end || selectedDate || new Date();

    setTitle(eventData?.title || '');
    setStartDateTimeString(getInitialDateTimeString(initialStart, eventData ? undefined : '09:00'));
    setEndDateTimeString(getInitialDateTimeString(initialEnd, eventData ? undefined : '10:00'));
    
    setDescription(eventData?.description || '');
    setType(eventData?.type || EventType.Appointment);
    setLocation(eventData?.location || '');
    setAllDay(eventData?.allDay || false);
    setAlertMinutesBefore(eventData?.alertMinutesBefore);
    // Set currentCaseId based on eventData or caseIdToAssociate (for new events)
    setCurrentCaseId(eventData?.caseId || caseIdToAssociate);

  }, [eventData, selectedDate, caseIdToAssociate]); // Added caseIdToAssociate to deps

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleDateSelection = (
    newDate: Date, 
    currentDateTimeString: string, 
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const currentTime = parseDateTimeLocalString(currentDateTimeString) || new Date();
    const combinedDate = new Date(
      newDate.getFullYear(),
      newDate.getMonth(),
      newDate.getDate(),
      currentTime.getHours(),
      currentTime.getMinutes()
    );
    setter(formatToDateTimeLocalString(combinedDate));
  };
  
  const handleTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    currentDateTimeString: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const currentDate = parseDateTimeLocalString(currentDateTimeString) || new Date();
    const [hours, minutes] = e.target.value.split(':').map(Number);
    currentDate.setHours(hours, minutes);
    setter(formatToDateTimeLocalString(currentDate));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('El título del evento es obligatorio.');
      return;
    }
    const finalStartDate = parseDateTimeLocalString(startDateTimeString);
    const finalEndDate = parseDateTimeLocalString(endDateTimeString);

    if (!finalStartDate || !finalEndDate) {
        alert('Las fechas de inicio y fin son inválidas.');
        return;
    }
    if (finalEndDate < finalStartDate) {
        alert('La fecha de fin no puede ser anterior a la fecha de inicio.');
        return;
    }

    const finalEvent: ScheduleEvent = {
      id: eventData?.id || Date.now().toString(),
      title,
      start: finalStartDate.toISOString(),
      end: finalEndDate.toISOString(),
      description,
      type,
      location,
      allDay,
      alertMinutesBefore: alertMinutesBefore ? Number(alertMinutesBefore) : undefined,
      alertTriggered: eventData?.alertTriggered || false,
      caseId: currentCaseId, // Use the stored currentCaseId
    };
    onSave(finalEvent);
  };

  if (!isOpen) return null;

  const alertOptions = [
    { label: 'Ninguna', value: undefined }, { label: 'Al momento del evento', value: 0 },
    { label: '5 minutos antes', value: 5 }, { label: '15 minutos antes', value: 15 },
    { label: '30 minutos antes', value: 30 }, { label: '1 hora antes', value: 60 },
    { label: '1 día antes', value: 1440 },
  ];
  
  const currentStartTime = startDateTimeString ? startDateTimeString.split('T')[1]?.substring(0,5) : '09:00';
  const currentEndTime = endDateTimeString ? endDateTimeString.split('T')[1]?.substring(0,5) : '10:00';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-[900]" role="dialog" aria-modal="true">
      <div className="bg-theme-bg-card p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold text-theme-text-primary mb-4">
            {eventData ? 'Editar Evento' : 'Nuevo Evento'}
          </h2>

          <div>
            <label htmlFor="eventTitle" className="block text-sm font-medium text-theme-text-secondary">Título</label>
            <input
              id="eventTitle" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full p-2 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary focus:ring-theme-accent-primary focus:border-theme-accent-primary"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="eventStartDate" className="block text-sm font-medium text-theme-text-secondary">Fecha Inicio</label>
              <div className="relative mt-1">
                <input
                  type="text" id="eventStartDate" ref={startDateInputRef}
                  value={formatFullDateTimeForDisplay(startDateTimeString).split(',')[0]} // Display only date part
                  onFocus={() => setIsStartDatePickerOpen(true)} readOnly
                  className="w-full p-2 pr-10 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary cursor-pointer"
                />
                <button type="button" onClick={() => setIsStartDatePickerOpen(true)} className="absolute inset-y-0 right-0 px-2 flex items-center text-theme-text-secondary hover:text-theme-accent-primary">
                  <CalendarIcon className="w-5 h-5"/>
                </button>
              </div>
              {isStartDatePickerOpen && startDateInputRef.current && (
                <CustomDatePicker
                  isOpen={isStartDatePickerOpen}
                  onClose={() => setIsStartDatePickerOpen(false)}
                  onDateSelect={(date) => handleDateSelection(date, startDateTimeString, setStartDateTimeString)}
                  initialDate={parseDateTimeLocalString(startDateTimeString)}
                  anchorEl={startDateInputRef.current}
                />
              )}
            </div>
             <div>
              <label htmlFor="eventStartTime" className="block text-sm font-medium text-theme-text-secondary">Hora Inicio</label>
              <input
                type="time" id="eventStartTime" ref={startTimeRef}
                value={currentStartTime}
                onChange={(e) => handleTimeChange(e, startDateTimeString, setStartDateTimeString)}
                className="mt-1 block w-full p-2 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="eventEndDate" className="block text-sm font-medium text-theme-text-secondary">Fecha Fin</label>
              <div className="relative mt-1">
                 <input
                  type="text" id="eventEndDate" ref={endDateInputRef}
                  value={formatFullDateTimeForDisplay(endDateTimeString).split(',')[0]} // Display only date part
                  onFocus={() => setIsEndDatePickerOpen(true)} readOnly
                  className="w-full p-2 pr-10 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary cursor-pointer"
                />
                <button type="button" onClick={() => setIsEndDatePickerOpen(true)} className="absolute inset-y-0 right-0 px-2 flex items-center text-theme-text-secondary hover:text-theme-accent-primary">
                  <CalendarIcon className="w-5 h-5"/>
                </button>
              </div>
              {isEndDatePickerOpen && endDateInputRef.current && (
                <CustomDatePicker
                  isOpen={isEndDatePickerOpen}
                  onClose={() => setIsEndDatePickerOpen(false)}
                  onDateSelect={(date) => handleDateSelection(date, endDateTimeString, setEndDateTimeString)}
                  initialDate={parseDateTimeLocalString(endDateTimeString)}
                  anchorEl={endDateInputRef.current}
                />
              )}
            </div>
            <div>
              <label htmlFor="eventEndTime" className="block text-sm font-medium text-theme-text-secondary">Hora Fin</label>
              <input
                type="time" id="eventEndTime" ref={endTimeRef}
                value={currentEndTime}
                onChange={(e) => handleTimeChange(e, endDateTimeString, setEndDateTimeString)}
                className="mt-1 block w-full p-2 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary"
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <input id="allDay" type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)}
              className="h-4 w-4 text-theme-accent-primary border-theme-border-primary rounded focus:ring-theme-accent-primary"
            />
            <label htmlFor="allDay" className="ml-2 block text-sm text-theme-text-secondary">Todo el día</label>
          </div>

          <div>
            <label htmlFor="eventType" className="block text-sm font-medium text-theme-text-secondary">Tipo de Evento</label>
            <select id="eventType" value={type} onChange={(e) => setType(e.target.value as EventType)}
              className="mt-1 block w-full p-2 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary focus:ring-theme-accent-primary focus:border-theme-accent-primary"
            >
              {Object.values(EventType).map(val => <option key={val} value={val}>{val}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="eventLocation" className="block text-sm font-medium text-theme-text-secondary flex items-center">
              <MapPinIcon className="w-4 h-4 mr-1 inline" /> Ubicación (Opcional)
            </label>
            <input id="eventLocation" type="text" value={location} onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej: Oficina, Domicilio Cliente X"
              className="mt-1 block w-full p-2 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary focus:ring-theme-accent-primary focus:border-theme-accent-primary"
            />
          </div>
          
          <div>
            <label htmlFor="eventDescription" className="block text-sm font-medium text-theme-text-secondary">Descripción (Opcional)</label>
            <textarea id="eventDescription" value={description} onChange={(e) => setDescription(e.target.value)}
              rows={3} placeholder="Notas adicionales sobre el evento..."
              className="mt-1 block w-full p-2 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary focus:ring-theme-accent-primary focus:border-theme-accent-primary"
            />
          </div>

          <div>
            <label htmlFor="eventAlert" className="block text-sm font-medium text-theme-text-secondary flex items-center">
               <ClockIcon className="w-4 h-4 mr-1 inline" /> Alerta (Opcional)
            </label>
            <select id="eventAlert" value={alertMinutesBefore === undefined ? '' : String(alertMinutesBefore)}
              onChange={(e) => setAlertMinutesBefore(e.target.value ? Number(e.target.value) : undefined)}
              className="mt-1 block w-full p-2 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary focus:ring-theme-accent-primary focus:border-theme-accent-primary"
            >
              {alertOptions.map(opt => <option key={opt.label} value={opt.value === undefined ? '' : opt.value}>{opt.label}</option>)}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            {eventData && onDelete && (
              <button type="button" onClick={() => onDelete(eventData.id)}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors w-full sm:w-auto">
                Eliminar
              </button>
            )}
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium bg-theme-button-secondary-bg text-theme-button-secondary-text rounded-md hover:bg-theme-button-secondary-hover-bg transition-colors w-full sm:w-auto">
              Cancelar
            </button>
            <button type="submit"
              className="px-4 py-2 text-sm font-medium bg-theme-button-primary-bg text-theme-button-primary-text rounded-md hover:bg-theme-button-primary-hover-bg transition-colors w-full sm:w-auto">
              {eventData ? 'Guardar Cambios' : 'Crear Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
