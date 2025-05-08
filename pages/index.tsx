// pages/index.tsx
import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import localforage from 'localforage'

// Named exports
import { Header } from '../components/Header'
import { UploadDropzone } from '../components/UploadDropzone'
import { TabsNav } from '../components/TabsNav'
import { Footer } from '../components/Footer'

// Charts (default exports)
import SlaBarChart from '../components/Charts/SlaBarChart'
import TicketsPieChart from '../components/Charts/TicketsPieChart'
import EffLineChart from '../components/Charts/EffLineChart'
import RiskTimeline from '../components/Charts/RiskTimeline'

import type { Version } from '../utils/storage'

const TAB_NAMES: string[] = [
  'Visão Geral',
  'Desempenho SLA',
  'Tempos e Status',
  'Dados Detalhados',
]

export default function Home() {
  // ─── Hooks no topo ─────────────────────────────────────────
  const [versions, setVersions] = useState<Version[]>([])
  const [currentVersion, setCurrentVersion] = useState<string | null>(null)
  const [data, setData] = useState<any[]>([])
  const [projectFilter, setProjectFilter] = useState('Todos')
  const [tribeFilter, setTribeFilter] = useState('Todas')
  const [periodFilter, setPeriodFilter] = useState<'Mês' | 'Dia' | 'Ano'>(
    'Mês'
  )
  const [activeTab, setActiveTab] = useState<number>(0)
  const [loaded, setLoaded] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  // ─── Carrega versões na montagem ───────────────────────────
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
      if (vers.length > 0) setCurrentVersion(vers[0])
    })
  }, [])

  // ─── Carrega dados da versão selecionada ───────────────────
  useEffect(() => {
    if (!currentVersion) return
    localforage.getItem<any[]>(currentVersion).then(arr => {
      setData(arr || [])
      setLoaded(true)
    })
  }, [currentVersion])

  // ─── Filtra os dados ───────────────────────────────────────
  const filtered = data
    .filter(d => projectFilter === 'Todos' || d.Projeto === projectFilter)
    .filter(d => tribeFilter === 'Todas' || d.Tribo === tribeFilter)

  // ─── Se ainda sem versão, mostra upload full-screen ─────────
  if (!currentVersion) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <UploadDropzone
          onComplete={async key => {
            const vers = await localforage.keys()
            const v = vers
              .filter(k => /^v\d+$/.test(k))
              .sort((a, b) => b.localeCompare(a))
            setVersions(
              v.map(id => ({
                id,
                ts: new Date(parseInt(id.slice(1), 10)).toLocaleString(),
                data: [],
              }))
            )
            setCurrentVersion(key)
          }}
        />
      </div>
    )
  }

  // ─── Se dados não carregaram ainda ────────────────────────
  if (!loaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        Carregando dados…
      </div>
    )
  }

  // ─── Render principal ───────────────────────────────────────
  return (
    <>
      <Head>
        <title>SLA Dashboard</title>
      </Head>

      {/* Header com botão Upload */}
      <Header
        versions={versions}
        currentVersion={currentVersion}
        onSelect={setCurrentVersion}
        onUploadClick={() => setShowUpload(true)}
      />

      {/* Modal de Upload */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full">
            <h2 className="text-white text-xl mb-4">
              Envie sua planilha SLA
            </h2>
            <UploadDropzone
              onComplete={async key => {
                const vers = await localforage.keys()
                const v = vers
                  .filter(k => /^v\d+$/.test(k))
                  .sort((a, b) => b.localeCompare(a))
                setVersions(
                  v.map(id => ({
                    id,
                    ts: new Date(parseInt(id.slice(1), 10)).toLocaleString(),
                    data: [],
                  }))
                )
                setCurrentVersion(key)
                setShowUpload(false)
              }}
            />
            <button
              onClick={() => setShowUpload(false)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:opacity-90"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

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
