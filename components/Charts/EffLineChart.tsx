// components/Charts/EffLineChart.tsx
import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export interface EffLineChartProps {
  data: any[]
  /** "Mês" | "Trimestre" | "Ano" */
  period: string
}

export function EffLineChart({ data, period }: EffLineChartProps) {
  // exemplo de agrupamento simples por mês-ano
  // você pode adaptar para trimestre ou ano com switch(period)
  const grouped = data.reduce<Record<string, { MesAno: string; totalEf: number; count: number }>>((acc, row) => {
    // supondo row.Criado é ISO string: "YYYY-MM-DD..."
    const d = new Date(row.Criado)
    const chave = `${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
    if (!acc[chave]) acc[chave] = { MesAno: chave, totalEf: 0, count: 0 }
    acc[chave].totalEf += (row.Horas_RES ?? 0)
    acc[chave].count  += 1
    return acc
  }, {})

  const chartData = Object.values(grouped).map(item => ({
    Mes_Ano: item.MesAno,
    Ef: item.count > 0 ? item.totalEf / item.count : 0,
  }))

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <XAxis dataKey="Mes_Ano" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="Ef"
            stroke="#20c997"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
