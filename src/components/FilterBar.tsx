import React, { useState, useEffect } from 'react';

interface FilterBarProps {
  data: any[];
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  cliente: string;
  tribo: string;
  servico: string;
  periodoTipo: 'mes' | 'trimestre' | 'ano';
  periodoValor: string;
}

export default function FilterBar({ data, onFilterChange }: FilterBarProps) {
  // Extrair valores únicos para os filtros
  const clientes = [...new Set(data.map(item => item.Cliente).filter(Boolean))];
  const tribos = [...new Set(data.map(item => item.Tribo).filter(Boolean))].map(String);
  const servicos = [...new Set(data.map(item => item.Serviço).filter(Boolean))];
  
  // Estado dos filtros
  const [filters, setFilters] = useState<FilterState>({
    cliente: '',
    tribo: '',
    servico: '',
    periodoTipo: 'mes',
    periodoValor: ''
  });

  // Gerar opções para o período
  const getPeriodoOptions = () => {
    const currentDate = new Date();
    const options = [];
    
    if (filters.periodoTipo === 'mes') {
      // Últimos 12 meses
      for (let i = 0; i < 12; i++) {
        const date = new Date(currentDate);
        date.setMonth(currentDate.getMonth() - i);
        const value = `${date.getMonth() + 1}/${date.getFullYear()}`;
        const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        options.push({ value, label });
      }
    } else if (filters.periodoTipo === 'trimestre') {
      // Últimos 8 trimestres
      for (let i = 0; i < 8; i++) {
        const date = new Date(currentDate);
        date.setMonth(currentDate.getMonth() - (i * 3));
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        const value = `${quarter}/${date.getFullYear()}`;
        const label = `${quarter}º Trimestre ${date.getFullYear()}`;
        options.push({ value, label });
      }
    } else if (filters.periodoTipo === 'ano') {
      // Últimos 5 anos
      for (let i = 0; i < 5; i++) {
        const year = currentDate.getFullYear() - i;
        const value = year.toString();
        options.push({ value, label: value });
      }
    }
    
    return options;
  };

  // Atualizar filtros e notificar componente pai
  const handleFilterChange = (field: keyof FilterState, value: string) => {
    // Se mudar o tipo de período, resetar o valor do período
    if (field === 'periodoTipo') {
      setFilters(prev => ({
        ...prev,
        [field]: value,
        periodoValor: ''
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Notificar quando os filtros mudarem
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  return (
    <div style={{
      backgroundColor: '#222',
      padding: '1.5rem',
      borderRadius: '8px',
      marginBottom: '2rem'
    }}>
      <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Filtros</h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        {/* Filtro de Cliente */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Cliente</label>
          <select
            value={filters.cliente}
            onChange={(e) => handleFilterChange('cliente', e.target.value)}
            style={selectStyle}
          >
            <option value="">Todos</option>
            {clientes.map((cliente) => (
              <option key={cliente} value={cliente}>{cliente}</option>
            ))}
          </select>
        </div>
        
        {/* Filtro de Tribo */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Unidade de Negócio</label>
          <select
            value={filters.tribo}
            onChange={(e) => handleFilterChange('tribo', e.target.value)}
            style={selectStyle}
          >
            <option value="">Todas</option>
            {tribos.map((tribo) => (
              <option key={tribo} value={tribo}>{tribo}</option>
            ))}
          </select>
        </div>
        
        {/* Filtro de Serviço */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Projeto</label>
          <select
            value={filters.servico}
            onChange={(e) => handleFilterChange('servico', e.target.value)}
            style={selectStyle}
          >
            <option value="">Todos</option>
            {servicos.map((servico) => (
              <option key={servico} value={servico}>{servico}</option>
            ))}
          </select>
        </div>
        
        {/* Filtro de Período - Tipo */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tipo de Período</label>
          <select
            value={filters.periodoTipo}
            onChange={(e) => handleFilterChange('periodoTipo', e.target.value as any)}
            style={selectStyle}
          >
            <option value="mes">Mês</option>
            <option value="trimestre">Trimestre</option>
            <option value="ano">Ano</option>
          </select>
        </div>
        
        {/* Filtro de Período - Valor */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Período</label>
          <select
            value={filters.periodoValor}
            onChange={(e) => handleFilterChange('periodoValor', e.target.value)}
            style={selectStyle}
          >
            <option value="">Todos</option>
            {getPeriodoOptions().map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Botão para limpar filtros */}
      <div style={{ marginTop: '1rem', textAlign: 'right' }}>
        <button
          onClick={() => setFilters({
            cliente: '',
            tribo: '',
            servico: '',
            periodoTipo: 'mes',
            periodoValor: ''
          })}
          style={{
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Limpar Filtros
        </button>
      </div>
    </div>
  );
}

// Estilos
const selectStyle = {
  backgroundColor: '#333',
  color: 'white',
  padding: '0.5rem',
  borderRadius: '4px',
  border: '1px solid #444',
  width: '100%'
};
