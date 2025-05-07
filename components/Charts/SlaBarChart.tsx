// components/Charts/SlaBarChart.tsx
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface Props {
  data: any[];
  period: 'Mês' | 'Dia' | 'Ano';
}

export default function SlaBarChart({ data }: Props) {
  // Agrupa por "Projeto - Tribo"
  const map: Record<string, { ok: number; nk: number }> = {};
  data.forEach(d => {
    const key = `${d.Projeto} - ${d.Tribo}`;
    if (!map[key]) map[key] = { ok: 0, nk: 0 };
    d.CumpriuSLA ? map[key].ok++ : map[key].nk++;
  });
  const chartData = Object.entries(map).map(([grupo, { ok, nk }]) => ({
    grupo, Atingido: ok, Violado: nk,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <XAxis dataKey="grupo" tick={{ fill: '#fff' }} />
        <YAxis tick={{ fill: '#fff' }} />
        <Tooltip />
        <Legend wrapperStyle={{ color: '#fff' }} />
        <Bar dataKey="Atingido" fill="#28a745" />
        <Bar dataKey="Violado" fill="#dc3545" />
      </BarChart>
    </ResponsiveContainer>
  );
}
