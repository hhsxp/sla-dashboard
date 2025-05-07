import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { UploadDropzone } from '../components/UploadDropzone';
import { TabsNav } from '../components/TabsNav';
import SlaBarChart from '../components/Charts/SlaBarChart';
import TicketsPieChart from '../components/Charts/TicketsPieChart';
import EffLineChart from '../components/Charts/EffLineChart';
import RiskTimeline from '../components/Charts/RiskTimeline';
import { Footer } from '../components/Footer';
import localforage from 'localforage';

const TAB_NAMES = ['Visão Geral','Desempenho SLA','Tempos e Status','Dados Detalhados'];

export default function Home() {
  const [versions, setVersions] = useState<string[]>([]);
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState<any[]>([]);
  const [filterProject, setFilterProject] = useState('Todos');
  const [filterTribe, setFilterTribe] = useState('Todas');
  const [filterPeriod, setFilterPeriod] = useState('Mês');

  // carrega keys de versões
  useEffect(() => {
    localforage.keys().then(keys => {
      const vers = keys.filter(k => /^v\d+$/.test(k)).sort().reverse();
      setVersions(vers);
      if (vers.length) setCurrentVersion(vers[0]);
    });
  }, []);

  // carrega dados da versão selecionada
  useEffect(() => {
    if (!currentVersion) return;
    localforage.getItem<any[]>(currentVersion).then(d => {
      setData(d || []);
    });
  }, [currentVersion]);

  // aplica filtros antes de passar para os charts
  const filtered = data
    .filter(d => filterProject === 'Todos' || d.Projeto === filterProject)
    .filter(d => filterTribe === 'Todas' || d.Tribo === filterTribe);
  
  return (
    <>
      <Head>
        <title>SLA Dashboard</title>
      </Head>
      <div className="min-h-screen bg-black text-white p-4">
        <Header
          versions={versions}
          currentVersion={currentVersion}
          onSelect={v => setCurrentVersion(v)}
        />

        {!currentVersion ? (
          <div className="mt-10">
            <UploadDropzone onComplete={key => setCurrentVersion(key)} />
          </div>
        ) : (
          <>
            <div className="flex gap-4 my-4">
              <select
                className="bg-gray-800 border border-gray-700 p-2"
                onChange={e => setFilterProject(e.target.value)}
              >
                <option>Todos</option>
                {[...new Set(data.map(d => d.Projeto))].map(p => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <select
                className="bg-gray-800 border border-gray-700 p-2"
                onChange={e => setFilterTribe(e.target.value)}
              >
                <option>Todas</option>
                {[...new Set(data.map(d => d.Tribo))].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <select
                className="bg-gray-800 border border-gray-700 p-2"
                onChange={e => setFilterPeriod(e.target.value)}
              >
                <option>Mês</option>
                <option>Dia</option>
                <option>Ano</option>
              </select>
            </div>

            <TabsNav
              tabs={TAB_NAMES}
              activeIndex={activeTab}
              onChange={i => setActiveTab(i)}
            />

            <div className="mt-6">
              {activeTab === 0 && (
                <>
                  <SlaBarChart data={filtered} period={filterPeriod} />
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
      </div>
    </>
  );
}
