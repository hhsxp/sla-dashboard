import React from 'react';
import { useReactTable, ColumnDef, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

interface FooterProps { data: any[] }

export function Footer({ data }: FooterProps) {
  const columns: ColumnDef<any>[] = Object.keys(data[0] || {}).map(key => ({
    accessorKey: key,
    header: key,
    cell: info => info.getValue(),
  }));

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
    saveAs(new Blob([buf]), 'dashboard_export.xlsx');
  };

  return (
    <div className="mt-6">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 text-white">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-4 py-2">
                    {header.isPlaceholder ? null : flexRender(
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
              <tr key={row.id} className="hover:bg-gray-700">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-2">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={exportToExcel}
        className="mt-4 px-4 py-2 bg-green-600 rounded text-white hover:bg-green-500"
      >
        Exportar para Excel
      </button>
    </div>
  );
}