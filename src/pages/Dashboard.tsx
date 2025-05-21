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
  const filtered = use
