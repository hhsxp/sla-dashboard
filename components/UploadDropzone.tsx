import React from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { addVersion } from '../utils/storage';
import { useRouter } from 'next/router';

export function UploadDropzone() {
  const router = useRouter();
  const onDrop = async (files: File[]) => {
    const buf = await files[0].arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const sheet = wb.Sheets['Tickets'];
    if (!sheet) return alert('Aba Tickets não encontrada');
    const json = XLSX.utils.sheet_to_json(sheet, { raw: false });
    const now = new Date();
    const prioMap: Record<string, number> = { Highest: 4, High: 6, Medium: 12, Low: 24, Lowest: 40 };
    const data = (json as any[]).map(r => {
      const criado = new Date(r.Criado);
      const [h, m] = (r['Tempo de resolução'] || '0:00').split(':').map(Number);
      const horasRes = h + m/60;
      const slaH = prioMap[r.Prioridade] || 0;
      return {
        ...r,
        Criado: criado,
        HorasResolução: horasRes,
        SLA_Horas: slaH,
        CumpriuSLA_Res: horasRes <= slaH,
        Aging_Horas: (now.getTime() - criado.getTime())/3600000,
        Mes_Ano: criado.toISOString().slice(0,7)
      };
    });
    const id = await addVersion(data);
    router.push(`/?version=${id}`);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: '.xlsx' });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-gray-600 p-8 text-center text-gray-400"
    >
      <input {...getInputProps()} />
      {isDragActive ? 'Solte o arquivo aqui…' : 'Arraste ou clique para enviar o SLA.xlsx'}
    </div>
  );
}