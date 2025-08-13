import React from 'react';
import InventarioApp from './components/InventarioApp';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App">
          {/* AUTENTICACIÓN DESACTIVADA - Acceso libre a la aplicación */}
          <InventarioApp />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
