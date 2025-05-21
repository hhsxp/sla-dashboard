// src/pages/Dashboard.tsx
import React, { useState } from 'react';
import { parseExcel, Ticket } from '../utils/data';
import ChartDistribPorCliente from '../components/ChartDistribPorCliente';
import ChartHorasValoresPorCliente from '../components/ChartHorasValoresPorCliente';
import './Dashboard.css'; // coloque aqui o grid/flex das charts

export default function Dashboard() {
  const [data, setData] = useState<Ticket[]>([]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const parsed = await parseExcel(e.target.files[0]);
    setData(parsed);
  };

  return (
    <div className="dashboard">
      <header>
        <input type="file" accept=".xlsx" onChange={handleFile} />
      </header>

      {/* seus KPI cards aqui, usando data.length, soma de apontamentos, etc */}

      <section className="charts">
        <ChartDistribPorCliente data={data} />
        <ChartHorasValoresPorCliente data={data} />
      </section>
    </div>
  );
}
