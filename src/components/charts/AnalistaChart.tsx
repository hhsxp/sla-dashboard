import React from 'react';
import { Bar } from 'react-chartjs-2';

interface AnalistaChartProps {
  analistaStats: {
    atendimentos_por_analista: Record<string, number>;
    sla_por_analista: Record<string, { atingido: number; violado: number }>;
  };
  hasEnrichedData: boolean;
}

export default function AnalistaChart({ analistaStats, hasEnrichedData }: AnalistaChartProps) {
  const analistas = Object.keys(analistaStats.atendimentos_por_analista);
  
  // Preparar dados para o gráfico de SLA por analista
  const slaAtingido = analistas.map(analista => 
    analistaStats.sla_por_analista[analista]?.atingido || 0
  );
  
  const slaViolado = analistas.map(analista => 
    analistaStats.sla_por_analista[analista]?.violado || 0
  );
  
  const chartData = {
    labels: analistas,
    datasets: [
      {
        label: 'SLA Atingido',
        data: slaAtingido,
        backgroundColor: 'rgba(40, 167, 69, 0.8)',
        borderColor: 'rgba(40, 167, 69, 1)',
        borderWidth: 1,
      },
      {
        label: 'SLA Violado',
        data: slaViolado,
        backgroundColor: 'rgba(220, 53, 69, 0.8)',
        borderColor: 'rgba(220, 53, 69, 1)',
        borderWidth: 1,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
        ticks: {
          color: '#fff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        stacked: true,
        ticks: {
          color: '#fff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#fff',
          font: {
            family: 'Poppins, Arial, sans-serif',
          }
        }
      },
      tooltip: {
        callbacks: {
          afterTitle: function(context: any) {
            const analista = context[0].label;
            const total = analistaStats.atendimentos_por_analista[analista] || 0;
            return `Total de atendimentos: ${total}`;
          }
        }
      }
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#222', 
      padding: '1.5rem', 
      borderRadius: '8px',
      height: '100%'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>SLA por Analista</h3>
      <div style={{ height: '250px' }}>
        <Bar data={chartData} options={options} />
      </div>
      {!hasEnrichedData && (
        <p style={{ 
          fontSize: '0.8rem', 
          margin: '1rem 0 0 0', 
          opacity: 0.7,
          textAlign: 'center'
        }}>
          (Valores simulados - use dados enriquecidos para valores reais)
        </p>
      )}
    </div>
  );
}
