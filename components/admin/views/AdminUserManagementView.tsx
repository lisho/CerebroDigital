
import React, { useState, useEffect } from 'react';
import { AdminUser } from '../../../types';

const mockAdminUsers: AdminUser[] = [
  { id: 'user1', name: 'Emily Carter', email: 'emily.carter@sw.dev', role: 'Trabajador Social', lastLogin: '2024-07-28 10:00 AM' },
  { id: 'user2', name: 'Admin Eulogio', email: 'admin@eulogio.ai', role: 'Administrador', lastLogin: '2024-07-29 09:15 AM' },
  { id: 'user3', name: 'John Davis', email: 'john.davis@sw.dev', role: 'Trabajador Social', lastLogin: '2024-07-27 15:30 PM' },
];

const AdminUserManagementView: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>(mockAdminUsers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-gray-800">Gestión de Usuarios</h2>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="Buscar usuarios por nombre, email o rol..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Acceso</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 text-sm text-gray-700 font-medium">{user.name}</td>
                <td className="py-4 px-4 text-sm text-gray-600">{user.email}</td>
                <td className="py-4 px-4 text-sm">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${user.role === 'Administrador' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">{user.lastLogin}</td>
                <td className="py-4 px-4 text-sm text-gray-500">
                  <button className="text-blue-600 hover:text-blue-800 font-medium mr-2 text-xs">Editar</button>
                  <button className="text-red-600 hover:text-red-800 font-medium text-xs">Eliminar</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="py-6 px-4 text-center text-gray-500">No se encontraron usuarios.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
        Añadir Nuevo Usuario (Simulado)
      </button>
    </div>
  );
};

export default AdminUserManagementView;
