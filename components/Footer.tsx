import React from 'react';
import { useReactTable, ColumnDef, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

interface FooterProps { data: any[] }

export function Footer({ data }: FooterProps) {
  const columns: ColumnDef<any>[] = [
    { header: 'Chave', accessorKey: 'Chave' },
    { header: 'Projeto', accessorKey: 'Projeto' },
    { header: 'Prioridade', accessorKey: 'Prioridade' },
    { header: 'Horas Res.', accessorKey: 'HorasRes' },
    { header: 'SLA (h)', accessorKey: 'SLA_Horas' },
    { header: 'SLA OK?', accessorKey: 'CumpriuSLA' },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dados');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf]), 'Dados.xlsx');
  };

  return (
    <div className="mt-6">
      <div className="mb-4 text-right">
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-blue-600 rounded"
        >
          Exportar .xlsx
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 text-white">
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th key={h.id} className="px-4 py-2">{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(r => (
              <tr key={r.id} className="even:bg-gray-700">
                {r.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-2">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
