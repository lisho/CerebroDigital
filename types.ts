
import React from 'react'; // Ensures React types are available

// Defines the main views of the application for navigation and display purposes.
export enum AppView {
  Dashboard = 'Panel',
  Cases = 'Casos',
  Tasks = 'Tareas',
  Schedule = 'Agenda',
  Assessments = 'Evaluaciones',
  AIAssistant = 'Asistente IA', 
  ClientNotes = 'Notas de Cliente',
  Resources = 'Recursos',
  CaseDetail = 'Detalle de Caso' // Potentially for breadcrumbs or titles
}

export enum AdminView {
  Dashboard = 'Admin Dashboard',
  UserManagement = 'Gestión de Usuarios',
  Settings = 'Configuración App',
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string; 
  lastLogin: string; 
}


export type Theme = 'formal' | 'vibrant' | 'terracotta';

export interface User {
  id: string; // Added ID for user identification
  name: string;
  role: string;
  avatarUrl?: string; 
}

export enum CaseStatus {
  Open = 'Abierto',
  InProgress = 'En Progreso',
  Closed = 'Cerrado',
  PendingReview = 'Pendiente Revisión', 
  Active = 'Activo', 
}

export interface Case { 
  id: string;
  clientName: string;
  status: CaseStatus; 
  nextAppointment?: string; 
}

// New interfaces for Family/Household Composition
export enum Gender {
  Male = "Male",
  Female = "Female",
  Other = "Other",
  Unknown = "Unknown"
}

export interface Person {
  id: string; // Unique ID for this person within the system or case context
  fullName: string;
  dateOfBirth?: string; // ISO string YYYY-MM-DD
  gender?: Gender; // Updated to use the Gender enum
}

export interface FamilyMember extends Person {
  relationshipToCaseHolder: string; // e.g., "Cónyuge", "Hijo/a", "Padre/Madre", "Abuelo/a", "Hermano/a"
}

export interface HouseholdMember extends Person {
  // True if this person is also part of the FamilyMember list for this record
  // This helps avoid duplicating person details if they are both family and household
  isFamilyMember: boolean; 
  cohabitationNotes?: string; // e.g., "Compañero/a de piso", "Arrendatario/a", "Amigo/a" - only if not a family member with a defined relationship
}

export interface CompositionUnitRecord {
  recordId: string; // Unique ID for this specific historical record of composition
  effectiveDate: string; // ISO string YYYY-MM-DD, date this composition became effective
  familyUnit: FamilyMember[];
  householdUnit: HouseholdMember[]; // Includes all people living together, family or not
  notes?: string; // Optional notes about this specific composition state or change
}

export interface CaseDetail { 
  id: string;
  clientName: string;
  status: CaseStatus; 
  assignedTo: string; // Worker assigned
  avatarUrl?: string; // Client's avatar
  lastUpdate?: string; 
  description?: string; // A general description or summary of the case
  dateOpened?: string; // When the case was opened
  compositionHistory: CompositionUnitRecord[]; // History of family/household compositions
  // statusHistory?: { status: CaseStatus, date: string, notes?: string }[]; // Future enhancement for detailed status timeline
  // Ensure CaseDetail and other relevant interfaces using gender also refer to the Gender enum if needed.
}

export enum TaskStatus {
  ToDo = 'Por Hacer',
  InProgress = 'En Progreso',
  Assigned = 'Asignada', 
  Completed = 'Completada',
  Pending = 'Pendiente', 
  Scheduled = 'Programada', 
}
export interface TaskDetail { 
  id: string; 
  title: string;
  statusLabel: string; 
  caseId?: string; 
  dueDate: string; // Could be creation date or due date depending on context. For timeline, need to be specific.
  // createdDate?: string; // Future enhancement: explicit creation date for tasks
  // completedDate?: string; // Future enhancement: explicit completion date
  status: TaskStatus; 
  assignedToMe?: boolean; 
  itemType: 'task' | 'appointment'; 
  description?: string; 
  location?: string; 
  originalEventType?: EventType; 
  tags?: string[]; 
  // associatedPersonId?: string; // Consider for future to directly link tasks to a person
}


