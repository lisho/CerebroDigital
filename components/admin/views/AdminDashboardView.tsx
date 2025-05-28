
import React, { useState, useEffect } from 'react';
import { MOCK_CASES_KEY, MOCK_TASKS_KEY, MOCK_CLIENT_NOTES_KEY, MOCK_SCHEDULE_EVENTS_KEY } from '../../../constants';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactElement<React.SVGProps<SVGSVGElement>>; // Corrected type
  colorClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass = 'bg-blue-500' }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-3xl font-bold text-gray-700">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
      </div>
      {icon && (
        <div className={`p-3 rounded-full ${colorClass} text-white`}>
          {React.cloneElement(icon, { className: 'w-6 h-6' })}
        </div>
      )}
    </div>
  </div>
);

// Simple Icons for Stat Cards, updated to accept SVGProps
const CasesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
const TasksIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const NotesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
const EventsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>;


const AdminDashboardView: React.FC = () => {
  const [stats, setStats] = useState({
    totalCases: 0,
    totalTasks: 0,
    totalClientNotes: 0,
    totalScheduleEvents: 0,
  });

  useEffect(() => {
    const getCount = (key: string) => {
      const storedData = localStorage.getItem(key);
      return storedData ? JSON.parse(storedData).length : 0;
    };

    setStats({
      totalCases: getCount(MOCK_CASES_KEY),
      totalTasks: getCount(MOCK_TASKS_KEY),
      totalClientNotes: getCount(MOCK_CLIENT_NOTES_KEY),
      totalScheduleEvents: getCount(MOCK_SCHEDULE_EVENTS_KEY),
    });
  }, []);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-semibold text-gray-800">Dashboard de Administración</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total de Casos" value={stats.totalCases} icon={<CasesIcon />} colorClass="bg-blue-500" />
        <StatCard title="Total de Tareas" value={stats.totalTasks} icon={<TasksIcon />} colorClass="bg-green-500" />
        <StatCard title="Total de Notas de Cliente" value={stats.totalClientNotes} icon={<NotesIcon />} colorClass="bg-yellow-500" />
        <StatCard title="Total de Eventos en Agenda" value={stats.totalScheduleEvents} icon={<EventsIcon />} colorClass="bg-purple-500" />
      </div>

      {/* Placeholder for more charts or quick actions */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Actividad Reciente (Placeholder)</h3>
        <p className="text-gray-600">Aquí se podría mostrar un feed de actividad o gráficos más detallados.</p>
      </div>
    </div>
  );
};

export default AdminDashboardView;
