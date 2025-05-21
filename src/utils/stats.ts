import { SLAData, Stats } from '../types';

// Calcular estatísticas a partir dos dados
export function calculateStats(data: SLAData[]): Stats {
  // Cliente stats
  const clienteStats = data.reduce((acc: Record<string, number>, row) => {
    const cliente = row.Cliente;
    if (cliente) {
      acc[cliente] = (acc[cliente] || 0) + 1;
    }
    return acc;
  }, {});
  
  // Tribo stats
  const triboStats = data.reduce((acc: Record<string, number>, row) => {
    const tribo = row.Tribo?.toString();
    if (tribo) {
      acc[tribo] = (acc[tribo] || 0) + 1;
    }
    return acc;
  }, {});
  
  // Horas total
  const horasTotal = data.reduce((total, row) => {
    return total + (Number(row.Horas) || 0);
  }, 0);
  
  // Valor total
  const valorTotal = data.reduce((total, row) => {
    return total + (Number(row.Valor) || 0);
  }, 0);
  
  return {
    clienteStats,
    triboStats,
    horasTotal,
    valorTotal
  };
}

// Calcular média de horas por cliente
export function calcularMediaHorasPorCliente(data: SLAData[]): Record<string, number> {
  const horasPorCliente: Record<string, { total: number; count: number }> = {};
  
  data.forEach(row => {
    const cliente = row.Cliente;
    const horas = Number(row.Horas) || 0;
    
    if (cliente) {
      if (!horasPorCliente[cliente]) {
        horasPorCliente[cliente] = { total: 0, count: 0 };
      }
      
      horasPorCliente[cliente].total += horas;
      horasPorCliente[cliente].count += 1;
    }
  });
  
  const mediaHoras: Record<string, number> = {};
  
  Object.entries(horasPorCliente).forEach(([cliente, { total, count }]) => {
    mediaHoras[cliente] = count > 0 ? total / count : 0;
  });
  
  return mediaHoras;
}
