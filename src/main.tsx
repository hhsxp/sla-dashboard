// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';

// registrar todos os componentes do Chart.js antes de qualquer uso de gráfico
import './chartjs';

import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
