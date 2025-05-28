import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ShieldCheckIcon from '../icons/ShieldCheckIcon';
import ArrowUturnLeftIcon from '../icons/ArrowUturnLeftIcon';

const FloatingAdminButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminView = location.pathname.startsWith('/admin');

  const handleClick = () => {
    if (isAdminView) {
      navigate('/dashboard'); // Navigate to user dashboard
    } else {
      navigate('/admin'); // Navigate to admin panel (dashboard by default)
    }
  };

  const title = isAdminView ? "Volver a Vista de Usuario" : "Acceder al Panel de Administración";
  const Icon = isAdminView ? ArrowUturnLeftIcon : ShieldCheckIcon;

  return (
    <button
      onClick={handleClick}
      title={title}
      aria-label={title}
      className="fixed top-5 right-5 z-[1001] p-3 bg-theme-button-primary-bg text-theme-button-primary-text rounded-full shadow-xl hover:bg-theme-button-primary-hover-bg focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:ring-opacity-75 transition-all duration-150 ease-in-out transform hover:scale-105"
    >
      <Icon className="w-6 h-6" />
    </button>
  );
};

export default FloatingAdminButton;