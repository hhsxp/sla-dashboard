// src/components/ChartDistribPorCliente.tsx
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { countBy } from 'lodash';
import { Ticket } from '../utils/data';

interface Props { data: Ticket[]; }

const Palette = [
  '#4dc9f6','#f67019','#f53794','#537bc4','#acc236','#166a8f','#00a950','#58595b','#8549ba'
];

export default function ChartDistribPorCliente({ data }: Props) {
  const counts = countBy(data, t => t.cliente);
  const labels = Object.keys(counts);
  const valores = Object.values(counts);

  return (
    <div style={{ flex: 1, height: 300 }}>
      <Pie
        data={{
          labels,
          datasets: [{
            data: valores,
            backgroundColor: Palette.slice(0, labels.length),
            borderWidth: 0
          }]
        }}
        options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: '#fff' } } } }}
      />
    </div>
  );
}
