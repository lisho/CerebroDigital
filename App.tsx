
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// User-facing components
import Sidebar from './components/Sidebar';
import DashboardView from './components/views/DashboardView';
import AIChatView from './components/views/AIChatView';
import ClientNotesView from './components/views/ClientNotesView';
import ResourcesView from './components/views/ResourcesView';
import CasesView from './components/views/CasesView'; 
import TasksView from './components/views/TasksView'; 
import UserProfileView from './components/views/UserProfileView';
import ScheduleView from './components/views/ScheduleView';
import CaseDetailView from './components/views/CaseDetailView'; // Added
import FloatingAdminButton from './components/common/FloatingAdminButton'; 

// Admin components
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardView from './components/admin/views/AdminDashboardView';
import AdminUserManagementView from './components/admin/views/AdminUserManagementView';
import AdminAppSettingsView from './components/admin/views/AdminAppSettingsView';

// Placeholder components
const AssessmentsViewPlaceholder: React.FC = () => <div className="p-6"><h1 className="text-2xl text-theme-text-primary">Vista de Evaluaciones (En construcción)</h1></div>;

// Layout for the main user-facing application
const UserAppLayout: React.FC = () => (
  <div className="flex h-screen bg-theme-bg-primary text-theme-text-primary">
    <Sidebar />
    <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
      <Outlet /> {/* Child routes will be rendered here */}
    </main>
    <FloatingAdminButton /> 
  </div>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Admin Panel Routes */}
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardView />} />
          <Route path="users" element={<AdminUserManagementView />} />
          <Route path="settings" element={<AdminAppSettingsView />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} /> 
        </Route>

        {/* User Application Routes */}
        <Route path="/" element={<UserAppLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardView />} />
          <Route path="cases" element={<CasesView />} />
          <Route path="case/:caseId" element={<CaseDetailView />} /> {/* Added route for individual case view */}
          <Route path="tasks" element={<TasksView />} />
          <Route path="schedule" element={<ScheduleView />} />
          <Route path="assessments" element={<AssessmentsViewPlaceholder />} />
          <Route path="ai-assistant" element={<AIChatView />} />
          <Route path="client-notes" element={<ClientNotesView />} />
          <Route path="resources" element={<ResourcesView />} />
          <Route path="profile" element={<UserProfileView />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;