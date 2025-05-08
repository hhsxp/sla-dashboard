import { useState, useEffect } from 'react'
import { Header } from '../components/Header'
import { UploadDropzone } from '../components/UploadDropzone'
import { TabsNav } from '../components/TabsNav'
import { SlaBarChart } from '../components/Charts/SlaBarChart'
import { TicketsPieChart } from '../components/Charts/TicketsPieChart'
import { EffLineChart } from '../components/Charts/EffLineChart'
import { RiskTimeline } from '../components/Charts/RiskTimeline'
import { Footer } from '../components/Footer'
import { Version } from '../utils/storage'

const TAB_NAMES = ['Visão Geral', 'Desempenho SLA', 'Tempos e Status', 'Dados Detalhados']

export default function Home() {
  // ─── Hooks sempre no topo ────────────────────────────────────
  const [versions, setVersions] = useState<Version[]>([])
  const [currentVersion, setCurrentVersion] = useState<string | null>(null)
  const [data, setData] = useState<any[]>([])
  const [projectFilter, setProjectFilter] = useState('Todos')
  const [tribeFilter, setTribeFilter] = useState('Todas')
  const [periodFilter, setPeriodFilter] = useState<'Mês'|'Dia'|'Ano'>('Mês')
  const [activeTab, setActiveTab] = useState(0)
  const [loaded, setLoaded] = useState(false)

  // ─── Efeitos também sempre no topo ───────────────────────────
  useEffect(() => {
    // carrega lista de versões quando o componente monta
    localforage.keys().then(keys => {
      const vers = keys.filter(k => /^v\d+$/.test(k)).sort().reverse()
      setVersions(vers.map(id => ({ id, ts: id.slice(1), data: [] })))
      setCurrentVersion(vers[0])
    })
  }, [])

  useEffect(() => {
    if (!currentVersion) return
    // carrega os dados da versão selecionada
    localforage.getItem<any[]>(currentVersion).then(tickets => {
      setData(tickets || [])
      setLoaded(true)
    })
  }, [currentVersion])

  // ─── Retornos condicionais após todos os hooks ───────────────
  if (!loaded) {
    return (
      <div className="p-8 text-center text-white">
        Carregando dados do dashboard…
      </div>
    )
  }

  // ─── Render principal ────────────────────────────────────────
  // aplique aqui os filtros ao `data` (filtra por projeto, tribo, período)
  const filtered = data
    .filter(d => projectFilter === 'Todos' || d.Projeto === projectFilter)
    .filter(d => tribeFilter === 'Todas' || d.Tribo === tribeFilter)
    // …e assim por diante

  return (
    <>
      <Header
        versions={versions}
        currentVersion={currentVersion!}
        onSelect={setCurrentVersion}
      />

      <div className="p-4 flex space-x-4">
        {/* selects de projeto, tribo, período */}
      </div>

      <TabsNav
        tabs={TAB_NAMES}
        activeIndex={activeTab}
        onChange={setActiveTab}
      />

      <div className="p-4">
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
