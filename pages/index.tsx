// pages/index.tsx
import { useState, useEffect } from 'react'
import Head from 'next/head'
import localforage from 'localforage'

import { Header } from '../components/Header'
import { UploadDropzone } from '../components/UploadDropzone'
import { TabsNav } from '../components/TabsNav'
import { SlaBarChart } from '../components/Charts/SlaBarChart'
import { TicketsPieChart } from '../components/Charts/TicketsPieChart'
import { EffLineChart } from '../components/Charts/EffLineChart'
import { RiskTimeline } from '../components/Charts/RiskTimeline'
import { Footer } from '../components/Footer'

import type { Version } from '../utils/storage'

const TAB_NAMES = [
  'Visão Geral',
  'Desempenho SLA',
  'Tempos e Status',
  'Dados Detalhados',
] as const

export default function Home() {
  // ─── Todos os hooks no topo ─────────────────────────────────
  const [versions, setVersions] = useState<Version[]>([])
  const [currentVersion, setCurrentVersion] = useState<string | null>(null)
  const [data, setData] = useState<any[]>([])
  const [projectFilter, setProjectFilter] = useState('Todos')
  const [tribeFilter, setTribeFilter] = useState('Todas')
  const [periodFilter, setPeriodFilter] = useState<'Mês' | 'Dia' | 'Ano'>('Mês')
  const [activeTab, setActiveTab] = useState<number>(0)
  const [loaded, setLoaded] = useState(false)

  // ─── carrega lista de versões (montagem) ──────────────────────
  useEffect(() => {
    localforage.keys().then(keys => {
      const vers = keys
        .filter(k => /^v\d+$/.test(k))
        .sort((a, b) => b.localeCompare(a))
      setVersions(
        vers.map(id => ({
          id,
          ts: new Date(parseInt(id.slice(1), 10)).toLocaleString(),
          data: [],
        }))
      )
      if (vers.length > 0) {
        setCurrentVersion(vers[0])
      }
    })
  }, [])

  // ─── carrega dados da versão selecionada ──────────────────────
  useEffect(() => {
    if (!currentVersion) return
    localforage.getItem<any[]>(currentVersion).then(arr => {
      setData(arr || [])
      setLoaded(true)
    })
  }, [currentVersion])

  // ─── Aplica filtros (sempre depois que data ou filtros mudarem) ─
  const filtered = data
    .filter(d => projectFilter === 'Todos' || d.Projeto === projectFilter)
    .filter(d => tribeFilter === 'Todas' || d.Tribo === tribeFilter)
    .filter(d =>
      periodFilter === 'Mês'
        ? true // Você pode adaptar pra filtrar por mês/dia/ano
        : true
    )

  // ─── Renderização condicional após hooks ──────────────────────
  if (!loaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        {!currentVersion ? (
          <UploadDropzone
            onComplete={async key => {
              // grava a nova versão e força recarregar o listagem
              const arr = await localforage.getItem<any[]>(key)
              setVersions(v => [{ id: key, ts: key.slice(1), data: [] }, ...v])
              setCurrentVersion(key)
            }}
          />
        ) : (
          <span>Carregando dados…</span>
        )}
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>SLA Dashboard</title>
      </Head>

      {/* Header com dropdown de versões */}
      <Header
        versions={versions}
        currentVersion={currentVersion!}
        onSelect={setCurrentVersion}
      />

      {/* Filtros */}
      <div className="flex space-x-4 p-4 bg-gray-800 text-white">
        <select
          value={projectFilter}
          onChange={e => setProjectFilter(e.target.value)}
          className="bg-gray-700 px-3 py-1 rounded"
        >
          <option>Todos</option>
          {[...new Set(data.map(d => d.Projeto))].map(p => (
            <option key={p}>{p}</option>
          ))}
        </select>

        <select
          value={tribeFilter}
          onChange={e => setTribeFilter(e.target.value)}
          className="bg-gray-700 px-3 py-1 rounded"
        >
          <option>Todas</option>
          {[...new Set(data.map(d => d.Tribo))].map(t => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <select
          value={periodFilter}
          onChange={e =>
            setPeriodFilter(e.target.value as 'Mês' | 'Dia' | 'Ano')
          }
          className="bg-gray-700 px-3 py-1 rounded"
        >
          <option>Mês</option>
          <option>Dia</option>
          <option>Ano</option>
        </select>
      </div>

      {/* Abas */}
      <TabsNav
        tabs={TAB_NAMES}
        activeIndex={activeTab}
        onChange={setActiveTab}
      />

      {/* Conteúdo das abas */}
      <div className="p-4 bg-gray-900 text-white space-y-6">
        {activeTab === 0 && (
          <>
            <SlaBarChart data={filtered} period={periodFilter} />
            <TicketsPieChart data={filtered} />
          </>
        )}
        {activeTab === 1 && (
          <EffLineChart data={filtered} period={periodFilter} />
        )}
        {activeTab === 2 && (
          <RiskTimeline data={filtered} period={periodFilter} />
        )}
        {activeTab === 3 && <Footer data={filtered} />}
      </div>
    </>
  )
}
