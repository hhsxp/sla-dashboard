// components/Charts/RiskTimeline.tsx
import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export interface RiskTimelineProps {
  data: any[]
  /** "Mês" | "Trimestre" | "Ano" */
  period: string
}

export function RiskTimeline({ data, period }: RiskTimelineProps) {
  // Filtra apenas os chamados violados
  const violations = data.filter(d => String(d.Flag_RES).toLowerCase() === 'violado')

  // Agrupa por mês-ano (formato MM/YYYY). Você pode adaptar para trimestre ou ano
  const grouped = violations.reduce<Record<string, { label: string; count: number }>>((acc, d) => {
    const date = new Date(d.Criado)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const key = `${month}/${year}`

    if (!acc[key]) acc[key] = { label: key, count: 0 }
    acc[key].count += 1
    return acc
  }, {})

  // Transforma em array ordenado
  const chartData = Object.values(grouped).sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { numeric: true })
  )

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <XAxis dataKey="label" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip />
          <Bar dataKey="count" fill="#dc3545" name="Chamados Violados" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
