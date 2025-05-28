
import React from 'react';
import { NavLink } from 'react-router-dom';
import { User } from '../../types';

interface UserProfileProps {
  user: User;
}

const DefaultAvatar: React.FC<{ name: string }> = ({ name }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <div className="w-10 h-10 rounded-full bg-theme-accent-primary flex items-center justify-center text-theme-text-inverted font-semibold text-lg">
      {initial}
    </div>
  );
};

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  return (
    <NavLink 
      to="/profile" 
      title="Gestionar Perfil"
    >
      {({ isActive }) => (
        <div // This div now receives the dynamic styling based on isActive
          className={
            `block p-4 border-b border-theme-border-primary hover:bg-theme-sidebar-hover-bg hover:text-theme-sidebar-hover-text transition-colors duration-150
             ${isActive 
               ? 'bg-theme-sidebar-active-bg text-theme-sidebar-active-text' 
               : 'text-theme-sidebar-text'
             }`
          }
        >
          <div className="flex items-center space-x-3">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <DefaultAvatar name={user.name} />
            )}
            <div>
              <p className="font-semibold text-sm"> {/* Inherits color from parent div */}
                {user.name}
              </p>
              <p className={`text-xs ${isActive ? 'opacity-80' : 'text-theme-text-secondary'}`}> {/* Role has specific inactive color */}
                {user.role}
              </p>
            </div>
          </div>
        </div>
      )}
    </NavLink>
  );
};

export default UserProfile;
