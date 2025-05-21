import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Ticket } from '../types';
import { Ticket, groupByAnalyst } from '../utils/data';  
interface Props { tickets: Ticket[]; }
const ChartSlaByAnalyst: React.FC<Props> = ({ tickets }) => {
  const grouped = groupByAnalyst(tickets);
  const analistas = Object.keys(grouped);
  const atingidos = analistas.map(a => grouped[a].filter(t => t.sla === 'Atingido').length);
  const violados = analistas.map(a => grouped[a].filter(t => t.sla === 'Violado').length);
  const data = { labels: analistas, datasets: [{ label: 'Atingido', data: atingidos },{ label: 'Violado', data: violados }] };
  const options = { scales: { x: { stacked: true }, y: { stacked: true } } };
  return <Bar data={data} options={options} />;
};
export default ChartSlaByAnalyst;
