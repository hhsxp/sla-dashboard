// components/Charts/RiskTimeline.tsx
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

interface Props {
  data: any[];
  period: 'Mês' | 'Dia' | 'Ano';
}

export default function RiskTimeline({ data, period }: Props) {
  const dateField = 'Criado';
  // Agrupa só os violados
  const map: Record<string, number> = {};
  data.forEach(d => {
    if (!d.CumpriuSLA) {
      const dt = new Date(d[dateField]);
      let key: string;
      if (period === 'Dia') {
        key = dt.toLocaleDateString();
      } else if (period === 'Ano') {
        key = dt.getFullYear().toString();
      } else {
        key = dt.toLocaleDateString('default',{ month: 'short', year: 'numeric' });
      }
      map[key] = (map[key] || 0) + 1;
    }
  });
  const chartData = Object.entries(map).map(([mes_ano, count]) => ({ mes_ano, violado: count }))
    .sort((a,b) => a.mes_ano.localeCompare(b.mes_ano));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <XAxis dataKey="mes_ano" tick={{ fill: '#fff' }} />
        <YAxis tick={{ fill: '#fff' }} />
        <Tooltip />
        <Line type="monotone" dataKey="violado" stroke="#dc3545" />
      </LineChart>
    </ResponsiveContainer>
  );
}
