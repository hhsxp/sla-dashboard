import React from 'react';

interface SLAMetricsCardsProps {
  slaStats: {
    sla_atingido: number;
    sla_violado: number;
    percentual_atingimento: number;
  };
  leadTime: {
    lead_time_medio: number;
    lead_time_por_servico: Record<string, number>;
  };
  hasEnrichedData: boolean;
}

export default function SLAMetricsCards({ slaStats, leadTime, hasEnrichedData }: SLAMetricsCardsProps) {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    }}>
      <div style={{ 
        backgroundColor: '#28a745', 
        padding: '1.5rem', 
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>SLA Atingido</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{slaStats.sla_atingido}</p>
        {!hasEnrichedData && (
          <p style={{ fontSize: '0.8rem', margin: 0, opacity: 0.7 }}>
            (Valor simulado - use dados enriquecidos para valores reais)
          </p>
        )}
      </div>
      
      <div style={{ 
        backgroundColor: '#dc3545', 
        padding: '1.5rem', 
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>SLA Violado</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{slaStats.sla_violado}</p>
        {!hasEnrichedData && (
          <p style={{ fontSize: '0.8rem', margin: 0, opacity: 0.7 }}>
            (Valor simulado - use dados enriquecidos para valores reais)
          </p>
        )}
      </div>
      
      <div style={{ 
        backgroundColor: '#0d6efd', 
        padding: '1.5rem', 
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>% Atingimento SLA</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
          {slaStats.percentual_atingimento.toFixed(1)}%
        </p>
        {!hasEnrichedData && (
          <p style={{ fontSize: '0.8rem', margin: 0, opacity: 0.7 }}>
            (Valor simulado - use dados enriquecidos para valores reais)
          </p>
        )}
      </div>
      
      <div style={{ 
        backgroundColor: '#ffc107', 
        padding: '1.5rem', 
        borderRadius: '8px',
        textAlign: 'center',
        color: '#212529'
      }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>Lead Time Médio (horas)</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
          {leadTime.lead_time_medio.toFixed(1)}
        </p>
        {!hasEnrichedData && (
          <p style={{ fontSize: '0.8rem', margin: 0, opacity: 0.7 }}>
            (Valor simulado - use dados enriquecidos para valores reais)
          </p>
        )}
      </div>
    </div>
  );
}
