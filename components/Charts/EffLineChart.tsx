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

/** Períodos válidos para o filtro */
export type Period = 'Mês' | 'Dia' | 'Ano'

interface Props {
  data: any[]          // Array de objetos com campos de data e CumpriuSLA
  period: Period      // 'Mês' | 'Dia' | 'Ano'
}

export default function EffLineChart({ data, period }: Props) {
  // Campo de data que vem do JSON (ajuste se necessário)
  const dateField = 'Criado'

  // Agrupa por período conforme filtro
  const map: Record<string, { ok: number; total: number }> = {}

  data.forEach(item => {
    const raw = item[dateField]
    if (!raw) return
    const dt = new Date(raw as string)
    let key: string

    if (period === 'Dia') {
      key = dt.toLocaleDateString()
    } else if (period === 'Ano') {
      key = dt.getFullYear().toString()
    } else {
      key = dt.toLocaleDateString('default', { month: 'short', year: 'numeric' })
    }

    if (!map[key]) map[key] = { ok: 0, total: 0 }
    map[key].total += 1
    if (item.CumpriuSLA) {
      map[key].ok += 1
    }
  })

  // Transforma em array ordenado
  const chartData = Object.entries(map)
    .map(([mes_ano, { ok, total }]) => ({
      mes_ano,
      eficiencia: total > 0 ? (ok / total) * 100 : 0,
    }))
    .sort((a, b) => a.mes_ano.localeCompare(b.mes_ano))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <XAxis dataKey="mes_ano" tick={{ fill: '#fff' }} />
        <YAxis unit="%" tick={{ fill: '#fff' }} />
        <Tooltip formatter={val => `${Number(val).toFixed(1)}%`} />
        <Line
          type="monotone"
          dataKey="eficiencia"
          stroke="#20c997"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
