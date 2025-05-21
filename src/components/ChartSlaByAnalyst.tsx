import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Ticket, groupByAnalyst, calcSlaStats } from '../utils/data';

interface Props {
  data: Ticket[];
}

export default function ChartSlaByAnalyst({ data }: Props) {
  const grouped = groupByAnalyst(data);
  const analistas = Object.keys(grouped);

  // para cada analista, usa calcSlaStats para obter atingidos/violados
  const atingidos = analistas.map(a => calcSlaStats(grouped[a]).atingidos);
  const violados  = analistas.map(a => calcSlaStats(grouped[a]).violados);

  const chartData = {
    labels: analistas,
    datasets: [
      { label: 'Atingido', data: atingidos },
      { label: 'Violado',  data: violados }
    ]
  };

  const options = {
    maintainAspectRatio: false,
    scales: {
      x: { stacked: true, ticks: { color: '#fff' } },
      y: { stacked: true, beginAtZero: true, ticks: { color: '#fff' } }
    },
    plugins: {
      legend: { labels: { color: '#fff' } }
    }
  };

  return (
    <div style={{ height: 300, width: '100%' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
