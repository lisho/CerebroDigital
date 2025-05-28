import React from 'react';
import SummaryCard from '../dashboard/SummaryCard';
import NotificationItem from '../dashboard/NotificationItem';
import CasesTable from '../dashboard/CasesTable';
import { Case, CaseStatus, Notification as NotificationType } from '../../types'; 
import BellIcon from '../icons/BellIcon'; 


const mockSummaryData = [
  { title: 'Casos Activos', value: 12,  accentColorVar: 'var(--color-accent-primary)' }, // Pass CSS var for dynamic color
  { title: 'Tareas Pendientes Hoy', value: 3, accentColorVar: 'var(--color-status-progress-text)' },
  { title: 'Citas Próximas', value: 2,  accentColorVar: 'var(--color-status-pending-text)' },
];

const mockNotifications: NotificationType[] = [
  { id: 'notif1', message: 'Revisión de caso con Ethan Clark', time: '10:00 AM' },
  { id: 'notif2', message: 'Visita domiciliaria con Olivia Turner', time: '2:00 PM' },
  { id: 'notif3', message: 'Nuevo recurso de vivienda disponible', time: 'Ayer' },
];

const mockCases: Case[] = [
  { id: '#12345', clientName: 'Sophia Rodriguez', status: CaseStatus.Active, nextAppointment: 'Mañana, 11:00 AM' },
  { id: '#67890', clientName: 'Ethan Clark', status: CaseStatus.PendingReview, nextAppointment: 'Próxima Semana, 2:00 PM' },
  { id: '#24680', clientName: 'Olivia Turner', status: CaseStatus.Closed },
  { id: '#13579', clientName: 'Liam Garcia', status: CaseStatus.Active, nextAppointment: 'Hoy, 4:00 PM'},
];


const DashboardView: React.FC = () => {
  return (
    <div className="space-y-8 p-1">
      <div>
        <h2 className="text-3xl font-semibold text-theme-text-primary">Panel</h2>
        <p className="text-theme-text-secondary mt-1">¡Bienvenida de nuevo, Emily! Aquí tienes un resumen de tu día.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockSummaryData.map(data => (
          <SummaryCard 
            key={data.title} 
            title={data.title} 
            value={data.value} 
            // Use theme classes for bg, pass accent CSS var for text if needed
            bgColorClass="bg-theme-bg-card" // Card background from theme
            valueColorClass="" // Value will use the accentColorVar
            titleColorClass="text-theme-text-secondary"
            accentColor={data.accentColorVar}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-theme-bg-card p-6 rounded-xl shadow-md space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <BellIcon className="w-6 h-6 text-theme-accent-primary" />
            <h3 className="text-xl font-semibold text-theme-text-primary">Notificaciones</h3>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {mockNotifications.length > 0 ? mockNotifications.map(notif => (
              <NotificationItem key={notif.id} notification={notif} />
            )) : <p className="text-theme-text-secondary">No hay notificaciones nuevas.</p>}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-theme-bg-card p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-theme-text-primary mb-4">Acciones Rápidas</h3>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2.5 bg-theme-button-primary-bg text-theme-button-primary-text rounded-lg font-medium transition-colors shadow-sm hover:bg-theme-button-primary-hover-bg">
                Añadir Nuevo Caso
              </button>
              <button className="px-4 py-2.5 bg-theme-button-secondary-bg text-theme-button-secondary-text rounded-lg font-medium transition-colors shadow-sm hover:bg-theme-button-secondary-hover-bg">
                Programar Cita
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-theme-text-primary mb-4">Resumen de Casos</h3>
            <CasesTable cases={mockCases} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;