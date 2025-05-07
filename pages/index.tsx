// pages/index.tsx
import Head from 'next/head'
import { useState, useEffect, ChangeEvent } from 'react'
import localforage from 'localforage'

import { Header } from '../components/Header'
import { UploadDropzone } from '../components/UploadDropzone'
import { TabsNav } from '../components/TabsNav'
import SlaBarChart from '../components/Charts/SlaBarChart'
import TicketsPieChart from '../components/Charts/TicketsPieChart'
import EffLineChart from '../components/Charts/EffLineChart'
import RiskTimeline from '../components/Charts/RiskTimeline'
import { Footer } from '../components/Footer'

const TAB_NAMES = ['Visão Geral', 'Desempenho SLA', 'Tempos e Status', 'Dados Detalhados'] as const
type Period = 'Mês' | 'Dia' | 'Ano'

export default function Home() {
  const [versions, setVersions] = useState<string[]>([])
  const [currentVersion, setCurrentVersion] = useState<string | null>(null)
  const [data, setData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<number>(0)

  const [filterProject, setFilterProject] = useState<string>('Todos')
  const [filterTribe, setFilterTribe]     = useState<string>('Todas')
  const [filterPeriod, setFilterPeriod]   = useState<Period>('Mês')

  // 1) Lista de versões
  useEffect(() => {
    localforage.keys().then(keys => {
      const vs = keys.filter(k => /^v\d+$/.test(k)).sort().reverse()
      setVersions(vs)
      if (vs.length) setCurrentVersion(vs[0])
    })
  }, [])

  // 2) Upload fallback
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

  // 3) Carrega dados quando versão muda
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

  // 4) Aplica filtros
  const filtered = data
    .filter(d => filterProject === 'Todos'  || d.Projeto === filterProject)
    .filter(d => filterTribe   === 'Todas' || d.Tribo   === filterTribe)
    // (implemente filtro por período se precisar)

  // listas únicas para dropdowns
  const projects = Array.from(new Set(data.map(d => d.Projeto)))
  const tribes   = Array.from(new Set(data.map(d => d.Tribo)))

  return (
    <>
      <Head>
        <title>SLA Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-black text-white flex flex-col">
        <Header
          versions={versions}
          currentVersion={currentVersion}
          onSelect={v => setCurrentVersion(v)}
        />

        <main className="p-6 flex-1">
          {/* filtros */}
          <div className="flex flex-wrap gap-4 mb-6">
            <select
              value={filterProject}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterProject(e.target.value)}
              className="bg-gray-800 px-3 py-2 rounded"
            >
              <option>Todos</option>
              {projects.map(p => (
                <option key={p}>{p}</option>
              ))}
            </select>

            <select
              value={filterTribe}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterTribe(e.target.value)}
              className="bg-gray-800 px-3 py-2 rounded"
            >
              <option>Todas</option>
              {tribes.map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>

            <select
              value={filterPeriod}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setFilterPeriod(e.target.value as Period)
              }
              className="bg-gray-800 px-3 py-2 rounded"
            >
              <option>Mês</option>
              <option>Dia</option>
              <option>Ano</option>
            </select>
          </div>

          {/* abas */}
          <TabsNav
            tabs={TAB_NAMES as unknown as string[]}
            activeIndex={activeTab}
            onChange={setActiveTab}
          />

          {/* conteúdo das abas */}
          <div className="mt-6 space-y-8">
            {activeTab === 0 && (
              <>
                <SlaBarChart data={filtered} period={filterPeriod} />
                <TicketsPieChart data={filtered} />
              </>
            )}
            {activeTab === 1 && <EffLineChart data={filtered} period={filterPeriod} />}
            {activeTab === 2 && <RiskTimeline data={filtered} period={filterPeriod} />}
            {activeTab === 3 && <Footer data={filtered} />}
          </div>
        </main>
      </div>
    </>
  )
}
