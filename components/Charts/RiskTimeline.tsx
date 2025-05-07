// components/Charts/RiskTimeline.tsx
import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'

export interface RiskTimelineProps {
  data: Array<{
    data: string
    violacoes: number
  }>
}

export default function RiskTimeline({ data }: RiskTimelineProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="data" tick={{ fill: '#fff' }} />
        <YAxis tickCount={5} tick={{ fill: '#fff' }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="violacoes"
          name="Vio­lações"
          stroke="#dc3545"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
