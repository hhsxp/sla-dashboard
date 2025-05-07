// components/Charts/EffLineChart.tsx
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

interface Props {
  data: any[];
  period: 'Mês' | 'Dia' | 'Ano';
}

export default function EffLineChart({ data, period }: Props) {
  // Escolhe campo de data
  const dateField = 'Criado'; // ajuste caso seu JSON use outro nome
  // Agrupa por período
  const map: Record<string, { ok: number; total: number }> = {};
  data.forEach(d => {
    const dt = new Date(d[dateField]);
    let key: string;
    if (period === 'Dia') {
      key = dt.toLocaleDateString();
    } else if (period === 'Ano') {
      key = dt.getFullYear().toString();
    } else {
      key = dt.toLocaleDateString('default',{ month: 'short', year: 'numeric' });
    }
    if (!map[key]) map[key] = { ok: 0, total: 0 };
    map[key].total++;
    if (d.CumpriuSLA) map[key].ok++;
  });
  const chartData = Object.entries(map).map(([mes_ano, { ok, total }]) => ({
    mes_ano,
    eficiencia: total > 0 ? (ok / total) * 100 : 0,
  })).sort((a,b) => a.mes_ano.localeCompare(b.mes_ano));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <XAxis dataKey="mes_ano" tick={{ fill: '#fff' }} />
        <YAxis unit="%" tick={{ fill: '#fff' }} />
        <Tooltip formatter={val => `${Number(val).toFixed(1)}%`} />
        <Line type="monotone" dataKey="eficiencia" stroke="#00BFFF" />
      </LineChart>
    </ResponsiveContainer>
  );
}
