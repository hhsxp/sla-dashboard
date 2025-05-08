// pages/index.tsx
import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import localforage from 'localforage'

import { Header } from '../components/Header'
import { UploadDropzone } from '../components/UploadDropzone'
import { TabsNav } from '../components/TabsNav'
import SlaBarChart from '../components/Charts/SlaBarChart'
import TicketsPieChart from '../components/Charts/TicketsPieChart'
import EffLineChart from '../components/Charts/EffLineChart'
import RiskTimeline from '../components/Charts/RiskTimeline'
import { Footer } from '../components/Footer'

import type { Version } from '../utils/storage'

const TAB_NAMES: string[] = [
  'Visão Geral',
  'Desempenho SLA',
  'Tempos e Status',
  'Dados Detalhados',
]

export default function Home() {
  // ─── Estados ──────────────────────────────────────────────────
  const [versions, setVersions] = useState<Version[]>([])
  const [currentVersion, setCurrentVersion] = useState<string | null>(null)
  const [data, setData] = useState<any[]>([])
  const [projectFilter, setProjectFilter] = useState('Todos')
  const [unitFilter, setUnitFilter] = useState('Todas')                    // Unidade de Negócio
  const [startDate, setStartDate] = useState('')                          // Data início
  const [endDate, setEndDate] = useState('')                              // Data fim
  const [activeTab, setActiveTab] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  // ─── Carrega versões salvas ────────────────────────────────────────
  useEffect(() => {
    localforage.keys().then(keys => {
      const vers = keys.filter(k => /^v\d+$/.test(k)).sort((a, b) => b.localeCompare(a))
      setVersions(
        vers.map(id => ({ id, ts: new Date(+id.slice(1)).toLocaleString(), data: [] }))
      )
      if (vers.length > 0) setCurrentVersion(vers[0])
    })
  }, [])

  // ─── Carrega dados da versão selecionada ─────────────────────────
  useEffect(() => {
    if (!currentVersion) return
    localforage.getItem<any[]>(currentVersion).then(arr => {
      setData(arr || [])
      setLoaded(true)
    })
  }, [currentVersion])

  // ─── Aplica filtros de projeto, unidade e data ─────────────────────
  const filtered = data
    // Projeto
    .filter(d => projectFilter === 'Todos' || d.Projeto === projectFilter)
    // Unidade de Negócio
    .filter(d => unitFilter === 'Todas' || d['Unidade de Negócio'] === unitFilter)
    // Intervalo de datas baseado em “Criado”
    .filter(d => {
      if (!startDate && !endDate) return true
      const created = new Date(d.Criado as string)
      if (startDate && created < new Date(startDate)) return false
      if (endDate && created > new Date(endDate)) return false
      return true
    })

  // ─── Se nunca carregou versão, mostra dropzone full-screen ────────
  if (!currentVersion) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <UploadDropzone
          onComplete={async key => {
            const vers = (await localforage.keys()).filter(k => /^v\d+$/.test(k))
            vers.sort((a,b)=>b.localeCompare(a))
            setVersions(vers.map(id=>({id,ts:new Date(+id.slice(1)).toLocaleString(),data:[]})))
            setCurrentVersion(key)
          }}
        />
      </div>
    )
  }

  // ─── Enquanto os dados não estiverem prontos ──────────────────────
  if (!loaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        Carregando dados…
      </div>
    )
  }

  // ─── UI principal ────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>SLA Dashboard</title>
      </Head>

      {/* Header com botão “Upload” */}
      <Header
        versions={versions}
        currentVersion={currentVersion}
        onSelect={setCurrentVersion}
        onUploadClick={() => setShowUpload(true)}
      />

      {/* Modal de Upload */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full">
            <h2 className="text-white text-xl mb-4">Envie sua planilha SLA</h2>
            <UploadDropzone
              onComplete={async key => {
                const vers = (await localforage.keys()).filter(k=>/^v\d+$/.test(k))
                vers.sort((a,b)=>b.localeCompare(a))
                setVersions(vers.map(id=>({id,ts:new Date(+id.slice(1)).toLocaleString(),data:[]})))
                setCurrentVersion(key)
                setShowUpload(false)
              }}
            />
            <button
              onClick={() => setShowUpload(false)}
              className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded hover:opacity-90"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Filtros de Projeto, Unidade e Data */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-800 text-white">
        {/* Projeto */}
        <select
          className="bg-gray-700 px-3 py-1 rounded"
          value={projectFilter}
          onChange={e => setProjectFilter(e.target.value)}
        >
          <option>Todos</option>
          {[...new Set(data.map(d => d.Projeto))].map(p => (
            <option key={p}>{p}</option>
          ))}
        </select>

        {/* Unidade de Negócio */}
        <select
          className="bg-gray-700 px-3 py-1 rounded"
          value={unitFilter}
          onChange={e => setUnitFilter(e.target.value)}
        >
          <option>Todas</option>
          {[...new Set(data.map(d => d['Unidade de Negócio']))].map(u => (
            <option key={u}>{u}</option>
          ))}
        </select>

        {/* Data “De” */}
        <label className="flex items-center space-x-2">
          <span>De:</span>
          <input
            type="date"
            className="bg-gray-700 px-2 py-1 rounded"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </label>

        {/* Data “Até” */}
        <label className="flex items-center space-x-2">
          <span>Até:</span>
          <input
            type="date"
            className="bg-gray-700 px-2 py-1 rounded"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </label>
      </div>

      {/* Navegação por abas */}
      <TabsNav tabs={TAB_NAMES} activeIndex={activeTab} onChange={setActiveTab} />

      {/* Conteúdo das abas */}
      <div className="p-4 bg-gray-900 text-white space-y-6">
        {activeTab === 0 && (
          <>
            <SlaBarChart data={filtered} period="Mês"  /* grouping interno */ />
            <TicketsPieChart data={filtered} />
          </>
        )}
        {activeTab === 1 && <EffLineChart data={filtered} period="Mês" />}
        {activeTab === 2 && <RiskTimeline data={filtered} period="Mês" />}
        {activeTab === 3 && <Footer data={filtered} />}
      </div>
    </>
  )
}
