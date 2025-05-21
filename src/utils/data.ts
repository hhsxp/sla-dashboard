// src/utils/data.ts

export interface Ticket {
  cliente: string;
  tribo: string;
  servico: string;
  pip: number;
  horas: number;
  valorHora: number;
  valor: number;
  apontamentos: number;
  responsavel: string;
  criado: Date;
  sla: 'Atingido' | 'Violado';
}

// seu parser já existente
export async function parseExcel(file: File): Promise<Ticket[]> {
  // ...mapeamento das colunas da planilha
}

// adiciona esta função e exporta
export function calcSlaStats(tickets: Ticket[]) {
  const total = tickets.length;
  const atingidos = tickets.filter(t => t.sla === 'Atingido').length;
  return {
    total,
    atingidos,
    violados: total - atingidos,
    pctAtingimento: total ? (atingidos / total) * 100 : 0
  };
}

// e já deve continuar com o resto, por exemplo:
export function groupByAnalyst(tickets: Ticket[]) {
  // ...
}
