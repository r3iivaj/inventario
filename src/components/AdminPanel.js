import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AdminPanel = ({ onClose }) => {
  const { getAuthorizedUsers, addAuthorizedUser, deactivateUser, user } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [authorizedUsers, setAuthorizedUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingUser, setAddingUser] = useState(false);

  // Cargar usuarios al abrir el panel
  useEffect(() => {
    loadUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUsers = async () => {
    setLoading(true);
    try {
      const users = await getAuthorizedUsers();
      setAuthorizedUsers(users);
    } catch (error) {
      setMessage('Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      setMessage('Por favor ingresa un email válido');
      return;
    }

    const email = newEmail.trim().toLowerCase();
    const name = newName.trim();

    // Verificar si ya existe
    if (authorizedUsers.some(u => u.email === email)) {
      setMessage('Este email ya está autorizado');
      return;
    }

    setAddingUser(true);
    try {
      const result = await addAuthorizedUser(email, name || null);
      
      if (result.success) {
        setNewEmail('');
        setNewName('');
        setMessage(`Usuario ${email} agregado exitosamente`);
        await loadUsers(); // Recargar la lista
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage('Error al agregar usuario');
    } finally {
      setAddingUser(false);
    }
  };

  const handleDeactivateUser = async (email) => {
    if (email === user?.email) {
      setMessage('No puedes desactivar tu propia cuenta');
      return;
    }

    if (window.confirm(`¿Estás seguro de que quieres desactivar a ${email}?`)) {
      try {
        const result = await deactivateUser(email);
        
        if (result.success) {
          setMessage(`Usuario ${email} desactivado`);
          await loadUsers(); // Recargar la lista
          setTimeout(() => setMessage(''), 3000);
        } else {
          setMessage(`Error: ${result.error}`);
        }
      } catch (error) {
        setMessage('Error al desactivar usuario');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Panel de Administración
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Current User Info */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Usuario actual:</strong> {user?.email}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Datos almacenados en Supabase
            </p>
          </div>

          {/* Add New User Form */}
          <form onSubmit={handleAddUser} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Agregar nuevo usuario autorizado
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email (requerido)
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@ejemplo.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-100"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre (opcional)
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nombre del usuario"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-100"
                />
              </div>
              
              <button
                type="submit"
                disabled={addingUser}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {addingUser ? 'Agregando...' : 'Agregar Usuario'}
              </button>
            </div>
          </form>

          {/* Message */}
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.includes('exitosamente') || message.includes('desactivado')
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            }`}>
              {message}
            </div>
          )}

          {/* Authorized Users List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Usuarios autorizados
              </h3>
              <button
                onClick={loadUsers}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                🔄 Actualizar
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {authorizedUsers.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No hay usuarios autorizados
                  </p>
                ) : (
                  authorizedUsers.map((userItem, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {userItem.email}
                          </span>
                          {userItem.email === user?.email && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                              Tú
                            </span>
                          )}
                          {userItem.rol === 'admin' && (
                            <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                              Admin
                            </span>
                          )}
                        </div>
                        {userItem.nombre && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {userItem.nombre}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Agregado: {formatDate(userItem.fecha_agregado)}
                        </p>
                      </div>
                      
                      {userItem.email !== user?.email && (
                        <button
                          onClick={() => handleDeactivateUser(userItem.email)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
                        >
                          Desactivar
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                Configuración segura
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Los usuarios se almacenan de forma segura en Supabase con Row Level Security habilitado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 