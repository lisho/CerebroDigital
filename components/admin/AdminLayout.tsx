import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import FloatingAdminButton from '../common/FloatingAdminButton'; // Import the button

const AdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
        <Outlet /> {/* Child admin routes will be rendered here */}
      </main>
      <FloatingAdminButton /> {/* Add the button here */}
    </div>
  );
};

export default AdminLayout;