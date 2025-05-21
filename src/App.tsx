import React from 'react';
import { FiltersProvider } from './contexts/FiltersContext';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <FiltersProvider>
      <Dashboard />
    </FiltersProvider>
  );
}
