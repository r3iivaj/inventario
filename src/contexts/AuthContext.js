import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authorizedUsers, setAuthorizedUsers] = useState([]);

  // Función para obtener usuarios autorizados desde Supabase
  const fetchAuthorizedUsers = async () => {
    try {
      // Verificar si Supabase está configurado
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        setAuthError('Error de configuración: Variables de entorno de Supabase no encontradas. Verifica tu archivo .env');
        setLoading(false);
        return [];
      }

      // Intentar usar fallback primero para evitar problemas con la tabla
      const fallbackEmails = process.env.REACT_APP_ADMIN_EMAILS;
      if (fallbackEmails) {
        const emails = fallbackEmails.split(',').map(email => email.trim().toLowerCase());
        setAuthorizedUsers(emails);
        setLoading(false);
        return emails;
      }

      // Solo intentar la tabla si no hay fallback
      const { data, error } = await supabase
        .from('usuarios_autorizados')
        .select('email, activo')
        .eq('activo', true);

      if (error) {
        setAuthError('Error de configuración: No se puede verificar usuarios autorizados. Configura REACT_APP_ADMIN_EMAILS en tu .env');
        setLoading(false);
        return [];
      }

      const emails = data.map(user => user.email.toLowerCase());
      setAuthorizedUsers(emails);
      setLoading(false);
      return emails;
    } catch (error) {
      // Fallback a emails de variables de entorno
      const fallbackEmails = process.env.REACT_APP_ADMIN_EMAILS;
      if (fallbackEmails) {
        const emails = fallbackEmails.split(',').map(email => email.trim().toLowerCase());
        setAuthorizedUsers(emails);
        setLoading(false);
        return emails;
      }
      
      setAuthError('Error de configuración: No se puede verificar usuarios autorizados. Contacta al administrador.');
      setLoading(false);
      return [];
    }
  };

  // Función para verificar si el usuario está autorizado
  const isUserAuthorized = async (email) => {
    if (!email) return false;
    
    // Si ya tenemos la lista en memoria, usarla
    if (authorizedUsers.length > 0) {
      return authorizedUsers.includes(email.toLowerCase());
    }
    
    // Si no, obtener la lista de Supabase
    const users = await fetchAuthorizedUsers();
    return users.includes(email.toLowerCase());
  };

  // Cargar usuarios autorizados al inicializar
  useEffect(() => {
    fetchAuthorizedUsers().catch((error) => {
      setAuthError('Error de inicialización: No se pudo cargar la configuración de usuarios.');
      setLoading(false);
    });
  }, []);

  // Configurar la sesión para que dure 24 horas (86400 segundos)
  useEffect(() => {
    // Configurar Supabase auth con duración de sesión personalizada
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session && session.user) {
          // Verificar si el usuario está autorizado
          const userEmail = session.user.email;
          
          const authorized = await isUserAuthorized(userEmail);
          
          if (authorized) {
            setUser(session.user);
            setAuthError(null);
          } else {
            // Usuario no autorizado - cerrar sesión inmediatamente
            setAuthError(`Acceso denegado. El email ${userEmail} no está autorizado para usar esta aplicación.`);
            setUser(null);
            
            // Cerrar sesión en Supabase
            await supabase.auth.signOut();
          }
        } else {
          setUser(null);
          setAuthError(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Función para iniciar sesión con Google
  const signInWithGoogle = async () => {
    try {
      setAuthError(null);
      
      // Determinar la URL de redirección correcta
      const redirectUrl = process.env.REACT_APP_SITE_URL || window.location.origin;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      setAuthError(error.message);
      return { data: null, error: error.message };
    }
  };

  // Función para iniciar sesión con email y contraseña (mantener como respaldo)
  const signIn = async (email, password) => {
    try {
      setAuthError(null);
      
      // Verificar si el usuario está autorizado antes de intentar el login
      const authorized = await isUserAuthorized(email);
      if (!authorized) {
        const errorMsg = `Acceso denegado. El email ${email} no está autorizado para usar esta aplicación.`;
        setAuthError(errorMsg);
        return { user: null, error: errorMsg };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Configurar la sesión para que dure 24 horas
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      return { user: data.user, error: null };
    } catch (error) {
      setAuthError(error.message);
      return { user: null, error: error.message };
    }
  };

  // Función para registrarse
  const signUp = async (email, password) => {
    try {
      setAuthError(null);
      
      // Verificar si el usuario está autorizado antes de permitir el registro
      const authorized = await isUserAuthorized(email);
      if (!authorized) {
        const errorMsg = `Registro denegado. El email ${email} no está autorizado para usar esta aplicación.`;
        setAuthError(errorMsg);
        return { user: null, error: errorMsg };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return { user: data.user, error: null };
    } catch (error) {
      setAuthError(error.message);
      return { user: null, error: error.message };
    }
  };

  // Función para cerrar sesión
  const signOut = async () => {
    try {
      setAuthError(null);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  // Función para obtener la sesión actual
  const getCurrentSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Error getting session:', error.message);
      return null;
    }
  };

  // Función para agregar un usuario autorizado a Supabase
  const addAuthorizedUser = async (email, nombre = null) => {
    try {
      const { data, error } = await supabase
        .from('usuarios_autorizados')
        .insert({
          email: email.toLowerCase(),
          nombre: nombre,
          agregado_por: user?.email || 'admin'
        })
        .select();

      if (error) {
        throw error;
      }

      // Actualizar la lista local
      await fetchAuthorizedUsers();
      
      console.log('Usuario agregado exitosamente:', email);
      return { success: true, data };
    } catch (error) {
      console.error('Error agregando usuario:', error);
      return { success: false, error: error.message };
    }
  };

  // Función para obtener la lista de usuarios autorizados
  const getAuthorizedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios_autorizados')
        .select('email, nombre, fecha_agregado, activo, rol')
        .eq('activo', true)
        .order('fecha_agregado', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error obteniendo usuarios autorizados:', error);
      return [];
    }
  };

  // Función para desactivar un usuario
  const deactivateUser = async (email) => {
    try {
      const { error } = await supabase
        .from('usuarios_autorizados')
        .update({ activo: false })
        .eq('email', email.toLowerCase());

      if (error) {
        throw error;
      }

      // Actualizar la lista local
      await fetchAuthorizedUsers();
      
      return { success: true };
    } catch (error) {
      console.error('Error desactivando usuario:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    authError,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    getCurrentSession,
    isUserAuthorized,
    addAuthorizedUser,
    getAuthorizedUsers,
    deactivateUser,
    fetchAuthorizedUsers,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 