// src/pages/Dashboard.tsx
import React, { useState, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import Select, { MultiValue } from 'react-select';

import { parseExcel, Ticket, calcSlaStats } from '../utils/data';
import { useFilters } from '../contexts/FiltersContext';

import KpiCard from '../components/KpiCard';
import ChartDistribPorCliente from '../components/ChartDistribPorCliente';
import ChartHorasValoresPorCliente from '../components/ChartHorasValoresPorCliente';
import ChartSlaByAnalyst from '../components/ChartSlaByAnalyst';

import 'react-datepicker/dist/react-datepicker.css';
import './Dashboard.css';

type Option = { value: string; label: string; };

const tabOptions = [
  { value: 'overview',    label: 'Visão Geral' },
  { value: 'porCliente',  label: 'Por Cliente' },
  { value: 'porAnalista', label: 'Por Analista' }
];

export default function Dashboard() {
  const [data, setData] = useState<Ticket[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const { filters, dispatch } = useFilters();

  // 1) upload da planilha
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const parsed = await parseExcel(e.target.files[0]);
    setData(parsed);
  };

  // 2) opções de filtro
  const projetoOptions = useMemo<Option[]>(() => {
    return Array.from(new Set(data.map(d => d.cliente)))
      .map(c => ({ value: c, label: c }));
  }, [data]);

  const unidadeOptions = useMemo<Option[]>(() => {
    return Array.from(new Set(data.map(d => d.tribo)))
      .map(t => ({ value: t, label: t }));
  }, [data]);

  const analistaOptions = useMemo<Option[]>(() => {
    return Array.from(new Set(data.map(d => d.responsavel || '')))
      .map(a => ({ value: a, label: a }));
  }, [data]);

  // 3) aplicação dos filtros (agora com 'vencimentos' e 'responsavel')
  const filtered = useMemo(() => {
    return data
      .filter(t => !filters.dateFrom || (t.vencimentos ?? new Date()) >= filters.dateFrom!)
      .filter(t => !filters.dateTo   || (t.vencimentos ?? new Date()) <= filters.dateTo!)
      .filter(t => !filters.projetos.length || filters.projetos.includes(t.cliente))
      .filter(t => !filters.unidades.length || filters.unidades.includes(t.tribo))
      .filter(t => !filters.analistas.length || filters.analistas.includes(t.responsavel || ''));
  }, [data, filters]);

  // 4) métricas de SLA
  const slaStats = calcSlaStats(filtered);

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <input type="file" accept=".xlsx" onChange={handleFile} />
        <div className="dashboard__filters">
          <DatePicker
            placeholderText="Vencimentos de..."
            selected={filters.dateFrom}
            onChange={d => dispatch({ type: 'SET_DATE_FROM', payload: d || undefined })}
            isClearable
          />
          <DatePicker
            placeholderText="até..."
            selected={filters.dateTo}
            onChange={d => dispatch({ type: 'SET_DATE_TO', payload: d || undefined })}
            isClearable
          />
          <Select<Option, true>
            placeholder="Projetos (Cliente)"
            isMulti
            isClearable
            options={projetoOptions}
            value={projetoOptions.filter(o => filters.projetos.includes(o.value))}
            onChange={(opts: MultiValue<Option>) =>
              dispatch({ type: 'SET_PROJETOS', payload: opts.map(o => o.value) })
            }
          />
          <Select<Option, true>
            placeholder="Unidades (Tribo)"
            isMulti
            isClearable
            options={unidadeOptions}
            value={unidadeOptions.filter(o => filters.unidades.includes(o.value))}
            onChange={(opts: MultiValue<Option>) =>
              dispatch({ type: 'SET_UNIDADES', payload: opts.map(o => o.value) })
            }
          />
          <Select<Option, true>
            placeholder="Analistas (Responsável)"
            isMulti
            isClearable
            options={analistaOptions}
            value={analistaOptions.filter(o => filters.analistas.includes(o.value))}
            onChange={(opts: MultiValue<Option>) =>
              dispatch({ type: 'SET_ANALISTAS', payload: opts.map(o => o.value) })
            }
          />
        </div>
      </header>

      <section className="dashboard__kpis">
        <KpiCard title="Total Tickets"  value={filtered.length} />
        <KpiCard title="SLA Atingido"   value={slaStats.atingidos} />
        <KpiCard title="SLA Violado"    value={slaStats.violados} />
        <KpiCard title="% Atingimento"  value={slaStats.pctAtingimento.toFixed(1) + '%'} />
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
          <ChartSlaByAnalyst data={filtered} />
        )}
      </section>
    </div>
  );
}
