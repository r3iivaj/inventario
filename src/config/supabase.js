import { createClient } from '@supabase/supabase-js'

// Reemplaza con tu URL y clave anónima de Supabase
export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  )