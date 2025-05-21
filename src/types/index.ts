// Definição dos dados SLA
export interface SLAData {
  Cliente: string;
  Tribo: number | string;
  Serviço: string;
  PIP: number;
  Horas: number;
  'Valor hora': number;
  Valor: number;
  Vencimentos?: string;
  Faturamento?: string;
  Saldo?: number;
  Apontamentos?: number;
  [key: string]: any; // Para campos adicionais
}

// Estatísticas calculadas
export interface Stats {
  clienteStats: Record<string, number>;
  triboStats: Record<string, number>;
  horasTotal: number;
  valorTotal: number;
}

// Versão armazenada
export interface Version {
  id: string;
  ts: string;
  data: SLAData[];
  stats: Stats;
}
