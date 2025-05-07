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
  data: Array<{
    Mes_Ano: string
    Ef: number
  }>
}

export default function EffLineChart({ data }: EffLineChartProps) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="Mes_Ano" stroke="#ccc" tick={{ fill: '#fff' }} />
          <YAxis stroke="#ccc" unit=" %" tick={{ fill: '#fff' }} />
          <Tooltip /> {/* Sem formatter personalizado */}
          <Line
            type="monotone"
            dataKey="Ef"
            name="Eficiência"
            stroke="#20c997"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
