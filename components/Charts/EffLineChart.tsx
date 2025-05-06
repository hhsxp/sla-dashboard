import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function EffLineChart({ data }: { data: any[] }) {
  const grouped = data.reduce((acc, r) => {
    const m = (r as any).Mes_Ano;
    acc[m] = acc[m] || { Mes_Ano: m, Ef: 0, count: 0 };
    acc[m].Ef += ((r as any).HorasApontadas || 0) / ((r as any).HorasContratadas || 1);
    acc[m].count++;
    return acc;
  }, {} as Record<string, { Mes_Ano: string; Ef: number; count: number }> );
  const chartData = Object.values(grouped).map((item: any) => ({ Mes_Ano: item.Mes_Ano, Ef: item.Ef / item.count }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <XAxis dataKey="Mes_Ano" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="Ef" stroke="#20c997" />
      </LineChart>
    </ResponsiveContainer>
  );
}
```tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function EffLineChart({ data }: { data: any[] }) {
  const grouped = data.reduce((acc, r) => {
    const m = r.Mes_Ano;
    acc[m] = acc[m] || { Mes_Ano: m, Ef: 0, count: 0 };
    acc[m].Ef += (r.HorasApontadas||0) / (r.HorasContratadas||1);
    acc[m].count++;
    return acc;
  }, {} as Record<string, any>);
  const chartData = Object.values(grouped).map(item => ({ Mes_Ano: item.Mes_Ano, Ef: item.Ef/item.count }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <XAxis dataKey="Mes_Ano" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="Ef" stroke="#20c997" />
      </LineChart>
    </ResponsiveContainer>
  );
}