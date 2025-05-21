import * as XLSX from 'xlsx';
import { Ticket } from '../types';

export async function parseExcel(file: File): Promise<Ticket[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false });
  return json.map(row => ({
    projeto: row['Projeto'] || '',
    unidade: row['Unidade de Negócio'] || '',
    sla: row['SLA'] as 'Atingido' | 'Violado',
    tempoResolucao: parseFloat(row['Tempo de resolução'] || '0'),
    criado: new Date(row['Data de criação']),
    tipo: row['Tipo de item'] || '',
    responsavel: row['Responsável'] || ''
  }));
}

export function calcSlaStats(tickets: Ticket[]) {
  const total = tickets.length;
  const atingidos = tickets.filter(t => t.sla === 'Atingido').length;
  return { total, atingidos, violados: total - atingidos, pctAtingimento: total ? (atingidos / total) * 100 : 0 };
}

export function groupByAnalyst(tickets: Ticket[]) {
  return tickets.reduce<Record<string, Ticket[]>>((acc, t) => {
    const key = t.responsavel || '—';
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});
}
