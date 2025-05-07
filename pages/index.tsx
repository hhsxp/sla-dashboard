// pages/index.tsx
import React, { useEffect, useState, ChangeEvent } from 'react'
import localforage from 'localforage'
import { useRouter } from 'next/router'
import Head from 'next/head'

import { Header } from '../components/Header'
import { TabsNav } from '../components/TabsNav'
import { UploadDropzone } from '../components/UploadDropzone'
import { SlaBarChart } from '../components/Charts/SlaBarChart'
import { TicketsPieChart } from '../components/Charts/TicketsPieChart'
import { EffLineChart } from '../components/Charts/EffLineChart'
import { RiskTimeline } from '../components/Charts/RiskTimeline'
import { Footer } from '../components/Footer'

const TAB_NAMES = [
  'Visão Geral',
  'Desempenho SLA',
  'Tempos e Status',
  'Dados Detalhados',
]

export default function HomePage() {
  const router = useRouter()

  // versões gravadas (keys do localforage: vTIMESTAMP)
  const [versions, setVersions] = useState<string[]>([])
  // versão atualmente selecionada
  const [currentVersion, setCurrentVersion] = useState<string>('')
  // dados totais carregados da versão
  const [allData, setAllData] = useState<any[]>([])
  // loading geral
  const [loading, setLoading] = useState(true)
  // aba ativa
  const [activeTab, setActiveTab] = useState(0)

  // filtros
  const [filterProject, setFilterProject] = useState('Todos')
  const [filterTribe, setFilterTribe]     = useState('Todas')
  const [filterPeriod, setFilterPeriod]   = useState('Mês')

  // 1) ao montar, lista todas as versões
  useEffect(() => {
    localforage.keys().then(keys => {
      const vers = keys
        .filter(k => /^v\d+$/.test(k))
        .sort((a,b) => b.localeCompare(a))
      setVersions(vers)
      if (vers[0]) {
        setCurrentVersion(vers[0])
      } else {
        setLoading(false)
      }
    })
  }, [])

  // 2) toda vez que currentVersion muda, carrega os dados
  useEffect(() => {
    if (!currentVersion) return
    setLoading(true)
    localforage
      .getItem<any[]>(currentVersion)
      .then(data => setAllData(data || []))
      .finally(() => setLoading(false))
  }, [currentVersion])

  // 3) fallback: se não tiver NENHUMA versão, mostra upload full-screen
  if (!loading && versions.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h1 className="text-white text-2xl mb-6 text-center">
            Carregue sua planilha SLA
          </h1>
          <UploadDropzone onComplete={(newKey) => {
            // imediatamente seta e adiciona essa nova versão
            setVersions(v => [newKey, ...v])
            setCurrentVersion(newKey)
          }} />
        </div>
      </div>
    )
  }

  // 4) gera listas de valores únicos para filtros
  const projects = Array.from(new Set(allData.map(d => d.Projeto))).sort()
  const tribes   = Array.from(new Set(allData.map(d => d.Unidade))).sort()
  const periods  = ['Mês','Trimestre','Ano']  // exemplo fixo

  // 5) aplica filtros sobre allData
  const filtered = allData
    .filter(d => filterProject === 'Todos'  || d.Projeto === filterProject)
    .filter(d => filterTribe   === 'Todas' || d.Unidade === filterTribe)
    // para filtro de período você precisará montar lógica de datas aqui
    // por ora, deixamos tudo
    .slice()

  return (
    <>
      <Head>
        <title>Dashboard SLA</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-black text-white flex flex-col">
        {/* Header com dropdown de versões */}
        <Header
          versions={versions}
          currentVersion={currentVersion}
          onSelect={v => setCurrentVersion(v)}
        />

        <main className="flex-1 p-4 space-y-4">
          {/* Se ainda estiver carregando os dados */}
          {loading && <p>Carregando dados…</p>}
          {!loading && (
            <>
              {/* Área de filtros */}
              <div className="flex flex-wrap gap-4 mb-4">
                <select
                  className="bg-gray-800 text-white p-2 rounded"
                  value={filterProject}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setFilterProject(e.target.value)
                  }
                >
                  <option>Todos</option>
                  {projects.map(p => (
                    <option key={p}>{p}</option>
                  ))}
                </select>

                <select
                  className="bg-gray-800 text-white p-2 rounded"
                  value={filterTribe}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setFilterTribe(e.target.value)
                  }
                >
                  <option>Todas</option>
                  {tribes.map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>

                <select
                  className="bg-gray-800 text-white p-2 rounded"
                  value={filterPeriod}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setFilterPeriod(e.target.value)
                  }
                >
                  {periods.map(p => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Navegação de abas */}
              <TabsNav
                tabs={TAB_NAMES}
                activeIndex={activeTab}
                onChange={i => setActiveTab(i)}
              />

              {/* Conteúdo de cada aba */}
              <div className="mt-4 space-y-8">
                {activeTab === 0 && (
                  <>
                    <SlaBarChart data={filtered} />
                    <TicketsPieChart data={filtered} />
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
            </>
          )}
        </main>
      </div>
    </>
  )
}
