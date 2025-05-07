// components/Charts/EffLineChart.tsx
import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'

export interface EffLineChartProps {
  data: Array<{
    mes_ano: string
    eficiencia: number
  }>
}

export default function EffLineChart({ data }: EffLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="mes_ano" tick={{ fill: '#fff' }} />
        <YAxis unit="%" tick={{ fill: '#fff' }} />
        <Tooltip formatter={(value:number) => `${(value*100).toFixed(1)}%`} />
        <Line
          type="monotone"
          dataKey="eficiencia"
          name="Eficiência"
          stroke="#20c997"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
