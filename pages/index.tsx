import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getVersions, getDataById } from '../utils/storage';
import { Header } from '../components/Header';
import { UploadDropzone } from '../components/UploadDropzone';
import { TabsNav } from '../components/TabsNav';
import { SlaBarChart } from '../components/Charts/SlaBarChart';
import { TicketsPieChart } from '../components/Charts/TicketsPieChart';
import { EffLineChart } from '../components/Charts/EffLineChart';
import { RiskTimeline } from '../components/Charts/RiskTimeline';
import { Footer } from '../components/Footer';

export default function Home() {
  const router = useRouter();
  const { version } = router.query;
  const [versions, setVersions] = useState<any[]>([]);
  const [data, setData] = useState<any[]|null>(null);

  useEffect(() => { getVersions().then(setVersions); }, []);
  useEffect(() => { if (version) getDataById(version as string).then(setData); }, [version]);

  if (!version) return <UploadDropzone />;
  if (!data) return <p className="p-4">Carregando dados...</p>;

  return (
    <div>
      <Header versions={versions} currentVersion={version as string} onSelect={id => router.push(`/?version=${id}`)} />
      <TabsNav tabs={[ 'Visão Geral', 'Eficiência', 'Risco', 'Detalhes' ]} />
      <main className="p-4 space-y-8">
        <section>
          <SlaBarChart data={data} />
          <TicketsPieChart data={data} />
        </section>
        <section>
          <EffLineChart data={data} />
          <RiskTimeline data={data} />
        </section>
        <section>
          <Footer data={data} />
        </section>
      </main>
    </div>
  );
}