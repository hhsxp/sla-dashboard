// pages/index.tsx
import { useState, useEffect } from 'react'
import Head from 'next/head'
import localforage from 'localforage'

import Header from '../components/Header'
import UploadDropzone from '../components/UploadDropzone'
import TabsNav from '../components/TabsNav'
import SlaBarChart from '../components/Charts/SlaBarChart'
import TicketsPieChart from '../components/Charts/TicketsPieChart'
import EffLineChart from '../components/Charts/EffLineChart'
import RiskTimeline from '../components/Charts/RiskTimeline'
import Footer from '../components/Footer'

import type { Version } from '../utils/storage'

const TAB_NAMES = [
  'Visão Geral',
  'Desempenho SLA',
  'Tempos e Status',
  'Dados Detalhados',
] as const

export default function Home() {
  // ─── Hooks sempre no topo ────────────────────────────
  const [versions, setVersions] = useState<Version[]>([])
  const [currentVersion, setCurrentVersion] = useState<string | null>(null)
  const [data, setData] = useState<any[]>([])
  const [projectFilter, setProjectFilter] = useState('Todos')
  const [tribeFilter, setTribeFilter] = useState('Todas')
  const [periodFilter, setPeriodFilter] = useState<'Mês' | 'Dia' | 'Ano'>('Mês')
  const [activeTab, setActiveTab] = useState<number>(0)
  const [loaded, setLoaded] = useState(false)

  // ─── Carrega versões na montagem ─────────────────────
  useEffect(() => {
    localforage.keys().then(keys => {
      const vers = keys.filter(k => /^v\d+$/.test(k)).sort((a, b) => b.localeCompare(a))
      setVersions(
        vers.map(id => ({
          id,
          ts: new Date(parseInt(id.slice(1), 10)).toLocaleString(),
          data: [],
        }))
      )
      if (vers.length > 0) setCurrentVersion(vers[0])
    })
  }, [])

  // ─── Carrega dados da versão selecionada ─────────────
  useEffect(() => {
    if (!currentVersion) return
    localforage.getItem<any[]>(currentVersion).then(arr => {
      setData(arr || [])
      setLoaded(true)
    })
  }, [currentVersion])

  // ─── Filtra os dados ─────────────────────────────────
  const filtered = data
    .filter(d => projectFilter === 'Todos' || d.Projeto === projectFilter)
    .filter(d => tribeFilter === 'Todas' || d.Tribo === tribeFilter)
    // você pode adicionar mais filtros aqui…

  // ─── Retornos condicionais após os hooks ──────────────
  if (!loaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        {!currentVersion ? (
          <UploadDropzone
            onComplete={async key => {
              // após o upload, recarrega lista de versões
              const vers = await localforage.keys()
              const v = vers.filter(k => /^v\d+$/.test(k)).sort((a, b) => b.localeCompare(a))
              setVersions(v.map(id => ({ id, ts: new Date(parseInt(id.slice(1), 10)).toLocaleString(), data: [] })))
              setCurrentVersion(key)
            }}
          />
        ) : (
          <span>Carregando dados…</span>
        )}
      </div>
    )
  }

  // ─── Interface principal ──────────────────────────────
  return (
    <>
      <Head>
        <title>SLA Dashboard</title>
      </Head>

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
          onChange={e => setPeriodFilter(e.target.value as 'Mês' | 'Dia' | 'Ano')}
          className="bg-gray-700 px-3 py-1 rounded"
        >
          <option>Mês</option>
          <option>Dia</option>
          <option>Ano</option>
        </select>
      </div>

      <TabsNav tabs={TAB_NAMES} activeIndex={activeTab} onChange={setActiveTab} />

      <div className="p-4 bg-gray-900 text-white space-y-6">
        {activeTab === 0 && (
          <>
            <SlaBarChart data={filtered} period={periodFilter} />
            <TicketsPieChart data={filtered} />
          </>
        )}
        {activeTab === 1 && <EffLineChart data={filtered} period={periodFilter} />}
        {activeTab === 2 && <RiskTimeline data={filtered} period={periodFilter} />}
        {activeTab === 3 && <Footer data={filtered} />}
      </div>
    </>
  )
}
