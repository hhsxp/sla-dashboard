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

  // 1) Parse multipart/form-data e extrai o arquivo
  const file = await new Promise<formidable.File>((resolve, reject) => {
    const form = new formidable.IncomingForm()
    form.parse(req, (_err, _fields, files) => {
      const f = files.file
      if (!f) return reject(new Error('Arquivo não enviado'))
      resolve(Array.isArray(f) ? f[0] : (f as formidable.File))
    })
  })

  // 2) Lê o Excel (usando cast a any para filepath)
  const workbook = new ExcelJS.Workbook()
  const tmpPath = (file as any).filepath
  await workbook.xlsx.readFile(tmpPath)

  // 3) Parse da aba "Tickets"
  const ticketsSheet = workbook.getWorksheet('Tickets')
  const tickets: any[] = []
  ticketsSheet.eachRow((row: any, rowNumber: number) => {
    if (rowNumber === 1) return
    tickets.push({
      Tipo:           row.getCell(1).value,
      Chave:          row.getCell(2).value,
      Resumo:         row.getCell(3).value,
      Projeto:        row.getCell(4).value,
      Unidade:        row.getCell(5).value,
      Status:         row.getCell(6).value,
      Relator:        row.getCell(7).value,
      Prioridade:     row.getCell(8).value,
      Atualizado:     row.getCell(9).value,
      Criado:         row.getCell(10).value,
      Responsavel:    row.getCell(11).value,
      Tempo1aResp:    row.getCell(12).value,
      TempoResolucao: row.getCell(13).value,
      SLA_Horas:      row.getCell(14).value,
      CumpriuPR:      row.getCell(15).value,
    })
  })

  // 4) Parse da aba "Base"
  const baseSheet = workbook.getWorksheet('Base')
  const baseData: any[] = []
  baseSheet.eachRow((row: any, rowNumber: number) => {
    if (rowNumber === 1) return
    baseData.push({
      Chave:     row.getCell(2).value,
      Horas_PR:  row.getCell(6).value,
      Flag_PR:   row.getCell(7).value,
      Horas_RES: row.getCell(8).value,
      Flag_RES:  row.getCell(9).value,
    })
  })

  // 5) Merge de Tickets e Base
  const allData = tickets.map(t => ({
    ...t,
    ...(baseData.find(b => b.Chave === t.Chave) || {})
  }))

  // 6) Retorna JSON
  return res.status(200).json({ count: allData.length, data: allData })
}
