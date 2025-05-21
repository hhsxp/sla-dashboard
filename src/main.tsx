// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';

// importa DEPOIS do React e ANTES de qualquer gráfico,
// para garantir que Chart.js já esteja configurado
import './chartjs';

import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
