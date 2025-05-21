// components/Charts/TicketsPieChart.tsx
import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface Props {
  data: any[];
}

const COLORS = ['#0057e7','#ffa700','#008744','#d62d20','#004d40'];

export default function TicketsPieChart({ data }: Props) {
  // Conta por Tipo
  const map: Record<string, number> = {};
  data.forEach(d => {
    map[d.Tipo] = (map[d.Tipo] || 0) + 1;
  });
  const chartData = Object.entries(map).map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          label
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend wrapperStyle={{ color: '#fff' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
