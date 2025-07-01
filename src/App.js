import React from 'react';
import InventarioApp from './components/InventarioApp';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <InventarioApp />
      </div>
    </ThemeProvider>
  );
}

export default App;
