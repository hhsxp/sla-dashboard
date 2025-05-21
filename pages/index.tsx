import { useState, useEffect } from 'react'
import { Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

// Importar componentes
import FilterBar, { FilterState } from '../components/FilterBar'
import SLAMetricsCards from '../components/SLAMetricsCards'
import SLAChart from '../components/charts/SLAChart'
import LeadTimeChart from '../components/charts/LeadTimeChart'
import AnalistaChart from '../components/charts/AnalistaChart'

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

// Definir tipos para os dados
interface SLAData {
  Cliente: string
  Tribo: number | string
  Serviço: string
  PIP: number
  Horas: number
  'Valor hora': number
  Valor: number
  Vencimentos?: string
  Faturamento?: string
  Saldo?: number
  Apontamentos?: number
  Auxilio?: number
  Coluna1?: any
  // Campos para dados enriquecidos (opcionais)
  Data_Abertura?: string
  Data_Fechamento?: string
  Analista?: string
  Status_SLA?: string
  Tipo_Ticket?: string
}

interface Stats {
  clienteStats: Record<string, number>
  triboStats: Record<string, number>
  horasTotal: number
  valorTotal: number
}

interface AllStats {
  basic_stats: {
    total_projetos: number
    total_horas: number
    valor_total: number
  }
  cliente_stats: Record<string, number>
  servico_stats: Record<string, number>
  tribo_stats: Record<string, number>
  horas_por_cliente: Record<string, number>
  valor_por_cliente: Record<string, number>
  eficiencia: Record<string, number>
  sla_stats: {
    sla_atingido: number
    sla_violado: number
    percentual_atingimento: number
  }
  lead_time: {
    lead_time_medio: number
    lead_time_por_servico: Record<string, number>
  }
  analista_stats: {
    atendimentos_por_analista: Record<string, number>
    sla_por_analista: Record<string, { atingido: number; violado: number }>
  }
  has_enriched_data: boolean
}

export default function Home() {
  const [data, setData] = useState<SLAData[]>([])
  const [filteredData, setFilteredData] = useState<SLAData[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [allStats, setAllStats] = useState<AllStats | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'sla' | 'analistas' | 'data'>('overview')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return alert('Selecione um arquivo antes!')

    setLoading(true)
    setError(null)

    try {
      const form = new FormData()
      form.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form
      })
      
      const json = await res.json()
      
      if (!res.ok) {
        throw new Error(json.error || 'Erro ao processar o arquivo')
      }
      
      console.log('Dados recebidos:', json)
      
      if (json.data) {
        setData(json.data)
        setFilteredData(json.data)
      }
      
      if (json.stats) {
        setStats(json.stats)
      }
      
      if (json.allStats) {
        setAllStats(json.allStats)
      } else {
        // Se não receber allStats da API, criar um objeto com valores padrão
        setAllStats({
          basic_stats: {
            total_projetos: json.data?.length || 0,
            total_horas: json.stats?.horasTotal || 0,
            valor_total: json.stats?.valorTotal || 0
          },
          cliente_stats: json.stats?.clienteStats || {},
          servico_stats: {},
          tribo_stats: json.stats?.triboStats || {},
          horas_por_cliente: {},
          valor_por_cliente: {},
          eficiencia: {},
          sla_stats: {
            sla_atingido: 80, // Valor simulado
            sla_violado: 20,  // Valor simulado
            percentual_atingimento: 80 // Valor simulado
          },
          lead_time: {
            lead_time_medio: 24, // Valor simulado
            lead_time_por_servico: {
              'Suporte': 18,
              'Táxi': 12,
              'Portal de negócios': 36,
              'Survey': 24,
              'Sob demanda': 48
            }
          },
          analista_stats: {
            atendimentos_por_analista: {
              'Analista 1': 5,
              'Analista 2': 3,
              'Analista 3': 2
            },
            sla_por_analista: {
              'Analista 1': { atingido: 4, violado: 1 },
              'Analista 2': { atingido: 2, violado: 1 },
              'Analista 3': { atingido: 2, violado: 0 }
            }
          },
          has_enriched_data: false
        })
      }
    } catch (err) {
      console.error('Erro:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Função para lidar com mudanças nos filtros
  const handleFilterChange = (filters: FilterState) => {
    if (!data.length) return
    
    let filtered = [...data]
    
    // Aplicar filtro de cliente
    if (filters.cliente) {
      filtered = filtered.filter(item => item.Cliente === filters.cliente)
    }
    
    // Aplicar filtro de tribo
    if (filters.tribo) {
      filtered = filtered.filter(item => String(item.Tribo) === filters.tribo)
    }
    
    // Aplicar filtro de serviço
    if (filters.servico) {
      filtered = filtered.filter(item => item.Serviço === filters.servico)
    }
    
    // Aplicar filtro de período (se tivermos dados enriquecidos com datas)
    // Isso seria implementado com dados reais de Data_Abertura
    
    setFilteredData(filtered)
  }

  // Preparar dados para os gráficos
  const clienteChartData = {
    labels: stats ? Object.keys(stats.clienteStats) : [],
    datasets: [
      {
        label: 'Projetos por Cliente',
        data: stats ? Object.values(stats.clienteStats) : [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const horasValorChartData = {
    labels: filteredData.map(item => item.Cliente).filter(Boolean),
    datasets: [
      {
        label: 'Horas',
        data: filteredData.map(item => item.Horas).filter(Boolean),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Valor (R$ / 100)',
        data: filteredData.map(item => item.Valor ? item.Valor / 100 : null).filter(Boolean), // Dividido por 100 para escala
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  }

  // Preparar dados para o gráfico de serviços
  const servicoChartData = {
    labels: allStats ? Object.keys(allStats.servico_stats) : [],
    datasets: [
      {
        label: 'Projetos por Tipo de Serviço',
        data: allStats ? Object.values(allStats.servico_stats) : [],
        backgroundColor: [
          'rgba(255, 159, 64, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
        borderColor: [
          'rgba(255, 159, 64, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  return (
    <div style={{ 
      padding: 20, 
      color: 'white', 
      background: '#111',
      fontFamily: 'Poppins, Arial, sans-serif',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        color: '#0d6efd'
      }}>
        Dashboard SLA
      </h1>
      
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        backgroundColor: '#222',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h2 style={{ marginTop: 0 }}>Upload de Planilha SLA</h2>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <input
              type="file"
              accept=".xlsx"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              style={{ 
                backgroundColor: '#333',
                color: 'white',
                padding: '0.5rem',
                borderRadius: '4px',
                width: '100%'
              }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              backgroundColor: '#0d6efd',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1rem',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Processando...' : 'Enviar'}
          </button>
        </form>
        
        {error && (
          <div style={{ 
            backgroundColor: '#dc3545', 
            color: 'white', 
            padding: '0.75rem', 
            borderRadius: '4px',
            marginTop: '1rem'
          }}>
            {error}
          </div>
        )}
      </div>

      {filteredData.length > 0 && stats && allStats && (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Filtros */}
          <FilterBar data={data} onFilterChange={handleFilterChange} />
          
          {/* Tabs de navegação */}
          <div style={{ 
            display: 'flex', 
            backgroundColor: '#222', 
            borderRadius: '8px 8px 0 0',
            marginBottom: '0',
            overflow: 'hidden'
          }}>
            <button 
              onClick={() => setActiveTab('overview')}
              style={{
                flex: 1,
                padding: '1rem',
                backgroundColor: activeTab === 'overview' ? '#333' : 'transparent',
                color: 'white',
                border: 'none',
                borderBottom: activeTab === 'overview' ? '2px solid #0d6efd' : 'none',
                cursor: 'pointer'
              }}
            >
              Visão Geral
            </button>
            <button 
              onClick={() => setActiveTab('sla')}
              style={{
                flex: 1,
                padding: '1rem',
                backgroundColor: activeTab === 'sla' ? '#333' : 'transparent',
                color: 'white',
                border: 'none',
                borderBottom: activeTab === 'sla' ? '2px solid #0d6efd' : 'none',
                cursor: 'pointer'
              }}
            >
              Métricas SLA
            </button>
            <button 
              onClick={() => setActiveTab('analistas')}
              style={{
                flex: 1,
                padding: '1rem',
                backgroundColor: activeTab === 'analistas' ? '#333' : 'transparent',
                color: 'white',
                border: 'none',
                borderBottom: activeTab === 'analistas' ? '2px solid #0d6efd' : 'none',
                cursor: 'pointer'
              }}
            >
              Analistas
            </button>
            <button 
              onClick={() => setActiveTab('data')}
              style={{
                flex: 1,
                padding: '1rem',
                backgroundColor: activeTab === 'data' ? '#333' : 'transparent',
                color: 'white',
                border: 'none',
                borderBottom: activeTab === 'data' ? '2px solid #0d6efd' : 'none',
                cursor: 'pointer'
              }}
            >
              Dados
            </button>
          </div>
          
          {/* Conteúdo da aba Visão Geral */}
          {activeTab === 'overview' && (
            <>
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
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>Total de Projetos</h3>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{filteredData.length}</p>
                </div>
                
                <div style={{ 
                  backgroundColor: '#0d6efd', 
                  padding: '1.5rem', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>Total de Horas</h3>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
                    {filteredData.reduce((sum, item) => sum + (item.Horas || 0), 0)}
                  </p>
                </div>
                
                <div style={{ 
                  backgroundColor: '#dc3545', 
                  padding: '1.5rem', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>Valor Total (R$)</h3>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
                    {filteredData.reduce((sum, item) => sum + (item.Valor || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                gap: '2rem',
                marginBottom: '2rem'
              }}>
                <div style={{ 
                  backgroundColor: '#222', 
                  padding: '1.5rem', 
                  borderRadius: '8px'
                }}>
                  <h3 style={{ marginTop: 0 }}>Distribuição por Cliente</h3>
                  <div style={{ height: '300px' }}>
                    <Pie data={clienteChartData} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>
                
                <div style={{ 
                  backgroundColor: '#222', 
                  padding: '1.5rem', 
                  borderRadius: '8px'
                }}>
                  <h3 style={{ marginTop: 0 }}>Horas e Valores por Cliente</h3>
                  <div style={{ height: '300px' }}>
                    <Bar 
                      data={horasValorChartData} 
                      options={{ 
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              color: '#fff'
                            },
                            grid: {
                              color: 'rgba(255, 255, 255, 0.1)'
                            }
                          },
                          x: {
                            ticks: {
                              color: '#fff'
                            },
                            grid: {
                              color: 'rgba(255, 255, 255, 0.1)'
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            labels: {
                              color: '#fff'
                            }
                          }
                        }
                      }} 
                    />
                  </div>
                </div>
              </div>
              
              <div style={{ 
                backgroundColor: '#222', 
                padding: '1.5rem', 
                borderRadius: '8px',
                marginBottom: '2rem'
              }}>
                <h3 style={{ marginTop: 0 }}>Distribuição por Tipo de Serviço</h3>
                <div style={{ height: '300px' }}>
                  <Pie 
                    data={servicoChartData} 
                    options={{ 
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            color: '#fff'
                          }
                        }
                      }
                    }} 
                  />
                </div>
              </div>
            </>
          )}
          
          {/* Conteúdo da aba Métricas SLA */}
          {activeTab === 'sla' && (
            <>
              <SLAMetricsCards 
                slaStats={allStats.sla_stats}
                leadTime={allStats.lead_time}
                hasEnrichedData={allStats.has_enriched_data}
              />
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                gap: '2rem',
                marginBottom: '2rem'
              }}>
                <SLAChart 
                  slaStats={allStats.sla_stats}
                  hasEnrichedData={allStats.has_enriched_data}
                />
                
                <LeadTimeChart 
                  leadTime={allStats.lead_time}
                  hasEnrichedData={allStats.has_enriched_data}
                />
              </div>
            </>
          )}
          
          {/* Conteúdo da aba Analistas */}
          {activeTab === 'analistas' && (
            <>
              <div style={{ 
                backgroundColor: '#222', 
                padding: '1.5rem', 
                borderRadius: '8px',
                marginBottom: '2rem'
              }}>
                <AnalistaChart 
                  analistaStats={allStats.analista_stats}
                  hasEnrichedData={allStats.has_enriched_data}
                />
              </div>
              
              <div style={{ 
                backgroundColor: '#222', 
                padding: '1.5rem', 
                borderRadius: '8px',
                marginBottom: '2rem'
              }}>
                <h3 style={{ marginTop: 0 }}>Atendimentos por Analista</h3>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  color: 'white'
                }}>
                  <thead>
                    <tr>
                      <th style={tableHeaderStyle}>Analista</th>
                      <th style={tableHeaderStyle}>Total de Atendimentos</th>
                      <th style={tableHeaderStyle}>SLA Atingido</th>
                      <th style={tableHeaderStyle}>SLA Violado</th>
                      <th style={tableHeaderStyle}>% Atingimento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(allStats.analista_stats.atendimentos_por_analista).map((analista, index) => {
                      const atendimentos = allStats.analista_stats.atendimentos_por_analista[analista] || 0;
                      const atingido = allStats.analista_stats.sla_por_analista[analista]?.atingido || 0;
                      const violado = allStats.analista_stats.sla_por_analista[analista]?.violado || 0;
                      const percentual = atendimentos > 0 ? (atingido / atendimentos) * 100 : 0;
                      
                      return (
                        <tr key={analista} style={{ backgroundColor: index % 2 === 0 ? '#333' : '#444' }}>
                          <td style={tableCellStyle}>{analista}</td>
                          <td style={tableCellStyle}>{atendimentos}</td>
                          <td style={tableCellStyle}>{atingido}</td>
                          <td style={tableCellStyle}>{violado}</td>
                          <td style={tableCellStyle}>{percentual.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {!allStats.has_enriched_data && (
                  <p style={{ 
                    fontSize: '0.8rem', 
                    margin: '1rem 0 0 0', 
                    opacity: 0.7,
                    textAlign: 'center'
                  }}>
                    (Valores simulados - use dados enriquecidos para valores reais)
                  </p>
                )}
              </div>
            </>
          )}
          
          {/* Conteúdo da aba Dados */}
          {activeTab === 'data' && (
            <div style={{ 
              backgroundColor: '#222', 
              padding: '1.5rem', 
              borderRadius: '8px',
              overflowX: 'auto'
            }}>
              <h3 style={{ marginTop: 0 }}>Tabela de Dados</h3>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                color: 'white'
              }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Cliente</th>
                    <th style={tableHeaderStyle}>Tribo</th>
                    <th style={tableHeaderStyle}>Serviço</th>
                    <th style={tableHeaderStyle}>PIP</th>
                    <th style={tableHeaderStyle}>Horas</th>
                    <th style={tableHeaderStyle}>Valor Hora</th>
                    <th style={tableHeaderStyle}>Valor Total</th>
                    <th style={tableHeaderStyle}>Apontamentos</th>
                    {allStats.has_enriched_data && (
                      <>
                        <th style={tableHeaderStyle}>Data Abertura</th>
                        <th style={tableHeaderStyle}>Data Fechamento</th>
                        <th style={tableHeaderStyle}>Analista</th>
                        <th style={tableHeaderStyle}>Status SLA</th>
                        <th style={tableHeaderStyle}>Tipo Ticket</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, index) => (
                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#333' : '#444' }}>
                      <td style={tableCellStyle}>{row.Cliente}</td>
                      <td style={tableCellStyle}>{row.Tribo}</td>
                      <td style={tableCellStyle}>{row.Serviço}</td>
                      <td style={tableCellStyle}>{row.PIP}</td>
                      <td style={tableCellStyle}>{row.Horas}</td>
                      <td style={tableCellStyle}>
                        {typeof row['Valor hora'] === 'number' 
                          ? row['Valor hora'].toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                          : row['Valor hora']}
                      </td>
                      <td style={tableCellStyle}>
                        {typeof row.Valor === 'number' 
                          ? row.Valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                          : row.Valor}
                      </td>
                      <td style={tableCellStyle}>{row.Apontamentos || '-'}</td>
                      {allStats.has_enriched_data && (
                        <>
                          <td style={tableCellStyle}>{row.Data_Abertura || '-'}</td>
                          <td style={tableCellStyle}>{row.Data_Fechamento || '-'}</td>
                          <td style={tableCellStyle}>{row.Analista || '-'}</td>
                          <td style={tableCellStyle}>{row.Status_SLA || '-'}</td>
                          <td style={tableCellStyle}>{row.Tipo_Ticket || '-'}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Estilos para a tabela
const tableHeaderStyle = {
  backgroundColor: '#0d6efd',
  padding: '0.75rem',
  textAlign: 'left' as const,
  borderBottom: '2px solid #333'
}

const tableCellStyle = {
  padding: '0.75rem',
  borderBottom: '1px solid #333'
}
