import React from 'react';
import { SLAData } from '../types';
import { exportToExcel } from '../utils/excel';

interface DataTableProps {
  data: SLAData[];
}

export default function DataTable({ data }: DataTableProps) {
  const handleExport = () => {
    exportToExcel(data, 'SLA_Dashboard_Export.xlsx');
  };

  return (
    <div className="data-table-container">
      <div className="table-header">
        <h3>Tabela de Dados</h3>
        <button onClick={handleExport} className="export-button">
          Exportar Excel
        </button>
      </div>
      
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Tribo</th>
              <th>Serviço</th>
              <th>PIP</th>
              <th>Horas</th>
              <th>Valor Hora</th>
              <th>Valor Total</th>
              <th>Apontamentos</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                <td>{row.Cliente}</td>
                <td>{row.Tribo}</td>
                <td>{row.Serviço}</td>
                <td>{row.PIP}</td>
                <td>{row.Horas}</td>
                <td>
                  {typeof row['Valor hora'] === 'number'
                    ? row['Valor hora'].toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                    : row['Valor hora']}
                </td>
                <td>
                  {typeof row.Valor === 'number'
                    ? row.Valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                    : row.Valor}
                </td>
                <td>{row.Apontamentos || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
