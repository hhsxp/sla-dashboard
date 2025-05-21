import React, { useState } from 'react';
import { parseExcel, calcSlaStats } from '../utils/data';
import { useFilters } from '../contexts/FiltersContext';
import KpiCard from '../components/KpiCard';
import ChartTicketsByType from '../components/ChartTicketsByType';
import ChartSlaByAnalyst from '../components/ChartSlaByAnalyst';
import { Ticket } from '../types';

const Dashboard: React.FC = () => {
  const { filters } = useFilters();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setTickets(await parseExcel(e.target.files[0]));
  };
  const filtered = tickets
    .filter(t => !filters.dateFrom || t.criado >= filters.dateFrom!)
    .filter(t => !filters.dateTo   || t.criado <= filters.dateTo!)
    .filter(t => !filters.projetos.length || filters.projetos.includes(t.projeto));
  const sla = calcSlaStats(filtered);
  return (
    <div className="dashboard">
      <header><input type="file" accept=".xlsx" onChange={handleUpload} /></header>
      <section className="kpis">
        <KpiCard title="Total Tickets" value={sla.total} />
        <KpiCard title="SLA Atingido" value={sla.atingidos} />
        <KpiCard title="SLA Violado" value={sla.violados} />
        <KpiCard title="% Atingimento" value={sla.pctAtingimento.toFixed(1) + '%'} />
      </section>
      <section className="charts">
        <ChartTicketsByType tickets={filtered} />
        <ChartSlaByAnalyst tickets={filtered} />
      </section>
    </div>
  );
};
export default Dashboard;
