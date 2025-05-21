import React, { useState, useEffect } from 'react';
import { SLAData, Stats } from '../types';
import { getLatestVersion } from '../utils/storage';
import UploadForm from './UploadForm';
import ClienteChart from './charts/ClienteChart';
import ValorHorasChart from './charts/ValorHorasChart';
import DataTable from './DataTable';

export default function Dashboard() {
  const [data, setData] = useState<SLAData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar dados mais recentes ao iniciar
  useEffect(() => {
    async function loadLatestData() {
      try {
        const latest = await getLatestVersion();
        if (latest) {
          setData(latest.data);
          setStats(latest.stats);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadLatestData();
  }, []);

  // Handler para quando novos dados são carregados
  const handleDataLoaded = (newData: SLAData[], newStats: Stats) => {
    setData(newData);
    setStats(newStats);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard SLA</h1>
      </header>
      
      <main className="dashboard-content">
        <section className="upload-section">
          <UploadForm onDataLoaded={handleDataLoaded} />
        </section>
        
        {loading ? (
          <div className="loading-indicator">Carregando dados...</div>
        ) : data.length > 0 && stats ? (
          <>
            <section className="metrics-section">
              <div className="metric-card total-projects">
                <h3>Total de Projetos</h3>
                <p className="metric-value">{data.length}</p>
              </div>
              
              <div className="metric-card total-hours">
                <h3>Total de Horas</h3>
                <p className="metric-value">{stats.horasTotal.toFixed(0)}</p>
              </div>
              
              <div className="metric-card total-value">
                <h3>Valor Total (R$)</h3>
                <p className="metric-value">
                  {stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </section>
            
            <section className="charts-section">
              <ClienteChart clienteStats={stats.clienteStats} />
              <ValorHorasChart data={data} />
            </section>
            
            <section className="table-section">
              <DataTable data={data} />
            </section>
          </>
        ) : (
          <div className="no-data-message">
            Nenhum dado disponível. Faça upload de uma planilha SLA para começar.
          </div>
        )}
      </main>
      
      <footer className="dashboard-footer">
        <p>Dashboard SLA © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
