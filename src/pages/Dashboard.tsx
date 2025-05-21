import React, { useState, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';

import { parseExcel, Ticket, calcSlaStats } from '../utils/data';
import { useFilters } from '../contexts/FiltersContext';

import KpiCard from '../components/KpiCard';
import ChartDistribPorCliente from '../components/ChartDistribPorCliente';
import ChartHorasValoresPorCliente from '../components/ChartHorasValoresPorCliente';
import ChartSlaByAnalyst from '../components/ChartSlaByAnalyst';

import 'react-datepicker/dist/react-datepicker.css';
import './Dashboard.css';

const tabOptions = [
  { value: 'overview', label: 'Visão Geral' },
  { value: 'porCliente', label: 'Por Cliente' },
  { value: 'porAnalista', label: 'Por Analista' }
];

export default function Dashboard() {
  const [data, setData] = useState<Ticket[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const { filters, dispatch } = useFilters();

  // Carrega e parseia a planilha
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const parsed = await parseExcel(e.target.files[0]);
    setData(parsed);
  };

  // Opções para os selects a partir dos dados carregados
  const projetoOptions = useMemo(() => {
    return Array.from(new Set(data.map(d => d.projeto)))
      .map(p => ({ value: p, label: p }));
  }, [data]);

  const unidadeOptions = useMemo(() => {
    return Array.from(new Set(data.map(d => d.unidade)))
      .map(u => ({ value: u, label: u }));
  }, [data]);

  const analistaOptions = useMemo(() => {
    return Array.from(new Set(data.map(d => d.responsavel)))
      .map(a => ({ value: a, label: a }));
  }, [data]);

  // Aplica filtros
  const filtered = useMemo(() => {
    return data
      .filter(t => !filters.dateFrom || t.criado >= filters.dateFrom)
      .filter(t => !filters.dateTo   || t.criado <= filters.dateTo)
      .filter(t => !filters.projetos.length || filters.projetos.includes(t.projeto))
      .filter(t => !filters.unidades.length || filters.unidades.includes(t.unidade))
      .filter(t => !filters.analistas.length || filters.analistas.includes(t.responsavel));
  }, [data, filters]);

  // Calcula métricas de SLA
  const slaStats = calcSlaStats(filtered);

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <input type="file" accept=".xlsx" onChange={handleFile} />
        <div className="dashboard__filters">
          <DatePicker
            placeholderText="Data de..."
            selected={filters.dateFrom}
            onChange={d => dispatch({ type: 'SET_DATE_FROM', payload: d || undefined })}
          />
          <DatePicker
            placeholderText="até..."
            selected={filters.dateTo}
            onChange={d => dispatch({ type: 'SET_DATE_TO', payload: d || undefined })}
          />
          <Select
            placeholder="Projetos"
            isMulti
            options={projetoOptions}
            onChange={opts => dispatch({ type: 'SET_PROJETOS', payload: opts.map(o => o.value) })}
          />
          <Select
            placeholder="Unidades"
            isMulti
            options={unidadeOptions}
            onChange={opts => dispatch({ type: 'SET_UNIDADES', payload: opts.map(o => o.value) })}
          />
          <Select
            placeholder="Analistas"
            isMulti
            options={analistaOptions}
            onChange={opts => dispatch({ type: 'SET_ANALISTAS', payload: opts.map(o => o.value) })}
          />
        </div>
      </header>

      <section className="dashboard__kpis">
        <KpiCard title="Total Tickets" value={filtered.length} />
        <KpiCard title="SLA Atingido" value={slaStats.atingidos} />
        <KpiCard title="SLA Violado" value={slaStats.violados} />
        <KpiCard title="% Atingimento" value={slaStats.pctAtingimento.toFixed(1) + '%'} />
      </section>

      <nav className="dashboard__tabs">
        {tabOptions.map(tab => (
          <button
            key={tab.value}
            className={activeTab === tab.value ? 'active' : ''}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="dashboard__content">
        {activeTab === 'overview' && (
          <div className="dashboard__charts">
            <ChartDistribPorCliente data={filtered} />
            <ChartHorasValoresPorCliente data={filtered} />
          </div>
        )}
        {activeTab === 'porCliente' && (
          <ChartDistribPorCliente data={filtered} />
        )}
        {activeTab === 'porAnalista' && (
          <ChartSlaByAnalyst tickets={filtered} />
        )}
      </section>
    </div>
  );
}
