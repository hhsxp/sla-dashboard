import React from 'react';

interface HeaderProps {
  versions: string[];
  currentVersion: string;
  onSelect: (v: string) => void;
}

export function Header({ versions, currentVersion, onSelect }: HeaderProps) {
  return (
    <header className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">SLA Dashboard</h1>
      <select
        className="bg-gray-800 border border-gray-700 p-2"
        value={currentVersion}
        onChange={e => onSelect(e.target.value)}
      >
        <option value="">Selecione uma versão</option>
        {versions.map(v => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>
    </header>
  );
}
