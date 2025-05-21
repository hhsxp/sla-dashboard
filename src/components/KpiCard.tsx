import React from 'react';
interface Props { title: string; value: string | number; subtitle?: string; }
const KpiCard: React.FC<Props> = ({ title, value, subtitle }) => (
  <div className="kpi-card">
    <h3>{title}</h3>
    <p>{value}</p>
    {subtitle && <small>{subtitle}</small>}
  </div>
);
export default KpiCard;
