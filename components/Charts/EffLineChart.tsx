import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function EffLineChart({ data }: { data: any[] }) {
  // Agrupa por mês/ano e calcula média de eficiência
  const grouped = data.reduce((acc, r) => {
    const row = r as any;
    const m = row.Mes_Ano as string;
    if (!acc[m]) {
      acc[m] = { Mes_Ano: m, totalEf: 0, count: 0 };
    }
    // Supondo que as colunas HorasApontadas e HorasContratadas existam
    const apont = Number(row.HorasApontadas) || 0;
    const contra = Number(row.HorasContratadas) || 1;
    acc[m].totalEf += apont / contra;
    acc[m].count += 1;
    return acc;
  }, {} as Record<string, { Mes_Ano: string; totalEf: number; count: number }>);

  // Transforma em array para o gráfico
  const chartData = Object.values(grouped).map(item => ({
    Mes_Ano: item.Mes_Ano,
    Ef: item.totalEf / item.count
  }));

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
