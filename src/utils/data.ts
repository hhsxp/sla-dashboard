import * as XLSX from 'xlsx';

export interface Ticket {
  cliente: string;
  tribo: string;
  servico: string;
  pip: number;
  horas: number;
  valorHora: number;
  valor: number;
  vencimentos: number;
  faturamento: number;
  saldo: number;
  apontamentos: number;
  auxilio: number;
}

export async function parseExcel(file: File): Promise<Ticket[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const raw: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false });

  return raw.map(row => ({
    cliente:       row['Cliente']            || '',
    tribo:         row['Tribo']              || '',
    servico:       row['Serviço']            || '',
    pip:           parseFloat(row['PIP']     || '0'),
    horas:         parseFloat(row['Horas']   || '0'),
    valorHora:     parseFloat(row['Valor hora'] || '0'),
    valor:         parseFloat(row['Valor']   || '0'),
    vencimentos:   parseFloat(row['Vencimentos'] || '0'),
    faturamento:   parseFloat(row['Faturamento'] || '0'),
    saldo:         parseFloat(row['Saldo']   || '0'),
    apontamentos:  parseFloat(row['Apontamentos'] || '0'),
    auxilio:       parseFloat(row['Auxilio'] || '0'),
  }));
}
export function groupByAnalyst(tickets: Ticket[]) {
  return tickets.reduce<Record<string, Ticket[]>>((acc, t) => {
    const key = t.responsavel || '—';
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});
}
