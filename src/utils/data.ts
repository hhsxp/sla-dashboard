// src/utils/data.ts
import * as XLSX from 'xlsx';

export interface Ticket {
  cliente: string;
  tribo: string;
  servico: string;
  pip: number;
  horas: number;
  valorHora: number;
  valor: number;
  apontamentos: number;
  criado?: Date;          // opcional, só se você tiver data na planilha
  responsavel?: string;   // opcional, só se você tiver essa coluna
}

export async function parseExcel(file: File): Promise<Ticket[]> {
  const buf = await file.arrayBuffer();
  const wb  = XLSX.read(buf);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const raw: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false });

  return raw.map(row => ({
    cliente:      row['Cliente']  || '',
    tribo:        row['Tribo']    || '',
    servico:      row['Serviço']  || '',
    pip:          parseFloat(row['PIP']   || '0'),
    horas:        parseFloat(row['Horas'] || '0'),
    valorHora:    parseFloat(row['Valor hora'] || '0'),
    valor:        parseFloat(row['Valor Total'] || '0'),
    apontamentos: parseFloat(row['Apontamentos'] || '0'),
    criado:       row['Data de criação'] ? new Date(row['Data de criação']) : undefined,
    responsavel:  row['Responsável'] || undefined
  }));
}

export function calcSlaStats(data: Ticket[]) {
  const total    = data.length;
  // vou assumir SLA atingido quando horas ≥ 0; ajuste se a lógica for outra
  const atingidos = data.filter(t => t.horas >= 0).length;
  return {
    total,
    atingidos,
    violados: total - atingidos,
    pctAtingimento: total ? (atingidos / total) * 100 : 0
  };
}

export function groupByAnalyst(data: Ticket[]) {
  return data.reduce<Record<string, Ticket[]>>((acc, t) => {
    const who = t.responsavel || '—';
    if (!acc[who]) acc[who] = [];
    acc[who].push(t);
    return acc;
  }, {});
}
