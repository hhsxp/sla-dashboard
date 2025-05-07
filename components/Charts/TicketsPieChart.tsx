// components/Charts/TicketsPieChart.tsx
import React from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const COLORS: Record<string,string> = {
  Incidente: '#0d6efd',
  'Bug Legado': '#ffc107',
  Problema: '#20c997',
  Bug: '#dc3545',
  Dúvida: '#28a745',
}

export interface TicketsPieChartProps {
  data: Array<{
    tipo: string
    count: number
  }>
}

export default function TicketsPieChart({ data }: TicketsPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="tipo"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {data.map((entry, i) => (
            <Cell key={entry.tipo} fill={COLORS[entry.tipo] || '#888'} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
