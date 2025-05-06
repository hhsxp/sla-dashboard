import React from 'react';
import { BarChart, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer } from 'recharts';

export function SlaBarChart({ data }: { data: any[] }) {
  const grouped = data.reduce((acc, r) => {
    const p = r.Projeto;
    acc[p] = acc[p] || { Projeto:p, Atingido:0, Violado:0 };
    r.CumpriuSLA_Res ? acc[p].Atingido++ : acc[p].Violado++;
    return acc;
  }, {} as Record<string, any>);
  const chartData = Object.values(grouped);
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <XAxis dataKey="Projeto" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Atingido" fill="#28a745" />
        <Bar dataKey="Violado" fill="#dc3545" />
      </BarChart>
    </ResponsiveContainer>
  );
}