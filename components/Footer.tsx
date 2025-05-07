// components/Footer.tsx
import React from 'react';
import { useReactTable, ColumnDef, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

interface FooterProps {
  data: any[];
}

export function Footer({ data }: FooterProps) {
  // Defina colunas conforme suas chaves
  const columns: ColumnDef<any>[] = React.useMemo(() => [
    { accessorKey: 'Chave', header: 'Chave' },
    { accessorKey: 'Projeto', header: 'Projeto' },
    { accessorKey: 'Prioridade', header: 'Prioridade' },
    { accessorKey: 'HorasResolução', header: 'Horas Res.' },
    { accessorKey: 'SLA_Horas', header: 'SLA (h)' },
    { accessorKey: 'CumpriuSLA_Res', header: 'SLA OK?' },
  ], []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dashboard');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf]), 'dashboard.xlsx');
  };

  return (
    <div className="mt-6">
      <div className="flex justify-end mb-2">
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Exportar .xlsx
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 text-white">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-4 py-2">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="even:bg-gray-700">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
