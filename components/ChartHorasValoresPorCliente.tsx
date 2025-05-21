// src/components/ChartHorasValoresPorCliente.tsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Ticket } from '../utils/data';

interface Props { data: Ticket[]; }

export default function ChartHorasValoresPorCliente({ data }: Props) {
  const grouped = data.reduce<Record<string, { horas: number; valor: number }>>((acc, t) => {
    if (!acc[t.cliente]) acc[t.cliente] = { horas: 0, valor: 0 };
    acc[t.cliente].horas += t.horas;
    acc[t.cliente].valor += t.valor;
    return acc;
  }, {});

  const labels = Object.keys(grouped);
  const horas  = labels.map(l => grouped[l].horas);
  const valor  = labels.map(l => grouped[l].valor);

  return (
    <div style={{ flex: 1, height: 300 }}>
      <Bar
        data={{
          labels,
          datasets: [
            { label: 'Horas', data: horas, backgroundColor: 'rgba(75,192,192,0.6)' },
            { label: 'Valor (R$)', data: valor, backgroundColor: 'rgba(255,99,132,0.6)' }
          ]
        }}
        options={{
          maintainAspectRatio: false,
          scales: {
            x: { ticks: { color: '#fff' } },
            y: { beginAtZero: true, ticks: { color: '#fff' } }
          },
          plugins: { legend: { labels: { color: '#fff' } } }
        }}
      />
    </div>
  );
}