export interface Notification {
  id: string;
  message: string;
  time: string; 
  icon?: React.ReactNode; 
}


export interface GroundingSource {
  uri: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sources?: GroundingSource[];
  isLoading?: boolean;
  suggestedAppointment?: CreateAppointmentArgs;
  suggestedTask?: CreateTaskArgs; 
}

export interface ClientNote {
  id: string;
  title: string;
  content: string;
  date: string; // ISO date string
  tags: string[];
  caseId?: string; // Associate note with a case
  // relatedPersonIds?: string[]; // Consider for future
}

export interface Resource {
  id: string;
  name: string;
  description: string;
  contact?: string;
  website?: string;
  category: string; // This links back to ResourceCategory.id
}

export interface ResourceCategory {
  id: string;
  name: string;
  iconIdentifier: string; 
  resources: Resource[];
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>; // Added icon property
}

export interface GeminiGroundingChunk {
  web?: {
    uri?: string; 
    title?: string; 
  };
  retrievedContext?: {
    uri?: string; 
    title?: string; 
  };
}

export enum EventType {
  Appointment = 'Cita',
  HomeVisit = 'Visita Domiciliaria',
  TeamMeeting = 'Reunión de Equipo',
  Personal = 'Personal',
  Deadline = 'Fecha Límite',
  Other = 'Otro',
}

export interface ScheduleEvent {
  id: string;
  title: string;
  start: string; 
  end: string;   
  description?: string;
  type: EventType;
  location?: string;
  allDay?: boolean;
  color?: string; 
  alertMinutesBefore?: number; 
  alertTriggered?: boolean; 
  caseId?: string; // Associate event with a case
  // participants?: Array<{ personId: string; role?: string }>; // Consider for future
}

export interface CreateAppointmentArgs {
  title: string;
  startDateTime: string; 
  endDateTime: string;   
  description?: string;
  location?: string;
  eventType?: EventType; 
  allDay?: boolean;
  alertMinutesBefore?: number;
  caseId?: string; // When creating from case detail view
}

export interface CreateTaskArgs {
  title: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
  caseId?: string;
  tags?: string[];
}

export interface DayObject { 
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

// Original Timeline Event Type
export type TimelineEventType = 
  | "Nota Creada" 
  | "Tarea Planificada" 
  | "Tarea Completada" 
  | "Tarea Actualizada" // General update if specific state not captured
  | "Cita Programada" 
  | "Visita Domiciliaria"
  | "Reunión de Equipo"
  | "Evento Personal" // From schedule
  | "Fecha Límite Programada" // From schedule with type Deadline
  | "Otro Evento Agendado" // From schedule with type Other
  | "Cambio de Composición" 
  | "Caso Abierto" 
  | "Actualización de Estado del Caso";

// New Broad Timeline Filter Categories
export type BroadTimelineFilterCategory =
  | "Eventos Personales"
  | "Eventos de Unidad Familiar"
  | "Actuaciones sobre el Caso"
  | "Documentación Generada";

export interface TimelineEvent {
  id: string; // Unique ID for the timeline event itself (e.g., sourceType + sourceId + type-specific-suffix)
  date: string; // ISO date string for sorting and display
  type: TimelineEventType; // Original type of event
  title: string; // Concise title for the timeline entry
  description?: string; // Brief description or relevant details/excerpt
  icon?: React.ReactElement<React.SVGProps<SVGSVGElement>>; // Icon for the original event type
  sourceId?: string; // ID of the original item (note.id, task.id, etc.)
  sourceType?: 'note' | 'task' | 'scheduleEvent' | 'compositionChange' | 'caseUpdate' | 'personSpecific'; // To potentially link back or identify origin
  relatedPersons?: Array<{
    id: string; // Person ID from composition
    fullName: string;
    relationship?: string; // Relationship if relevant to this event context
  }>;
  broadCategory?: BroadTimelineFilterCategory; // New broad category for filtering
}
// End of types.ts file
