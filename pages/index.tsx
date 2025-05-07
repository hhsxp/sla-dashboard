// pages/index.tsx
import Head from 'next/head'
import { useState, useEffect } from 'react'
import localforage from 'localforage'

// Lembre-se: Header e TabsNav são Named Exports
import { Header } from '../components/Header'
import { UploadDropzone } from '../components/UploadDropzone'
import { TabsNav } from '../components/TabsNav'

// Esses gráficos também devem ser default ou named conforme você exporta.
// Ajuste se precisar: aqui considero default exports:
import SlaBarChart from '../components/Charts/SlaBarChart'
import TicketsPieChart from '../components/Charts/TicketsPieChart'
import EffLineChart from '../components/Charts/EffLineChart'
import RiskTimeline from '../components/Charts/RiskTimeline'

import Footer from '../components/Footer'

const TAB_NAMES = [
  'Visão Geral',
  'Desempenho SLA',
  'Tempos e Status',
  'Dados Detalhados',
]

export default function Home() {
  const [versions, setVersions] = useState<string[]>([])
  const [currentVersion, setCurrentVersion] = useState<string | null>(null)
  const [data, setData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState(0)
  const [filterProject, setFilterProject] = useState('Todos')
  const [filterTribe, setFilterTribe] = useState('Todas')
  const [filterPeriod, setFilterPeriod] = useState('Mês')

  useEffect(() => {
    localforage.keys().then(keys => {
      const vs = keys.filter(k => /^v\d+$/.test(k)).sort().reverse()
      setVersions(vs)
    })
  }, [])

  if (!currentVersion) {
    return (
      <div className="min-h-screen bg-black p-8 text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl mb-6">Carregue sua planilha SLA</h1>
        <UploadDropzone
          onComplete={async key => {
            const vs = await localforage
              .keys()
              .then(keys => keys.filter(k => /^v\d+$/.test(k)).sort().reverse())
            setVersions(vs)
            setCurrentVersion(key)
          }}
        />
      </div>
    )
  }

  useEffect(() => {
    if (!currentVersion) return
    localforage.getItem<any[]>(currentVersion).then(arr => {
      setData(arr || [])
      setActiveTab(0)
      setFilterProject('Todos')
      setFilterTribe('Todas')
      setFilterPeriod('Mês')
    })
  }, [currentVersion])

  const filtered = data
    .filter(d => filterProject === 'Todos' || d.Projeto === filterProject)
    .filter(d => filterTribe === 'Todas' || d.Unidade === filterTribe)

  return (
    <>
      <Head>
        <title>SLA Dashboard</title>
      </Head>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Header
          versions={versions}
          currentVersion={currentVersion}
          onSelect={v => setCurrentVersion(v)}
        />
        <main className="p-6 flex-1">
          <div className="flex flex-wrap gap-4 mb-6">
            <select
              value={filterProject}
              onChange={e => setFilterProject(e.target.value)}
              className="bg-gray-800 px-3 py-2 rounded"
            >
              <option>Todos</option>
              {[...new Set(data.map(d => d.Projeto))].map(p => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <select
              value={filterTribe}
              onChange={e => setFilterTribe(e.target.value)}
              className="bg-gray-800 px-3 py-2 rounded"
            >
              <option>Todas</option>
              {[...new Set(data.map(d => d.Unidade))].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <select
              value={filterPeriod}
              onChange={e => setFilterPeriod(e.target.value)}
              className="bg-gray-800 px-3 py-2 rounded"
            >
              <option>Mês</option>
              <option>Trimestre</option>
              <option>Ano</option>
            </select>
          </div>

          <TabsNav
            tabs={TAB_NAMES}
            selectedIndex={activeTab}
            onChange={i => setActiveTab(i)}
          />

          <div className="mt-6 space-y-8">
            {activeTab === 0 && (
              <>
                <SlaBarChart data={filtered} period={filterPeriod} />
                <TicketsPieChart data={filtered} period={filterPeriod} />
              </>
            )}
            {activeTab === 1 && (
              <EffLineChart data={filtered} period={filterPeriod} />
            )}
            {activeTab === 2 && (
              <RiskTimeline data={filtered} period={filterPeriod} />
            )}
            {activeTab === 3 && <Footer data={filtered} />}
          </div>
        </main>
      </div>
    </>
  )
}
