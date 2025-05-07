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

const TAB_NAMES = [
  'Visão Geral',
  'Desempenho SLA',
  'Tempos e Status',
  'Dados Detalhados',
]

export default function Home() {
  // versões gravadas em localforage
  const [versions, setVersions] = useState<string[]>([])
  // versão selecionada ou null antes do upload
  const [currentVersion, setCurrentVersion] = useState<string | null>(null)
  // dados completos da versão
  const [data, setData] = useState<any[]>([])
  // aba ativa
  const [activeTab, setActiveTab] = useState<number>(0)
  // filtros
  const [filterProject, setFilterProject] = useState<string>('Todos')
  const [filterTribe, setFilterTribe] = useState<string>('Todas')
  const [filterPeriod, setFilterPeriod] = useState<string>('Mês')

  // carrega lista de versões ao montar
  useEffect(() => {
    localforage.keys().then(keys => {
      const vs = keys.filter(k => /^v\d+$/.test(k)).sort().reverse()
      setVersions(vs)
    })
  }, [])

  // se não houver versão selecionada, exibe o upload
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

  // sempre que a versão muda, busca os dados
  useEffect(() => {
    if (!currentVersion) return
    localforage.getItem<any[]>(currentVersion).then(arr => {
      setData(arr || [])
      // reset de filtros/abas
      setActiveTab(0)
      setFilterProject('Todos')
      setFilterTribe('Todas')
      setFilterPeriod('Mês')
    })
  }, [currentVersion])

  // aplica filtros de projeto e tribo (adapte filterPeriod conforme necessidade)
  const filtered = data
    .filter(d => filterProject === 'Todos' || d.Projeto === filterProject)
    .filter(d => filterTribe === 'Todas' || d.Unidade === filterTribe)

  return (
    <>
      <Head>
        <title>SLA Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-black text-white flex flex-col">
        {/* Header com dropdown de versões */}
        <Header
          versions={versions}
          currentVersion={currentVersion}
          onSelect={v => setCurrentVersion(v)}
        />

        <main className="p-6 flex-1">
          {/* Filtros */}
          <div className="flex flex-wrap gap-4 mb-6">
            <select
              value={filterProject}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setFilterProject(e.target.value)
              }
              className="bg-gray-800 px-3 py-2 rounded"
            >
              <option>Todos</option>
              {[...new Set(data.map(d => d.Projeto))].map(p => (
                <option key={p}>{p}</option>
              ))}
            </select>

            <select
              value={filterTribe}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setFilterTribe(e.target.value)
              }
              className="bg-gray-800 px-3 py-2 rounded"
            >
              <option>Todas</option>
              {[...new Set(data.map(d => d.Unidade))].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>

            <select
              value={filterPeriod}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setFilterPeriod(e.target.value)
              }
              className="bg-gray-800 px-3 py-2 rounded"
            >
              <option>Mês</option>
              <option>Trimestre</option>
              <option>Ano</option>
            </select>
          </div>

          {/* Navegação por abas */}
          <TabsNav
            tabs={TAB_NAMES}
            activeIndex={activeTab}
            onChange={setActiveTab}
          />

          {/* Conteúdo das abas */}
          <div className="mt-6 space-y-8">
            {activeTab === 0 && (
              <>
                <SlaBarChart data={filtered} />
                <TicketsPieChart data={filtered} />
              </>
            )}
            {activeTab === 1 && <EffLineChart data={filtered} />}
            {activeTab === 2 && <RiskTimeline data={filtered} />}
            {activeTab === 3 && <Footer data={filtered} />}
          </div>
        </main>
      </div>
    </>
  )
}
