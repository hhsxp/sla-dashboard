// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import ExcelJS from 'exceljs'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  // 1) Parse do form-data
  const form = new formidable.IncomingForm()
  const { files } = await new Promise<{ files: formidable.Files }>((resolve, reject) =>
    form.parse(req, (err, _fields, files) =>
      err ? reject(err) : resolve({ files })
    )
  )

  // 2) Carrega o workbook
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile((files.file as formidable.File).filepath)

  // 3) Parse da aba "Tickets"
  const ticketsSheet = workbook.getWorksheet('Tickets')
  const tickets: Array<{
    Tipo: string
    Chave: string
    Resumo: string
    Projeto: string
    Unidade: string
    Status: string
    Relator: string
    Prioridade: string
    Criado: string | null
    Atualizado: string | null
    Responsavel: string
    Tempo1aResp: number
    TempoResolucao: number
    SLA_Horas: number
    CumpriuPR: boolean
  }> = []

  ticketsSheet.eachRow((row: ExcelJS.Row, rowNumber: number) => {
    if (rowNumber === 1) return // pula cabeçalho
    tickets.push({
      Tipo:           String(row.getCell(1).value || ''),
      Chave:          String(row.getCell(2).value || ''),
      Resumo:         String(row.getCell(3).value || ''),
      Projeto:        String(row.getCell(4).value || ''),
      Unidade:        String(row.getCell(5).value || ''),
      Status:         String(row.getCell(6).value || ''),
      Relator:        String(row.getCell(7).value || ''),
      Prioridade:     String(row.getCell(8).value || ''),
      Atualizado:     (row.getCell(9).value instanceof Date ? (row.getCell(9).value as Date).toISOString() : null),
      Criado:         (row.getCell(10).value instanceof Date ? (row.getCell(10).value as Date).toISOString() : null),
      Responsavel:    String(row.getCell(11).value || ''),
      Tempo1aResp:    Number(row.getCell(12).value) || 0,
      TempoResolucao: Number(row.getCell(13).value) || 0,
      SLA_Horas:      Number(row.getCell(14).value) || 0,
      CumpriuPR:      String(row.getCell(15).value || '').toLowerCase() === 'atingido',
    })
  })

  // 4) Parse da aba "Base"
  const baseSheet = workbook.getWorksheet('Base')
  const baseData: Array<{
    Chave: string
    Horas_PR: number
    Flag_PR: string
    Horas_RES: number
    Flag_RES: string
  }> = []

  baseSheet.eachRow((row: ExcelJS.Row, rowNumber: number) => {
    if (rowNumber === 1) return
    baseData.push({
      Chave:    String(row.getCell(2).value || ''),
      Horas_PR: Number(row.getCell(6).value) || 0,
      Flag_PR:  String(row.getCell(7).value || ''),
      Horas_RES: Number(row.getCell(8).value) || 0,
      Flag_RES:  String(row.getCell(9).value || ''),
    })
  })

  // 5) Merge das duas fontes
  const allData = tickets.map(t => ({
    ...t,
    ...(baseData.find(b => b.Chave === t.Chave) || {}),
  }))

  // 6) Retorna o total de registros processados
  return res.status(200).json({ count: allData.length, data: allData })
}
