import React from 'react';

export interface TabsNavProps {
  tabs: string[];
  activeIndex: number;
  onChange: (i: number) => void;
}

export function TabsNav({ tabs, activeIndex, onChange }: TabsNavProps) {
  return (
    <nav className="flex space-x-4 border-b border-gray-700">
      {tabs.map((t, i) => (
        <button
          key={i}
          className={`px-4 py-2 ${
            i === activeIndex ? 'border-b-2 border-blue-500' : 'text-gray-400'
          }`}
          onClick={() => onChange(i)}
        >
          {t}
        </button>
      ))}
    </nav>
  );
}
