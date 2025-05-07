// components/TabsNav.tsx
import React from 'react';

interface TabsNavProps {
  tabs: string[];
  active: string;
  onSelect: (tab: string) => void;
}

export function TabsNav({ tabs, active, onSelect }: TabsNavProps) {
  return (
    <nav className="flex border-b border-gray-700 mb-4">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onSelect(tab)}
          className={`px-4 py-2 -mb-px ${
            tab === active
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
}
