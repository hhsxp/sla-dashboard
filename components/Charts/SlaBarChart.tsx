// components/Charts/SlaBarChart.tsx
import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

export interface SlaBarChartProps {
  data: Array<{
    projeto: string
    atingido: number
    violado: number
  }>
}

export default function SlaBarChart({ data }: SlaBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="projeto" tick={{ fill: '#fff' }} />
        <YAxis tick={{ fill: '#fff' }} />
        <Tooltip />
        <Legend formatter={(value) => value === 'atingido' ? 'Atingido' : 'Violado'} />
        <Bar dataKey="atingido" name="Atingido" fill="#28a745" />
        <Bar dataKey="violado" name="Violado" fill="#dc3545" />
      </BarChart>
    </ResponsiveContainer>
  )
}
