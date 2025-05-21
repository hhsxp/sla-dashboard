import React from 'react';
import { Pie } from 'react-chartjs-2';

interface SLAChartProps {
  slaStats: {
    sla_atingido: number;
    sla_violado: number;
  };
  hasEnrichedData: boolean;
}

export default function SLAChart({ slaStats, hasEnrichedData }: SLAChartProps) {
  const chartData = {
    labels: ['SLA Atingido', 'SLA Violado'],
    datasets: [
      {
        data: [slaStats.sla_atingido, slaStats.sla_violado],
        backgroundColor: [
          'rgba(40, 167, 69, 0.8)',  // Verde para atingido
          'rgba(220, 53, 69, 0.8)',  // Vermelho para violado
        ],
        borderColor: [
          'rgba(40, 167, 69, 1)',
          'rgba(220, 53, 69, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#fff',
          font: {
            family: 'Poppins, Arial, sans-serif',
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = slaStats.sla_atingido + slaStats.sla_violado;
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
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
      <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>SLA Atingido x Violado</h3>
      <div style={{ height: '250px' }}>
        <Pie data={chartData} options={options} />
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
