// pages/index.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Header } from '../components/Header';
import { UploadDropzone } from '../components/UploadDropzone';
import { TabsNav } from '../components/TabsNav';
import { Footer } from '../components/Footer';
import { getVersions, getDataById, Version } from '../utils/storage';
import { SlaBarChart } from '../components/Charts/SlaBarChart';
import { TicketsPieChart } from '../components/Charts/TicketsPieChart';
import { EffLineChart } from '../components/Charts/EffLineChart';
import { RiskTimeline } from '../components/Charts/RiskTimeline';

const TAB_LIST = ['Visão Geral','Desempenho SLA','Tempos e Status','Dados Detalhados'];

export default function HomePage() {
  const router = useRouter();
  const queryVersion = typeof router.query.version === 'string' ? router.query.version : '';
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersion, setCurrentVersion] = useState<string>(queryVersion);
  const [data, setData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>(TAB_LIST[0]);

  // Carrega lista de versões
  useEffect(() => {
    getVersions().then(vs => setVersions(vs));
  }, []);

  // Quando muda a versão (via URL ou dropdown), carrega dados
  useEffect(() => {
    if (currentVersion) {
      getDataById(currentVersion).then(d => {
        if (d) setData(d);
      });
    }
  }, [currentVersion]);

  // Se URL tiver ?version, seta
  useEffect(() => {
    if (queryVersion && queryVersion !== currentVersion) {
      setCurrentVersion(queryVersion);
    }
  }, [queryVersion]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header
        versions={versions}
        currentVersion={currentVersion}
        onSelect={id => {
          setCurrentVersion(id);
          router.push(`/?version=${id}`, undefined, { shallow: true });
        }}
      />

      {!currentVersion ? (
        <div className="px-4">
          <UploadDropzone />
        </div>
      ) : (
        <div className="px-4">
          <TabsNav
            tabs={TAB_LIST}
            active={activeTab}
            onSelect={setActiveTab}
          />

          {activeTab === 'Visão Geral' && (
            <>
              <SlaBarChart data={data} />
              <TicketsPieChart data={data} />
              <Footer data={data} />
            </>
          )}

          {activeTab === 'Desempenho SLA' && (
            <EffLineChart data={data} />
          )}

          {activeTab === 'Tempos e Status' && (
            <RiskTimeline data={data} />
          )}

          {activeTab === 'Dados Detalhados' && (
            <Footer data={data} />
          )}
        </div>
      )}
    </div>
  );
}
