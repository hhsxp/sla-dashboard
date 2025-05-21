import React from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { SLAData } from '../types';

interface ExportButtonProps {
  data: SLAData[];
  filename?: string;
  label?: string;
  className?: string;
}

export default function ExportButton({ 
  data, 
  filename = 'SLA_Dashboard_Export.xlsx',
  label = 'Exportar Excel',
  className = 'export-button'
}: ExportButtonProps) {
  const handleExport = () => {
    // Criar planilha
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Ajustar largura das colunas
    const columnWidths = [
      { wch: 15 }, // Cliente
      { wch: 8 },  // Tribo
      { wch: 25 }, // Serviço
      { wch: 10 }, // PIP
      { wch: 10 }, // Horas
      { wch: 12 }, // Valor hora
      { wch: 12 }, // Valor
      { wch: 15 }, // Apontamentos
    ];
    
    worksheet['!cols'] = columnWidths;
    
    // Criar workbook e adicionar planilha
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados SLA');
    
    // Gerar arquivo e fazer download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, filename);
  };

  return (
    <button 
      onClick={handleExport} 
      className={className}
      title="Exportar dados para Excel"
    >
      {label}
    </button>
  );
}
