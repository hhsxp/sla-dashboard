import React, { useEffect, useState } from 'react';
import { UploadDropzone } from '../components/UploadDropzone';
import { getVersions, getDataById } from '../utils/storage';
import { useRouter } from 'next/router';
import { Header } from '../components/Header';
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
  const [data, setData] = useState<any[] | null>(null);

  // carrega versões no mount
  useEffect(() => { getVersions().then(setVersions); }, []);

  // quando query param version mudar
  useEffect(() => {
    if (version) getDataById(version as string).then(setData);
  }, [version]);

  if (!version) return <UploadDropzone />;
  if (!data) return <p>Carregando dados…</p>;

  return (
    <div className="p-4">
      <Header versions={versions} currentVersion={version as string} onSelect={id => router.push(`/?version=${id}`)} />
      <TabsNav tabs={[ 'Visão Geral', 'Eficiência', 'Risco', 'Detalhes' ]} />
      <section>
        <SlaBarChart data={data} />
        <TicketsPieChart data={data} />
      </section>
      <section>
        <EffLineChart data={data} />
        <RiskTimeline data={data} />
      </section>
      <Footer data={data} />
    </div>
  );
}