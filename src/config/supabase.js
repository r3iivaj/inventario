import { createClient } from '@supabase/supabase-js'

// Reemplaza con tu URL y clave anónima de Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Configuración para la duración de sesión (24 horas = 86400 segundos)
const supabaseOptions = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Configurar la duración de la sesión a 24 horas
    // Nota: La duración real del token se controla desde el dashboard de Supabase
    // Esta configuración asegura que el cliente mantenga la sesión activa
    refreshTokenTimeout: 86400000, // 24 horas en milisegundos
  },
  global: {
    headers: {
      'x-client-info': 'inventario-app@1.0.0',
    },
  },
};

// Validar que las variables estén configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables de entorno de Supabase no configuradas correctamente');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions)
 