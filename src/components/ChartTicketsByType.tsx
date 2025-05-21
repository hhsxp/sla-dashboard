import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Ticket } from '../types';
import { countBy } from 'lodash';
interface Props { tickets: Ticket[]; }
const ChartTicketsByType: React.FC<Props> = ({ tickets }) => {
  const counts = countBy(tickets, t => t.tipo);
  const data = { labels: Object.keys(counts), datasets: [{ data: Object.values(counts) }] };
  return <Pie data={data} />;
};
export default ChartTicketsByType;
