
import React from 'react';
import { 
  MOCK_CLIENT_NOTES_KEY, 
  MOCK_RESOURCES_KEY, 
  MOCK_CASES_KEY, 
  MOCK_TASKS_KEY, 
  MOCK_SCHEDULE_EVENTS_KEY 
} from '../../../constants';

const APP_THEME_KEY = 'appTheme'; // Key for storing theme preference

const AdminAppSettingsView: React.FC = () => {

  const handleResetMockData = () => {
    if (window.confirm('¿Estás seguro de que quieres resetear TODOS los datos ficticios? Esta acción no se puede deshacer.')) {
      localStorage.removeItem(MOCK_CLIENT_NOTES_KEY);
      localStorage.removeItem(MOCK_RESOURCES_KEY);
      localStorage.removeItem(MOCK_CASES_KEY);
      localStorage.removeItem(MOCK_TASKS_KEY);
      localStorage.removeItem(MOCK_SCHEDULE_EVENTS_KEY);
      alert('Datos ficticios reseteados. Refresca la aplicación para ver los cambios.');
    }
  };

  const handleClearThemePreferences = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar las preferencias de tema de todos los usuarios? Volverán al tema por defecto.')) {
      localStorage.removeItem(APP_THEME_KEY);
      alert('Preferencias de tema limpiadas. Los usuarios verán el tema por defecto la próxima vez que carguen la app.');
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-semibold text-gray-800">Configuración de la Aplicación</h2>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Gestión de Datos</h3>
        <p className="text-sm text-gray-600 mb-4">
          Estas acciones afectarán los datos almacenados en el navegador para la demostración.
        </p>
        <button
          onClick={handleResetMockData}
          className="px-5 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium text-sm shadow-sm"
        >
          Resetear Todos los Datos Ficticios
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Preferencias de Usuario</h3>
        <p className="text-sm text-gray-600 mb-4">
          Permite resetear configuraciones visuales guardadas por los usuarios.
        </p>
        <button
          onClick={handleClearThemePreferences}
          className="px-5 py-2.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors font-medium text-sm shadow-sm"
        >
          Limpiar Preferencias de Tema de Usuario
        </button>
      </div>
      
      {/* Placeholder for more settings */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Otras Configuraciones (Placeholder)</h3>
        <p className="text-gray-600">Aquí se podrían añadir más opciones de configuración global de la aplicación.</p>
      </div>
    </div>
  );
};

export default AdminAppSettingsView;
