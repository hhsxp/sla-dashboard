// pages/index.tsx
import Head from 'next/head'
import { useState, useEffect } from 'react'
import localforage from 'localforage'

import { Header } from '../components/Header'
import { UploadDropzone } from '../components/UploadDropzone'
import TabsNav from '../components/TabsNav'
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
  // lista de versões (chaves em localforage)
  const [versions, setVersions] = useState<string[]>([])
  // versão selecionada (null = ainda não fez upload)
  const [currentVersion, setCurrentVersion] = useState<string | null>(null)
  // dados brutos carregados da versão
  const [data, setData] = useState<any[]>([])
  // aba ativa
  const [activeTab, setActiveTab] = useState(0)
  // filtros
  const [filterProject, setFilterProject] = useState('Todos')
  const [filterTribe, setFilterTribe] = useState('Todas')
  const [filterPeriod, setFilterPeriod] = useState('Mês')

  // ao montar, busca todas as versões já salvas
  useEffect(() => {
    localforage.keys().then(keys => {
      const vs = keys
        .filter(k => /^v\d+$/.test(k))
        .sort()
        .reverse()
      setVersions(vs)
    })
  }, [])

  // se ainda não escolheu versão, mostra apenas o upload
  if (!currentVersion) {
    return (
      <div className="min-h-screen bg-black p-8 text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl mb-6">Carregue sua planilha SLA</h1>
        <UploadDropzone
          onComplete={async key => {
            // depois de salvar em localforage, recarrega lista de versões
            const vs = await localforage.keys().then(keys =>
              keys.filter(k => /^v\d+$/.test(k)).sort().reverse()
            )
            setVersions(vs)
            // seleciona essa versão
            setCurrentVersion(key)
          }}
        />
      </div>
    )
  }

  // quando currentVersion muda, busca os dados em localforage
  useEffect(() => {
    if (!currentVersion) return
    localforage.getItem<any[]>(currentVersion).then(arr => {
      setData(arr || [])
      // reset de abas/filtros se quiser:
      setActiveTab(0)
      setFilterProject('Todos')
      setFilterTribe('Todas')
      setFilterPeriod('Mês')
    })
  }, [currentVersion])

  // aplica filtro de projeto, tribo e (futuramente) período
  const filtered = data
    .filter(d => filterProject === 'Todos' || d.Projeto === filterProject)
    .filter(d => filterTribe === 'Todas' || d.Unidade === filterTribe)
    // aqui você pode filtrar por mês/trimestre/ano, usando d.Criado ou outra data

  return (
    <>
      <Head>
        <title>SLA Dashboard</title>
      </Head>

      <div className="min-h-screen bg-black text-white flex flex-col">
        {/* Header com dropdown de versões */}
        <Header
          versions={versions}
          currentVersion={currentVersion}
          onSelect={v => setCurrentVersion(v)}
        />

        <main className="p-6 flex-1">
          {/* LINHA DE FILTROS */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Projeto */}
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

            {/* Tribo */}
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

            {/* Período */}
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

          {/* Abas */}
          <TabsNav
            tabs={TAB_NAMES}
            selectedIndex={activeTab}
            onChange={i => setActiveTab(i)}
          />

          {/* Conteúdo das Abas */}
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
            {activeTab === 3 && (
              <Footer data={filtered} />
            )}
          </div>
        </main>
      </div>
    </>
  )
}
