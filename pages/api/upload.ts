// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, Fields, Files, File as FormidableFile } from 'formidable'
import ExcelJS from 'exceljs'

export const config = { api: { bodyParser: false } }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  // 1) Use IncomingForm diretamente
  const form = new IncomingForm()

  // 2) Encapsula parse em promise
  const parseForm = () =>
    new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
      form.parse(req, (err, fields, files) =>
        err ? reject(err) : resolve({ fields, files })
      )
    })

  try {
    const { files } = await parseForm()
    const file = (files.file as FormidableFile)
    if (!file.filepath) {
      return res.status(400).json({ error: 'Arquivo não recebido corretamente.' })
    }

    // 3) Lê o Excel
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(file.filepath)
    
    // 4) Processa os dados da planilha
    const worksheet = workbook.getWorksheet(1) // Pega a primeira planilha
    if (!worksheet) {
      return res.status(400).json({ error: 'Planilha não encontrada no arquivo.' })
    }
    
    // Extrai os cabeçalhos (primeira linha)
    const headers: string[] = []
    worksheet.getRow(1).eachCell((cell) => {
      headers.push(cell.value?.toString() || '')
    })
    
    // Extrai os dados (a partir da segunda linha)
    const data: Record<string, any>[] = []
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return // Pula a linha de cabeçalho
      
      const rowData: Record<string, any> = {}
      row.eachCell((cell, colNumber) => {
        // Usa o cabeçalho como chave, ou "coluna_X" se não houver cabeçalho
        const header = headers[colNumber - 1] || `coluna_${colNumber}`
        
        // Trata diferentes tipos de dados
        if (cell.value instanceof Date) {
          rowData[header] = cell.value.toISOString()
        } else if (typeof cell.value === 'object' && cell.value !== null) {
          // Para fórmulas e outros objetos complexos
          rowData[header] = cell.value.result || cell.value.text || cell.value.toString()
        } else {
          rowData[header] = cell.value
        }
      })
      
      data.push(rowData)
    })
    
    // Verifica se temos dados enriquecidos
    const hasEnrichedData = data.some(row => 
      row['Data_Abertura'] || row['Data_Fechamento'] || 
      row['Analista'] || row['Status_SLA'] || row['Tipo_Ticket']
    );
    
    // Calcula estatísticas básicas para os gráficos
    const clienteStats = data.reduce((acc: Record<string, number>, row) => {
      const cliente = row['Cliente']
      if (cliente) {
        acc[cliente] = (acc[cliente] || 0) + 1
      }
      return acc
    }, {})
    
    const triboStats = data.reduce((acc: Record<string, number>, row) => {
      const tribo = row['Tribo']
      if (tribo) {
        const triboStr = tribo.toString()
        acc[triboStr] = (acc[triboStr] || 0) + 1
      }
      return acc
    }, {})
    
    const servicoStats = data.reduce((acc: Record<string, number>, row) => {
      const servico = row['Serviço']
      if (servico) {
        acc[servico] = (acc[servico] || 0) + 1
      }
      return acc
    }, {})
    
    const horasTotal = data.reduce((total: number, row) => {
      const horas = parseFloat(row['Horas']) || 0
      return total + horas
    }, 0)
    
    const valorTotal = data.reduce((total: number, row) => {
      const valor = parseFloat(row['Valor']) || 0
      return total + valor
    }, 0)
    
    // Calcula horas por cliente
    const horasPorCliente = data.reduce((acc: Record<string, number>, row) => {
      const cliente = row['Cliente']
      const horas = parseFloat(row['Horas']) || 0
      if (cliente) {
        acc[cliente] = (acc[cliente] || 0) + horas
      }
      return acc
    }, {})
    
    // Calcula valor por cliente
    const valorPorCliente = data.reduce((acc: Record<string, number>, row) => {
      const cliente = row['Cliente']
      const valor = parseFloat(row['Valor']) || 0
      if (cliente) {
        acc[cliente] = (acc[cliente] || 0) + valor
      }
      return acc
    }, {})
    
    // Calcula eficiência (Apontamentos / Horas)
    const eficiencia = Object.keys(clienteStats).reduce((acc: Record<string, number>, cliente) => {
      const clienteData = data.filter(row => row['Cliente'] === cliente)
      const totalHoras = clienteData.reduce((sum, row) => sum + (parseFloat(row['Horas']) || 0), 0)
      const totalApontamentos = clienteData.reduce((sum, row) => sum + (parseFloat(row['Apontamentos']) || 0), 0)
      
      if (totalHoras > 0) {
        acc[cliente] = totalApontamentos / totalHoras
      } else {
        acc[cliente] = 0
      }
      
      return acc
    }, {})
    
    // Estatísticas de SLA (simuladas ou reais)
    let slaStats;
    if (hasEnrichedData) {
      // Cálculo real com dados enriquecidos
      const slaCount = data.reduce((acc: {atingido: number, violado: number}, row) => {
        if (row['Status_SLA'] === 'Atingido') {
          acc.atingido += 1
        } else if (row['Status_SLA'] === 'Violado') {
          acc.violado += 1
        }
        return acc
      }, {atingido: 0, violado: 0})
      
      const total = slaCount.atingido + slaCount.violado
      const percentual = total > 0 ? (slaCount.atingido / total) * 100 : 0
      
      slaStats = {
        sla_atingido: slaCount.atingido,
        sla_violado: slaCount.violado,
        percentual_atingimento: percentual
      }
    } else {
      // Valores simulados
      slaStats = {
        sla_atingido: 80,
        sla_violado: 20,
        percentual_atingimento: 80
      }
    }
    
    // Lead time (simulado ou real)
    let leadTime;
    if (hasEnrichedData) {
      // Cálculo real com dados enriquecidos
      const leadTimes = data.filter(row => row['Data_Abertura'] && row['Data_Fechamento']).map(row => {
        const abertura = new Date(row['Data_Abertura'])
        const fechamento = new Date(row['Data_Fechamento'])
        return (fechamento.getTime() - abertura.getTime()) / (1000 * 60 * 60) // em horas
      })
      
      const leadTimeMedio = leadTimes.length > 0 ? 
        leadTimes.reduce((sum, lt) => sum + lt, 0) / leadTimes.length : 0
      
      // Lead time por serviço
      const leadTimePorServico = data
        .filter(row => row['Data_Abertura'] && row['Data_Fechamento'] && row['Serviço'])
        .reduce((acc: Record<string, {total: number, count: number}>, row) => {
          const servico = row['Serviço']
          const abertura = new Date(row['Data_Abertura'])
          const fechamento = new Date(row['Data_Fechamento'])
          const leadTime = (fechamento.getTime() - abertura.getTime()) / (1000 * 60 * 60)
          
          if (!acc[servico]) {
            acc[servico] = {total: 0, count: 0}
          }
          
          acc[servico].total += leadTime
          acc[servico].count += 1
          
          return acc
        }, {})
      
      const leadTimePorServicoMedia = Object.keys(leadTimePorServico).reduce((acc: Record<string, number>, servico) => {
        const {total, count} = leadTimePorServico[servico]
        acc[servico] = count > 0 ? total / count : 0
        return acc
      }, {})
      
      leadTime = {
        lead_time_medio: leadTimeMedio,
        lead_time_por_servico: leadTimePorServicoMedia
      }
    } else {
      // Valores simulados
      leadTime = {
        lead_time_medio: 24,
        lead_time_por_servico: {
          'Suporte': 18,
          'Táxi': 12,
          'Portal de negócios': 36,
          'Survey': 24,
          'Sob demanda': 48
        }
      }
    }
    
    // Estatísticas por analista (simuladas ou reais)
    let analistaStats;
    if (hasEnrichedData) {
      // Cálculo real com dados enriquecidos
      const atendimentosPorAnalista = data.reduce((acc: Record<string, number>, row) => {
        const analista = row['Analista']
        if (analista) {
          acc[analista] = (acc[analista] || 0) + 1
        }
        return acc
      }, {})
      
      const slaPorAnalista = data.reduce((acc: Record<string, {atingido: number, violado: number}>, row) => {
        const analista = row['Analista']
        const statusSLA = row['Status_SLA']
        
        if (analista) {
          if (!acc[analista]) {
            acc[analista] = {atingido: 0, violado: 0}
          }
          
          if (statusSLA === 'Atingido') {
            acc[analista].atingido += 1
          } else if (statusSLA === 'Violado') {
            acc[analista].violado += 1
          }
        }
        
        return acc
      }, {})
      
      analistaStats = {
        atendimentos_por_analista: atendimentosPorAnalista,
        sla_por_analista: slaPorAnalista
      }
    } else {
      // Valores simulados
      analistaStats = {
        atendimentos_por_analista: {
          'Analista 1': 5,
          'Analista 2': 3,
          'Analista 3': 2
        },
        sla_por_analista: {
          'Analista 1': {atingido: 4, violado: 1},
          'Analista 2': {atingido: 2, violado: 1},
          'Analista 3': {atingido: 2, violado: 0}
        }
      }
    }
    
    // Todas as estatísticas
    const allStats = {
      basic_stats: {
        total_projetos: data.length,
        total_horas: horasTotal,
        valor_total: valorTotal
      },
      cliente_stats: clienteStats,
      servico_stats: servicoStats,
      tribo_stats: triboStats,
      horas_por_cliente: horasPorCliente,
      valor_por_cliente: valorPorCliente,
      eficiencia: eficiencia,
      sla_stats: slaStats,
      lead_time: leadTime,
      analista_stats: analistaStats,
      has_enriched_data: hasEnrichedData
    }
    
    // Retorna os dados processados
    return res.status(200).json({ 
      message: 'Upload realizado com sucesso',
      data,
      stats: {
        clienteStats,
        triboStats,
        horasTotal,
        valorTotal
      },
      allStats
    })
  } catch (error) {
    console.error('Erro ao processar o arquivo:', error)
    return res.status(500).json({ error: 'Erro ao processar o arquivo.' })
  }
}
