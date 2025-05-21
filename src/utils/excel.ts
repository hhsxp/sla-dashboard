import * as XLSX from 'xlsx';
import { SLAData, Stats } from '../types';

// Processar arquivo Excel
export function processExcel(file: File): Promise<{ data: SLAData[], stats: Stats }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Obter primeira planilha
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Converter para JSON
        const jsonData = XLSX.utils.sheet_to_json<SLAData>(worksheet);
        
        // Calcular estatísticas
        const stats = calculateStats(jsonData);
        
        resolve({ data: jsonData, stats });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

// Exportar para Excel
export function exportToExcel(data: SLAData[], filename = 'SLA_Data.xlsx'): void {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados SLA');
  
  // Gerar arquivo e fazer download
  XLSX.writeFile(workbook, filename);
}

// Calcular estatísticas
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
