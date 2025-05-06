import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function RiskTimeline({ data }: { data: any[] }) {
  const grouped = data.reduce((acc, r) => {
    const d = r.Criado.split('T')[0];
    if (!r.CumpriuSLA_Res) { acc[d] = (acc[d]||0) + 1; }
    return acc;
  }, {} as Record<string, number>);
  const chartData = Object.entries(grouped).map(([date,value]) => ({ date, Viol: value }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="Viol" stroke="#dc3545" />
      </LineChart>
    </ResponsiveContainer>
  );
}