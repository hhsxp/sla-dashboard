import React from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { SLAData } from '../../types';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ValorHorasChartProps {
  data: SLAData[];
}

export default function ValorHorasChart({ data }: ValorHorasChartProps) {
  // Agrupar dados por cliente para evitar duplicações
  const clienteMap: Record<string, { horas: number; valor: number }> = {};
  
  data.forEach(item => {
    const cliente = item.Cliente;
    const horas = Number(item.Horas) || 0;
    const valor = Number(item.Valor) || 0;
    
    if (cliente) {
      if (!clienteMap[cliente]) {
        clienteMap[cliente] = { horas: 0, valor: 0 };
      }
      
      clienteMap[cliente].horas += horas;
      clienteMap[cliente].valor += valor;
    }
  });
  
  // Converter para arrays para o gráfico
  const clientes = Object.keys(clienteMap);
  const horasData = clientes.map(cliente => clienteMap[cliente].horas);
  const valorData = clientes.map(cliente => clienteMap[cliente].valor / 100); // Dividido por 100 para escala
  
  const chartData = {
    labels: clientes,
    datasets: [
      {
        label: 'Horas',
        data: horasData,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Valor (R$ / 100)',
        data: valorData,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
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
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.raw;
            
            if (label === 'Valor (R$ / 100)') {
              return `Valor: R$ ${(value * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            }
            
            return `${label}: ${value}`;
          }
        }
      }
    },
  };

  return (
    <div className="chart-container">
      <h3>Horas e Valores por Cliente</h3>
      <div className="chart-wrapper">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
