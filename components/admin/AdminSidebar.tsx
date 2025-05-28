
import React from 'react';
import { NavLink } from 'react-router-dom';
import { AdminView } from '../../types'; // Assuming AdminView enum exists

// Placeholder Icons (replace with actual icons if available or create more specific ones)
const AdminDashboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3M3.75 21h16.5M12 3.75h.008v.008H12V3.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.125 8.25H7.875M16.125 12H7.875" />
  </svg>
);

const AdminUsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const AdminSettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774a1.125 1.125 0 01-.012 1.588l-.737.527c-.35.25-.52.678-.479 1.098.04.42.28.787.621 1.006l.737.527a1.125 1.125 0 01.012 1.588l-.773.774a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.205-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 01-1.45-.12l-.773-.774a1.125 1.125 0 01.012-1.588l.738-.527c.34-.24.58-.6.621-1.006.04-.42-.14-.838-.49-1.098l-.736-.527a1.125 1.125 0 01-.013-1.588l.774-.774a1.125 1.125 0 011.45-.12l.736.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.149-.894z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);


interface AdminNavItem {
  name: AdminView;
  path: string;
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
}

const adminNavItems: AdminNavItem[] = [
  { name: AdminView.Dashboard, path: '/admin/dashboard', icon: <AdminDashboardIcon /> },
  { name: AdminView.UserManagement, path: '/admin/users', icon: <AdminUsersIcon /> },
  { name: AdminView.Settings, path: '/admin/settings', icon: <AdminSettingsIcon /> },
];

const AdminSidebar: React.FC = () => {
  const renderNavLinks = (items: AdminNavItem[]) => items.map((item) => (
    <NavLink
      key={item.name}
      to={item.path}
      className={({ isActive }) =>
        `flex items-center space-x-3 p-3 rounded-md transition-colors duration-150 text-sm font-medium
         ${isActive
           ? 'bg-blue-600 text-white' // Active state for admin sidebar
           : 'text-gray-300 hover:bg-gray-700 hover:text-white'}` // Default and hover for admin
      }
    >
      {React.cloneElement(item.icon, {
        className: `w-5 h-5` // Icon size
      })}
      <span>{item.name}</span>
    </NavLink>
  ));

  return (
    <div className="w-60 md:w-64 bg-gray-800 h-full shadow-lg flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-700">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white leading-tight">
            Panel Admin
          </h1>
          <p className="text-xs text-gray-400 opacity-80">
            Cerebro Digital
          </p>
        </div>
      </div>

      <nav className="flex-grow p-3 space-y-1.5 overflow-y-auto">
        {renderNavLinks(adminNavItems)}
      </nav>

      <div className="p-4 border-t border-gray-700 text-center mt-auto">
        <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} Admin</p>
      </div>
    </div>
  );
};

export default AdminSidebar;
