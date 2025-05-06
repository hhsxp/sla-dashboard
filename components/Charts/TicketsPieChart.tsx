import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
const COLORS = ['#0d6efd','#ffc107','#20c997','#f44336'];

export function TicketsPieChart({ data }: { data: any[] }) {
  const grouped = data.reduce((acc, r) => {
    const t = r['Tipo de item'] as string;
    acc[t] = (acc[t]||0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const chartData = Object.entries(grouped).map(([name,value])=>({ name, value }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} label>
          {chartData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}