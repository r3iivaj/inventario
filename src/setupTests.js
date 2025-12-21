// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Variables de entorno mínimas para evitar validaciones en config
process.env.REACT_APP_SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'http://localhost:54321'
process.env.REACT_APP_SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'test-anon-key'

// Mock global de Supabase para pruebas offline
jest.mock('@supabase/supabase-js', () => {
  const makeQuery = () => {
    const qb = {
      // Builders en cadena
      select: () => qb,
      eq: () => qb,
      ilike: () => qb,
      limit: () => qb,
      order: () => qb,
      // Operaciones terminales que suelen usarse
      single: () => Promise.resolve({ data: null, error: null }),
      // Soporte de await sobre el builder
      then: (resolve) => resolve({ data: [], error: null }),
      catch: () => qb,
    }
    return qb
  }

  const client = {
    from: () => makeQuery(),
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithOAuth: async () => ({ data: null, error: null }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
      setSession: async () => ({}),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null } }),
    },
  }

  return { createClient: () => client }
})
