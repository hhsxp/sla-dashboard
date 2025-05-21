export interface Ticket {
  projeto: string;
  unidade: string;
  sla: 'Atingido' | 'Violado';
  tempoResolucao?: number; // em horas
  criado: Date;
  tipo: string;
  responsavel: string;
}
