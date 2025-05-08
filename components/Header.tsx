// components/Header.tsx
import React from 'react'
import type { Version } from '../utils/storage'

interface HeaderProps {
  versions: Version[]            // agora é Version[]
  currentVersion: string
  onSelect: (v: string) => void
}

export function Header({ versions, currentVersion, onSelect }: HeaderProps) {
  return (
    <header className="bg-gray-800 text-white p-4 flex items-center justify-between">
      <div className="text-2xl font-bold">SLA Dashboard</div>
      <select
        className="bg-gray-700 text-white px-2 py-1 rounded"
        value={currentVersion}
        onChange={e => onSelect(e.target.value)}
      >
        {versions.map(v => (
          <option key={v.id} value={v.id}>
            {v.ts} {/* ou `v.id` se preferir mostrar o id */}
          </option>
        ))}
      </select>
    </header>
  )
}
