
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { AppView, User } from '../types';
import UserProfile from './common/UserProfile'; 
import LoadingSpinner from './LoadingSpinner'; // For loading state

import HomeIcon from './icons/HomeIcon';
import UserGroupIcon from './icons/UserGroupIcon';
import CheckBadgeIcon from './icons/CheckBadgeIcon'; 
import CalendarDaysIcon from './icons/CalendarDaysIcon';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon';
import SparklesIcon from './icons/SparklesIcon'; 

export const DocumentTextIcon = () => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="sidebar-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);
const CollectionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="sidebar-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M15.375 14.25L12 17.625l-3.375-3.375M12 3c2.485 0 4.5 2.015 4.5 4.5S14.485 12 12 12 7.5 9.985 7.5 7.5 9.515 3 12 3z" />
  </svg>
)


interface NavItem {
  name: AppView;
  path: string;
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
}

const mainNavItems: NavItem[] = [
  { name: AppView.Dashboard, path: '/dashboard', icon: <HomeIcon /> },
  { name: AppView.Cases, path: '/cases', icon: <UserGroupIcon /> },
  { name: AppView.Tasks, path: '/tasks', icon: <CheckBadgeIcon /> },
  { name: AppView.Schedule, path: '/schedule', icon: <CalendarDaysIcon /> },
  { name: AppView.Assessments, path: '/assessments', icon: <ClipboardDocumentListIcon /> },
];

const supportNavItems: NavItem[] = [
  { name: AppView.AIAssistant, path: '/ai-assistant', icon: <SparklesIcon /> },
  { name: AppView.ClientNotes, path: '/client-notes', icon: <DocumentTextIcon /> },
  { name: AppView.Resources, path: '/resources', icon: <CollectionIcon /> },
];

const Sidebar: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoadingUser(true);
      try {
        const response = await fetch('/data/users.json');
        if (!response.ok) throw new Error('Failed to fetch user data');
        const users: User[] = await response.json();
        if (users.length > 0) {
          setCurrentUser(users[0]); // Use the first user as the current user
        } else {
          console.warn('No users found in users.json');
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        setCurrentUser(null); // Handle error case
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchUser();
  }, []);


  const renderNavLinks = (items: NavItem[]) => items.map((item) => (
    <NavLink
      key={item.name}
      to={item.path}
      className={({ isActive }) => 
        `flex items-center space-x-3 p-2.5 rounded-lg transition-colors duration-150 text-sm font-medium
         ${isActive 
           ? 'bg-theme-sidebar-active-bg text-theme-sidebar-active-text' 
           : 'text-theme-sidebar-text hover:bg-theme-sidebar-hover-bg hover:text-theme-sidebar-hover-text'}`
      }
    >
      {React.cloneElement(item.icon, { 
        className: `sidebar-icon w-5 h-5` 
      })}
      <span>{item.name}</span>
    </NavLink>
  ));

  return (
    <div className="w-60 md:w-64 bg-theme-sidebar-bg h-full shadow-lg flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-theme-border-primary">
        <div className="text-center">
          <h1 className="text-xl font-bold text-theme-sidebar-header-text leading-tight">
            Cerebro Digital
          </h1>
          <p className="text-xs text-theme-sidebar-text opacity-80">
            para trabajadores/as sociales
          </p>
        </div>
      </div>
      
      {isLoadingUser ? (
        <div className="p-4 flex justify-center items-center h-20">
            <LoadingSpinner size="sm" color="text-theme-sidebar-text"/>
        </div>
      ) : currentUser ? (
        <UserProfile user={currentUser} />
      ) : (
        <div className="p-4 text-center text-theme-sidebar-text text-xs">No se pudo cargar el usuario.</div>
      )}


      <nav className="flex-grow p-3 space-y-1 overflow-y-auto">
        {renderNavLinks(mainNavItems)}
        
        <hr className="my-3 border-t border-theme-border-primary opacity-50" /> 
        
        {renderNavLinks(supportNavItems)}
      </nav>
      <div className="p-4 border-t border-theme-border-primary text-center mt-auto">
        <p className="text-xs text-theme-text-secondary">&copy; {new Date().getFullYear()} Cerebro Digital</p>
      </div>
    </div>
  );
};

export default Sidebar;
