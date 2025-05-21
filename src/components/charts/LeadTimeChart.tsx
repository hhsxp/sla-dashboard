import React from 'react';
import { Bar } from 'react-chartjs-2';

interface LeadTimeChartProps {
  leadTime: {
    lead_time_por_servico: Record<string, number>;
  };
  hasEnrichedData: boolean;
}

export default function LeadTimeChart({ leadTime, hasEnrichedData }: LeadTimeChartProps) {
  const servicos = Object.keys(leadTime.lead_time_por_servico);
  const leadTimes = servicos.map(servico => leadTime.lead_time_por_servico[servico]);
  
  const chartData = {
    labels: servicos,
    datasets: [
      {
        label: 'Lead Time (horas)',
        data: leadTimes,
        backgroundColor: 'rgba(255, 193, 7, 0.8)',
        borderColor: 'rgba(255, 193, 7, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#fff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
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
        labels: {
          color: '#fff',
          font: {
            family: 'Poppins, Arial, sans-serif',
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
      <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Lead Time por Tipo de Serviço</h3>
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
