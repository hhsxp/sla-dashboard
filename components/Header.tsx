import React from 'react';
import { Version } from '../utils/storage';

interface HeaderProps {
  versions: Version[];
  currentVersion: string;
  onSelect: (id: string) => void;
}

export function Header({ versions, currentVersion, onSelect }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 bg-gray-900">
      <h1 className="text-2xl font-bold text-white">Dashboard SLA</h1>
      <select
        className="bg-gray-800 text-white p-2 rounded"
        value={currentVersion}
        onChange={e => onSelect(e.target.value)}
      >
        <option value="">Selecione versão</option>
        {versions.map(v => (
          <option key={v.id} value={v.id}>
            {new Date(v.ts).toLocaleString()}
          </option>
        ))}
      </select>
    </header>
  );
}
