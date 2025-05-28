
import React from 'react';
import { 
    CaseStatus, TimelineEvent, TimelineEventType, Person as PersonType, 
    CaseDetail, TaskDetail, ClientNote, ScheduleEvent, EventType, 
    TaskStatus as TaskStatusEnum, FamilyMember, HouseholdMember, 
    BroadTimelineFilterCategory 
} from '../types'; // Updated import path to relative

// Icons are imported from a central index file
import {
    UsersIcon as DefaultUsersIcon,
    TimelineIcon as DefaultTimelineIcon,
    StarIcon as DefaultStarIcon,
    BriefcaseIcon as DefaultBriefcaseIcon,
    DocumentTextIconSvg as DefaultDocumentTextIconSvg,
    ClipboardListIcon as DefaultClipboardListIcon,
    CalendarDaysIconSvg as DefaultCalendarDaysIconSvg,
    InformationCircleIcon as DefaultInformationCircleIcon,
} from '../components/icons'; 

export const getStatusBadgeClasses = (status: CaseStatus): string => {
  switch (status) {
    case CaseStatus.Open: case CaseStatus.Active: return 'bg-status-open-bg text-status-open-text';
    case CaseStatus.InProgress: return 'bg-status-progress-bg text-status-progress-text';
    case CaseStatus.PendingReview: return 'bg-status-pending-bg text-status-pending-text';
    case CaseStatus.Closed: return 'bg-status-closed-bg text-status-closed-text';
    default: return 'bg-gray-200 text-gray-700';
  }
};

export const getTimelineEventColor = (event: TimelineEvent): string => {
    const category = event.broadCategory;
    switch (category) {
      case "Eventos Personales": return 'var(--color-status-open-text)'; 
      case "Eventos de Unidad Familiar": return 'var(--color-status-pending-text)'; 
      case "Actuaciones sobre el Caso": return 'var(--color-status-progress-text)';
      case "Documentación Generada": return 'var(--color-accent-primary)'; 
      default: return 'var(--color-text-secondary)';
    }
};
  
export const getTimelineEventIconElement = (type: TimelineEventType): React.ReactElement => { 
    const iconSpecificProps = { className: "w-4 h-4 text-theme-accent-primary" };
    switch (type) {
        case "Nota Creada": return React.createElement(DefaultDocumentTextIconSvg, iconSpecificProps);
        case "Tarea Planificada": 
        case "Tarea Completada": 
        case "Tarea Actualizada": 
            return React.createElement(DefaultClipboardListIcon, iconSpecificProps);
        case "Cita Programada": 
        case "Visita Domiciliaria": 
        case "Reunión de Equipo": 
        case "Evento Personal": 
        case "Fecha Límite Programada": 
        case "Otro Evento Agendado": 
            return React.createElement(DefaultCalendarDaysIconSvg, iconSpecificProps);
        case "Cambio de Composición": 
            return React.createElement(DefaultUsersIcon, iconSpecificProps);
        case "Caso Abierto": 
        case "Actualización de Estado del Caso": 
            return React.createElement(DefaultInformationCircleIcon, iconSpecificProps);
        default: 
            // Fallback for any unhandled TimelineEventType
            // const exhaustiveCheck: never = type; // This line was causing the SyntaxError
            console.warn("Unhandled TimelineEventType for icon:", type)
            return React.createElement(DefaultInformationCircleIcon, iconSpecificProps);
    }
};

