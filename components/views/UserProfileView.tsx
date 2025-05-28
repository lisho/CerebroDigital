
import React, { useState, useEffect } from 'react';
import { User } from '../../types'; 
import ThemeSwitcher from '../common/ThemeSwitcher'; 
import { useTheme } from '../../contexts/ThemeContext'; 
import LoadingSpinner from '../LoadingSpinner'; // For loading state

const UserCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);


const UserProfileView: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState(''); // Mock email, can be part of user.json
  const { theme } = useTheme(); 

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/data/users.json');
        if (!response.ok) throw new Error('Failed to fetch user data');
        const users: User[] = await response.json();
        // Assuming the first user in the array is the one for this profile view
        // Or, you might have a specific ID to look for if multiple users are possible
        if (users.length > 0) {
          const currentUser = users.find(u => u.id === "emilycarter") || users[0]; // Example: find by ID or take first
          setUser(currentUser);
          setNameInput(currentUser.name);
          setEmailInput(`${currentUser.name.toLowerCase().replace(' ', '.')}@socialcare.dev`); // Generate mock email
        } else {
          console.warn('No user data found in users.json');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Handle error: set user to null or show an error message
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserProfile();
  }, []);


  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const updatedUser = { ...user, name: nameInput };
      // In a real app, send updatedUser to a backend.
      // For this mock, update localStorage if users are stored there, or just update state.
      // Let's assume users.json is the "source of truth" for initial load,
      // and changes here are local state or would go to a backend.
      setUser(updatedUser); 
      
      // If we were to update users.json (not possible directly from client-side)
      // or a localStorage cache of it:
      // const allUsers = JSON.parse(localStorage.getItem('all_users_cache_key') || '[]');
      // const userIndex = allUsers.findIndex(u => u.id === user.id);
      // if (userIndex > -1) allUsers[userIndex] = updatedUser;
      // localStorage.setItem('all_users_cache_key', JSON.stringify(allUsers));

      alert('Cambios guardados (simulación).');
    }
  };

  const handlePasswordChange = () => {
    alert('La funcionalidad de cambio de contraseña aún no está implementada.');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" color="text-theme-accent-primary" />
      </div>
    );
  }

  if (!user) {
    return <div className="text-center text-theme-text-secondary p-8">No se pudo cargar el perfil del usuario.</div>;
  }


  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-semibold text-theme-text-primary">Tu Perfil</h2>

      <form onSubmit={handleSaveChanges} className="bg-theme-bg-card p-6 sm:p-8 rounded-xl shadow-lg space-y-6">
        <div className="flex flex-col items-center sm:flex-row sm:items-start sm:space-x-6">
          {user.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.name} 
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover mb-4 sm:mb-0 border-4 border-theme-bg-tertiary" 
            />
          ) : (
            <UserCircleIcon className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full text-theme-accent-primary bg-theme-bg-tertiary p-2 mb-4 sm:mb-0`} />
          )}
          <div className="flex-grow text-center sm:text-left">
            <h3 className="text-2xl font-semibold text-theme-text-primary">{user.name}</h3>
            <p className="text-md text-theme-text-secondary">{user.role}</p>
            <p className="text-sm text-theme-text-secondary mt-1">{emailInput}</p>
          </div>
        </div>
        
        <hr className="border-theme-border-primary" />

        <div>
          <label htmlFor="profileName" className="block text-sm font-medium text-theme-text-secondary mb-1">
            Nombre Completo
          </label>
          <input
            type="text"
            id="profileName"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="w-full p-2.5 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary focus:ring-2 focus:ring-theme-accent-primary focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="profileEmail" className="block text-sm font-medium text-theme-text-secondary mb-1">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="profileEmail"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="w-full p-2.5 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary focus:ring-2 focus:ring-theme-accent-primary focus:border-transparent"
          />
        </div>

        <div className="pt-2">
          <ThemeSwitcher />
        </div>

        <hr className="border-theme-border-primary" />

        <div className="space-y-3 sm:space-y-0 sm:flex sm:justify-between sm:items-center">
          <button 
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-theme-button-primary-bg text-theme-button-primary-text rounded-lg font-medium transition-colors shadow-sm hover:bg-theme-button-primary-hover-bg"
          >
            Guardar Cambios
          </button>
          <button 
            type="button"
            onClick={handlePasswordChange}
            className="w-full sm:w-auto mt-3 sm:mt-0 px-6 py-2.5 bg-theme-button-secondary-bg text-theme-button-secondary-text rounded-lg font-medium transition-colors shadow-sm hover:bg-theme-button-secondary-hover-bg"
          >
            Cambiar Contraseña
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfileView;
