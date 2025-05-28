/**
 * @file timelineUtils.ts
 * @description Este módulo proporciona funciones de utilidad para transformar datos de diversas fuentes
 * (notas, tareas, eventos de agenda) en un formato unificado adecuado para el componente
 * `GoJSTimelineDiagram`. El objetivo es consolidar estos elementos en una única secuencia
 * cronológica de eventos.
 */
import { CaseDetail, TaskDetail, ScheduleEvent, ClientNote } from '../types';
import { GoJSEventNodeData } from '../components/cases/GoJSTimelineDiagram'; // Ajustar la ruta si es necesario

/**
 * @function transformCaseDataToTimeline
 * @description Consolida y transforma datos de notas, tareas y eventos de agenda asociados a un caso
 * en un array de objetos `GoJSEventNodeData` para ser mostrados en una línea de tiempo.
 * 
 * @param {CaseDetail | undefined} caseData - El objeto detallado del caso. Se usa principalmente para verificar
 * la existencia del caso, aunque el filtrado por `caseId` se hace en cada sección de datos.
 * Si es `undefined`, se retorna un array vacío.
 * @param {TaskDetail[] | undefined} tasks - Un array de tareas. Se filtrarán aquellas asociadas al `caseData.id`.
 * @param {ScheduleEvent[] | undefined} scheduleEvents - Un array de eventos de agenda. Se filtrarán aquellos asociados al `caseData.id`.
 * @param {ClientNote[] | undefined} clientNotes - Un array de notas de cliente. Se filtrarán aquellas asociadas al `caseData.id`.
 * 
 * @returns {GoJSEventNodeData[]} Un array de `GoJSEventNodeData` que contiene todos los eventos transformados
 * y ordenados cronológicamente por fecha (ascendente). Si no hay `caseData` o ninguna de las fuentes
 * de datos contiene eventos para el caso, se retorna un array vacío.
 * 
 * @summary Lógica de Transformación:
 * 1.  **Inicialización**: Si `caseData` no se proporciona, retorna un array vacío.
 * 2.  **Procesamiento de Notas**:
 *     - Itera sobre `clientNotes`.
 *     - Para cada nota perteneciente al `caseData.id`, crea un objeto `GoJSEventNodeData` con:
 *       - `key`: `note-${note.id}`
 *       - `date`: `note.date`
 *       - `text`: `note.title` o un extracto del `note.content`.
 *       - `eventType`: `'Note'`
 *       - `details`: Contiene la nota original y un campo `originalType`.
 * 3.  **Procesamiento de Tareas**:
 *     - Itera sobre `tasks`.
 *     - Para cada tarea perteneciente al `caseData.id`, crea un objeto `GoJSEventNodeData` con:
 *       - `key`: `task-${task.id}`
 *       - `date`: `task.dueDate` (se podría considerar `createdDate` o `completedDate` según la necesidad).
 *       - `text`: `task.title`.
 *       - `eventType`: `'Task'`
 *       - `details`: Contiene la tarea original y un campo `originalType`.
 * 4.  **Procesamiento de Eventos de Agenda**:
 *     - Itera sobre `scheduleEvents`.
 *     - Para cada evento perteneciente al `caseData.id`, crea un objeto `GoJSEventNodeData` con:
 *       - `key`: `event-${event.id}`
 *       - `date`: `event.start` (fecha de inicio del evento).
 *       - `text`: `event.title`.
 *       - `eventType`: `'Appointment'` (podría ser más específico si se usa `event.type`).
 *       - `details`: Contiene el evento original y un campo `originalType`.
 * 5.  **Ordenamiento**: Todos los eventos recolectados se ordenan en un único array por su propiedad `date`
 *     en orden ascendente (los más antiguos primero).
 */
export const transformCaseDataToTimeline = (
  caseData: CaseDetail | undefined,
  tasks: TaskDetail[] | undefined,
  scheduleEvents: ScheduleEvent[] | undefined,
  clientNotes: ClientNote[] | undefined
): GoJSEventNodeData[] => {
  // Si no hay datos del caso, no se pueden procesar eventos.
  if (!caseData) {
    return [];
  }

  const allEvents: GoJSEventNodeData[] = [];

  // Procesar Notas del Cliente
  if (clientNotes) {
    clientNotes.forEach(note => {
      // Asegurar que la nota pertenece al caso actual.
      if (note.caseId === caseData.id) { 
        allEvents.push({
          key: `note-${note.id}`, // Clave única para el nodo.
          date: note.date, // Fecha de la nota.
          text: note.title || note.content.substring(0, 100), // Texto principal a mostrar.
          eventType: 'Note', // Tipo para la visualización.
          details: { ...note, originalType: 'ClientNote' }, // Guardar la nota original para posible acceso futuro.
        });
      }
    });
  }

  // Procesar Tareas
  if (tasks) {
    tasks.forEach(task => {
      // Asegurar que la tarea pertenece al caso actual.
      if (task.caseId === caseData.id) { 
        allEvents.push({
          key: `task-${task.id}`,
          // La fecha relevante para una tarea en la línea de tiempo podría ser su fecha de vencimiento,
          // creación o completado, dependiendo del contexto deseado. Aquí se usa dueDate.
          date: task.dueDate, 
          text: task.title,
          eventType: 'Task',
          details: { ...task, originalType: 'TaskDetail' },
        });
      }
    });
  }

  // Procesar Eventos de Agenda (Citas, etc.)
  if (scheduleEvents) {
    scheduleEvents.forEach(event => {
      // Asegurar que el evento pertenece al caso actual.
      if (event.caseId === caseData.id) { 
        allEvents.push({
          key: `event-${event.id}`,
          date: event.start, // Fecha de inicio del evento.
          text: event.title,
          // Se podría usar event.type (de tipo EventType) para diferenciar más los eventos si es necesario.
          eventType: 'Appointment', 
          details: { ...event, originalType: 'ScheduleEvent' },
        });
      }
    });
  }

  // Ordenar todos los eventos recolectados por fecha, de más antiguo a más reciente.
  // Esto es crucial para que la línea de tiempo se muestre en orden cronológico.
  allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return allEvents;
};
