import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signInWithGoogle, authError } = useAuth();

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);

    try {
      await signInWithGoogle();
      // Si hay error, authError se manejará automáticamente desde el contexto
    } catch (err) {
      console.error('Error al conectar con Google:', err);
      // Los errores se manejan automáticamente desde el contexto de autenticación
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Solo usamos authError ya que no tenemos formulario tradicional

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Logo */}
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            INVENTARIO ZRUNK3D
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Inicia sesión para acceder a tu inventario
          </p>
        </div>

        <div className="space-y-6">
          {/* Google Sign In Button */}
          <div>
            <button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGoogleLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {isGoogleLoading ? 'Conectando con Google...' : 'Continuar con Google'}
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                o
              </span>
            </div>
          </div>
        </div>

        {/* Error message */}
        {authError && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                  {authError}
                </p>
                {authError.includes('no está autorizado') && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Contacta al administrador para obtener acceso a la aplicación.
                  </p>
                )}
                {authError.includes('Error de configuración') && (
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                    <p className="font-medium">Para resolver este problema:</p>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      <li>Crea un archivo .env en la raíz del proyecto</li>
                      <li>Añade las variables REACT_APP_SUPABASE_URL y REACT_APP_SUPABASE_ANON_KEY</li>
                      <li>Configura REACT_APP_ADMIN_EMAILS con tu email</li>
                      <li>Reinicia el servidor con npm start</li>
                    </ol>
                  </div>
                )}
                {authError.includes('Timeout') && (
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                    <p className="font-medium">Posibles causas:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Sin conexión a internet</li>
                      <li>Credenciales de Supabase incorrectas</li>
                      <li>Servidor de Supabase no disponible</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Solo usuarios autorizados pueden acceder a esta aplicación
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 