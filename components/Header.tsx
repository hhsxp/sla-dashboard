// components/Header.tsx
import React from 'react'

interface HeaderProps {
  versions: string[]
  currentVersion: string
  onSelect: (version: string) => void
}

export function Header({ versions, currentVersion, onSelect }: HeaderProps) {
  return (
    <header className="bg-gray-900 p-4 flex items-center justify-between">
      <div className="text-2xl font-bold text-white">SLA Dashboard</div>
      <select
        className="bg-gray-800 text-white px-3 py-1 rounded"
        value={currentVersion}
        onChange={e => onSelect(e.target.value)}
      >
        <option value="">Selecione a versão</option>
        {versions.map(v => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    </header>
  )
}