export const generateTimelineEvents = (
    currentCaseDetail: CaseDetail | null,
    tasks: TaskDetail[],
    notes: ClientNote[],
    scheduleItems: ScheduleEvent[]
  ): TimelineEvent[] => {
    if (!currentCaseDetail) return [];
    const events: TimelineEvent[] = [];
    
    const allPersonsInCaseMap = new Map<string, { 
        id: string; 
        fullName: string; 
        relationship?: string; 
        isFamily?: boolean; 
        cohabitationNotes?: string; 
        dateOfBirth?: string; 
        gender?: string 
    }>();

    if (currentCaseDetail.compositionHistory && currentCaseDetail.compositionHistory.length > 0) {
        const latestComposition = currentCaseDetail.compositionHistory.sort((a,b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())[0];

        latestComposition.familyUnit.forEach(fm => {
            if (!allPersonsInCaseMap.has(fm.id)) {
                allPersonsInCaseMap.set(fm.id, {
                    id: fm.id, fullName: fm.fullName,
                    relationship: fm.relationshipToCaseHolder, isFamily: true,
                    dateOfBirth: fm.dateOfBirth, gender: fm.gender
                });
            }
        });

        latestComposition.householdUnit.forEach(hm => {
            if (allPersonsInCaseMap.has(hm.id)) {
                const existing = allPersonsInCaseMap.get(hm.id)!;
                if (!existing.cohabitationNotes && hm.cohabitationNotes) existing.cohabitationNotes = hm.cohabitationNotes;
                if (!existing.dateOfBirth && hm.dateOfBirth) existing.dateOfBirth = hm.dateOfBirth;
                if (!existing.gender && hm.gender) existing.gender = hm.gender;
            } else {
                allPersonsInCaseMap.set(hm.id, {
                    id: hm.id, fullName: hm.fullName,
                    relationship: hm.isFamilyMember ? undefined : hm.cohabitationNotes,
                    isFamily: hm.isFamilyMember, cohabitationNotes: hm.cohabitationNotes,
                    dateOfBirth: hm.dateOfBirth, gender: hm.gender,
                });
            }
        });
    }
    const allPersonsInCase = Array.from(allPersonsInCaseMap.values());
    const caseHolderPersonId = `caseholder-${currentCaseDetail.id}`;
    if (!allPersonsInCase.find(p => p.id === caseHolderPersonId)) {
         allPersonsInCase.push({
            id: caseHolderPersonId, fullName: currentCaseDetail.clientName, relationship: "Titular del Caso", isFamily: true 
        });
    }

    const caseHolderRelatedPerson: TimelineEvent['relatedPersons'][0] = { id: caseHolderPersonId, fullName: currentCaseDetail.clientName, relationship: "Titular del Caso" };

    if (currentCaseDetail.dateOpened) {
      events.push({
        id: `case-open-${currentCaseDetail.id}`, date: currentCaseDetail.dateOpened, type: "Caso Abierto",
        title: `Caso Abierto para ${currentCaseDetail.clientName}`, description: `Asignado a: ${currentCaseDetail.assignedTo}.`,
        sourceId: currentCaseDetail.id, sourceType: 'caseUpdate',
        relatedPersons: [caseHolderRelatedPerson],
        broadCategory: "Actuaciones sobre el Caso",
        icon: getTimelineEventIconElement("Caso Abierto")
      });
    }
    events.push({
        id: `case-status-${currentCaseDetail.id}-${currentCaseDetail.lastUpdate || new Date().toISOString()}`,
        date: currentCaseDetail.lastUpdate || new Date(currentCaseDetail.dateOpened || Date.now()).toISOString(), type: "Actualización de Estado del Caso",
        title: `Estado actual: ${currentCaseDetail.status}`, description: `Última actualización registrada del estado del caso.`,
        sourceId: currentCaseDetail.id, sourceType: 'caseUpdate',
        relatedPersons: [caseHolderRelatedPerson],
        broadCategory: "Actuaciones sobre el Caso",
        icon: getTimelineEventIconElement("Actualización de Estado del Caso")
    });

    notes.forEach(note => {
      const mentionedPersons: TimelineEvent['relatedPersons'] = [];
      allPersonsInCase.forEach(person => {
        if ((note.title.toLowerCase().includes(person.fullName.toLowerCase()) || note.content.toLowerCase().includes(person.fullName.toLowerCase())) && !mentionedPersons.find(mp => mp.id === person.id)) {
          mentionedPersons.push({ id: person.id, fullName: person.fullName, relationship: person.relationship || (person.isFamily ? 'Familiar' : person.cohabitationNotes) });
        }
      });
      events.push({
        id: `note-${note.id}`, date: note.date, type: "Nota Creada", title: note.title,
        description: note.content, sourceId: note.id, sourceType: 'note',
        relatedPersons: mentionedPersons.length > 0 ? mentionedPersons : [caseHolderRelatedPerson],
        broadCategory: "Documentación Generada",
        icon: getTimelineEventIconElement("Nota Creada")
      });
    });

    tasks.forEach(task => { 
      const mentionedPersons: TimelineEvent['relatedPersons'] = [];
       allPersonsInCase.forEach(person => {
        if (task.description && (task.title.toLowerCase().includes(person.fullName.toLowerCase()) || task.description.toLowerCase().includes(person.fullName.toLowerCase())) && !mentionedPersons.find(mp => mp.id === person.id) ) {
           mentionedPersons.push({ id: person.id, fullName: person.fullName, relationship: person.relationship || (person.isFamily ? 'Familiar' : person.cohabitationNotes) });
        } else if (task.title.toLowerCase().includes(person.fullName.toLowerCase()) && !mentionedPersons.find(mp => mp.id === person.id)) {
             mentionedPersons.push({ id: person.id, fullName: person.fullName, relationship: person.relationship || (person.isFamily ? 'Familiar' : person.cohabitationNotes) });
        }
      });
      let taskBroadCategory: BroadTimelineFilterCategory = "Actuaciones sobre el Caso";
      if (task.title.toLowerCase().includes("informe") || task.title.toLowerCase().includes("documento") || task.title.toLowerCase().includes("valoración") || (task.description && (task.description.toLowerCase().includes("informe") || task.description.toLowerCase().includes("documento")))) {
        taskBroadCategory = "Documentación Generada";
      } else if (task.title.toLowerCase().includes("laboral") || task.title.toLowerCase().includes("empleo") || task.title.toLowerCase().includes("vivienda") || task.title.toLowerCase().includes("salud")){
        taskBroadCategory = "Eventos Personales";
      }

      events.push({
        id: `task-plan-${task.id}`, date: task.dueDate, type: "Tarea Planificada", title: task.title,
        description: task.description, sourceId: task.id, sourceType: 'task',
        relatedPersons: mentionedPersons.length > 0 ? mentionedPersons : [caseHolderRelatedPerson],
        broadCategory: taskBroadCategory,
        icon: getTimelineEventIconElement("Tarea Planificada")
      });
      if (task.status === TaskStatusEnum.Completed) {
        events.push({
          id: `task-complete-${task.id}`, date: task.dueDate, type: "Tarea Completada",
          title: `Completada: ${task.title}`, description: "La tarea fue marcada como completada.",
          sourceId: task.id, sourceType: 'task',
          relatedPersons: mentionedPersons.length > 0 ? mentionedPersons : [caseHolderRelatedPerson],
          broadCategory: taskBroadCategory,
          icon: getTimelineEventIconElement("Tarea Completada")
        });
      }
    });

    scheduleItems.forEach(event => { 
      let eventTypeString: TimelineEventType = "Otro Evento Agendado";
      let broadCategory: BroadTimelineFilterCategory = "Actuaciones sobre el Caso"; 
      switch(event.type) {
          case EventType.Appointment: eventTypeString = "Cita Programada"; broadCategory = "Actuaciones sobre el Caso"; break;
          case EventType.HomeVisit: eventTypeString = "Visita Domiciliaria"; broadCategory = "Actuaciones sobre el Caso"; break;
          case EventType.TeamMeeting: eventTypeString = "Reunión de Equipo"; broadCategory = "Actuaciones sobre el Caso"; break;
          case EventType.Personal: eventTypeString = "Evento Personal"; broadCategory = "Eventos Personales"; break;
          case EventType.Deadline: eventTypeString = "Fecha Límite Programada"; broadCategory = "Eventos Personales"; break; 
          case EventType.Other: eventTypeString = "Otro Evento Agendado"; broadCategory = "Eventos Personales"; break;
      }
       const mentionedPersons: TimelineEvent['relatedPersons'] = [];
       allPersonsInCase.forEach(person => {
        if (event.description && (event.title.toLowerCase().includes(person.fullName.toLowerCase()) || event.description.toLowerCase().includes(person.fullName.toLowerCase())) && !mentionedPersons.find(mp => mp.id === person.id)) {
           mentionedPersons.push({ id: person.id, fullName: person.fullName, relationship: person.relationship || (person.isFamily ? 'Familiar' : person.cohabitationNotes) });
        } else if (event.title.toLowerCase().includes(person.fullName.toLowerCase()) && !mentionedPersons.find(mp => mp.id === person.id)) {
            mentionedPersons.push({ id: person.id, fullName: person.fullName, relationship: person.relationship || (person.isFamily ? 'Familiar' : person.cohabitationNotes) });
        }
      });
      events.push({
        id: `schedule-${event.id}`, date: event.start, type: eventTypeString, title: event.title,
        description: event.description, sourceId: event.id, sourceType: 'scheduleEvent',
        relatedPersons: mentionedPersons.length > 0 ? mentionedPersons : [caseHolderRelatedPerson],
        broadCategory: broadCategory,
        icon: getTimelineEventIconElement(eventTypeString)
      });
    });

    (currentCaseDetail.compositionHistory || []).forEach(record => {
        const uniquePersonsInThisRecord: (FamilyMember | HouseholdMember)[] = [];
        const personIdsInThisRecord = new Set<string>();

        record.familyUnit.forEach(fm => { if (!personIdsInThisRecord.has(fm.id)) { uniquePersonsInThisRecord.push(fm); personIdsInThisRecord.add(fm.id); } });
        record.householdUnit.forEach(hm => { if (!personIdsInThisRecord.has(hm.id)) { uniquePersonsInThisRecord.push(hm); personIdsInThisRecord.add(hm.id); } });
        
        const involvedPersonsForCompositionEvent: TimelineEvent['relatedPersons'] = uniquePersonsInThisRecord.map(person => {
            let relationshipValue: string | undefined;
            if ('relationshipToCaseHolder' in person) {
                relationshipValue = (person as FamilyMember).relationshipToCaseHolder;
            } else if ('isFamilyMember' in person) { 
                const hm = person as HouseholdMember;
                relationshipValue = hm.isFamilyMember ? (record.familyUnit.find(f => f.id === hm.id)?.relationshipToCaseHolder || "Familiar") : hm.cohabitationNotes;
            }
            return { id: person.id, fullName: person.fullName, relationship: relationshipValue };
        }).filter(p => p.relationship !== undefined) as TimelineEvent['relatedPersons']; // Ensure relationship is defined
      
        events.push({
            id: `comp-${record.recordId}`, date: record.effectiveDate, type: "Cambio de Composición",
            title: record.notes || "Actualización en composición familiar/convivencia",
            description: `Unidad Familiar: ${record.familyUnit.length} miembro(s). Unidad Convivencia: ${record.householdUnit.length} miembro(s).\nNotas adicionales sobre este cambio: ${record.notes || 'N/A'}`,
            sourceId: record.recordId, sourceType: 'compositionChange',
            relatedPersons: involvedPersonsForCompositionEvent.length > 0 ? involvedPersonsForCompositionEvent : [caseHolderRelatedPerson],
            broadCategory: "Eventos de Unidad Familiar",
            icon: getTimelineEventIconElement("Cambio de Composición")
        });
    });
    
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); 
  };