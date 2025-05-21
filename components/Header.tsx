// components/Header.tsx
import React from 'react'
import type { Version } from '../utils/storage'

interface HeaderProps {
  versions: Version[]
  currentVersion: string
  onSelect: (v: string) => void
  onUploadClick: () => void
}

export function Header({
  versions,
  currentVersion,
  onSelect,
  onUploadClick,
}: HeaderProps) {
  return (
    <header className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold">SLA Dashboard</h1>
      <div className="flex items-center space-x-4">
        <select
          className="bg-gray-700 text-white px-3 py-1 rounded"
          value={currentVersion}
          onChange={e => onSelect(e.target.value)}
        >
          {versions.map(v => (
            <option key={v.id} value={v.id}>
              {v.ts}
            </option>
          ))}
        </select>
        <button
          onClick={onUploadClick}
          className="bg-brandYellow text-black px-4 py-1 rounded hover:opacity-90"
        >
          Upload
        </button>
      </div>
    </header>
  )
}
