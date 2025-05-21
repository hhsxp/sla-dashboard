import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ClienteChartProps {
  clienteStats: Record<string, number>;
}

export default function ClienteChart({ clienteStats }: ClienteChartProps) {
  const data = {
    labels: Object.keys(clienteStats),
    datasets: [
      {
        data: Object.values(clienteStats),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="chart-container">
      <h3>Distribuição por Cliente</h3>
      <div className="chart-wrapper">
        <Pie data={data} options={{ maintainAspectRatio: false }} />
      </div>
    </div>
  );
}
