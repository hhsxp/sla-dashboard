import React from 'react';

interface TabsNavProps { tabs: string[] }

export function TabsNav({ tabs }: TabsNavProps) {
  const [active, setActive] = React.useState(tabs[0]);
  return (
    <nav className="flex space-x-4 bg-gray-800 p-2">
      {tabs.map(tab => (
        <button
          key={tab}
          className={`px-4 py-2 rounded-lg focus:outline-none ${
            active === tab ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'
          }`}
          onClick={() => setActive(tab)}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
}