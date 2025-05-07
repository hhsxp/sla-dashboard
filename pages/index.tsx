// pages/index.tsx
import React, { useEffect, useState } from 'react';
import localforage from 'localforage';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/Header';
import TabsNav from '../components/TabsNav';
import SlaBarChart from '../components/Charts/SlaBarChart';
import TicketsPieChart from '../components/Charts/TicketsPieChart';
import EffLineChart from '../components/Charts/EffLineChart';
import RiskTimeline from '../components/Charts/RiskTimeline';
import Footer from '../components/Footer';

export default function HomePage() {
  const router = useRouter();
  const { version } = router.query; // opcional: ?version=xxx

  // 1) Estados
  const [versions, setVersions]         = useState<string[]>([]);
  const [currentVersion, setVersion]   = useState<string>('');
  const [allData, setAllData]          = useState<any[]>([]);
  const [loading, setLoading]          = useState(true);

  // filtros
  const [projeto, setProjeto] = useState<string>('');
  const [tribo,   setTribo]   = useState<string>('');
  const [mes,     setMes]     = useState<string>(''); // "YYYY-MM"

  // tabs
  const tabs = ['Visão Geral','Desempenho SLA','Tempos e Status','Dados Detalhados'];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  // 2) Carrega versões salvas em localforage e dados da versão selecionada
  useEffect(() => {
    async function loadVersions() {
      const keys = await localforage.keys();
      // assumindo que você salvou com chave "v<timestamp>"
      const vers = keys.filter(k => /^v\d+$/.test(k)).sort().reverse();
      setVersions(vers);
      const toLoad = typeof version === 'string' ? version : vers[0];
      if (toLoad) setVersion(toLoad);
    }
    loadVersions();
  }, [version]);

  useEffect(() => {
    if (!currentVersion) return;
    setLoading(true);
    localforage.getItem<any[]>(currentVersion)
      .then(data => setAllData(data || []))
      .finally(() => setLoading(false));
  }, [currentVersion]);

  // 3) Gera lista de opções para filtro
  const projetos = Array.from(new Set(allData.map(r => r.Projeto))).filter(Boolean);
  const tribos   = Array.from(new Set(allData.map(r => r.Tribo))).filter(Boolean);

  // 4) Filtra os dados
  const filteredData = allData.filter(r => {
    if (projeto && r.Projeto !== projeto) return false;
    if (tribo   && r.Tribo   !== tribo)   return false;
    if (mes) {
      const dt = new Date(r.Criado);
      const m  = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;
      if (m !== mes) return false;
    }
    return true;
  });

  return (
    <>
      <Head>
        <title>Dashboard SLA</title>
      </Head>

      <Header
        versions={versions}
        currentVersion={currentVersion}
        onSelect={v => {
          setVersion(v);
          router.push(`/?version=${v}`, undefined, { shallow: true });
        }}
      />

      <main className="p-4 space-y-6">
        {/* a) Filtros */}
        <div className="flex flex-wrap gap-4">
          <select
            className="bg-gray-800 text-white p-2 rounded"
            value={projeto}
            onChange={e => setProjeto(e.target.value)}
          >
            <option value="">— Todos os Projetos —</option>
            {projetos.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <select
            className="bg-gray-800 text-white p-2 rounded"
            value={tribo}
            onChange={e => setTribo(e.target.value)}
          >
            <option value="">— Todas as Tribos —</option>
            {tribos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <input
            type="month"
            className="bg-gray-800 text-white p-2 rounded"
            value={mes}
            onChange={e => setMes(e.target.value)}
          />
        </div>

        {/* b) Navegação de abas */}
        <TabsNav
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* c) Conteúdo de cada aba */}
        {loading && <p className="text-white">Carregando dados…</p>}
        {!loading && filteredData.length === 0 && (
          <p className="text-white">Nenhum dado encontrado para esta versão/filtro.</p>
        )}

        {!loading && filteredData.length > 0 && (
          <div className="space-y-8">
            {activeTab === 'Visão Geral' && (
              <>
                <SlaBarChart data={filteredData} />
                <TicketsPieChart data={filteredData} />
              </>
            )}
            {activeTab === 'Desempenho SLA' && (
              <EffLineChart data={filteredData} />
            )}
            {activeTab === 'Tempos e Status' && (
              <RiskTimeline data={filteredData} />
            )}
            {activeTab === 'Dados Detalhados' && (
              <Footer data={filteredData} />
            )}
          </div>
        )}
      </main>
    </>
  );
}
