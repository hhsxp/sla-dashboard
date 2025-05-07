// components/TabsNav.tsx
import React from 'react'

export interface TabsNavProps {
  /** Lista de nomes das abas */
  tabs: string[]
  /** Índice da aba atualmente selecionada */
  activeIndex: number
  /** Callback que recebe o índice da aba clicada */
  onChange: (index: number) => void
}

export function TabsNav({ tabs, activeIndex, onChange }: TabsNavProps) {
  return (
    <nav className="flex space-x-4 border-b border-gray-700">
      {tabs.map((tab, idx) => (
        <button
          key={idx}
          className={`
            pb-2 px-4 text-sm font-medium
            ${idx === activeIndex
              ? 'border-b-2 border-brandYellow text-brandYellow'
              : 'text-white/70 hover:text-white/100'}
          `}
          onClick={() => onChange(idx)}
        >
          {tab}
        </button>
      ))}
    </nav>
  )
}
