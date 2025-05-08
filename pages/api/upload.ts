// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { File as FormidableFile } from 'formidable'
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

  // 1) Parse do multipart/form-data e extrai diretamente o FormidableFile
  const file: FormidableFile = await new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm()
    form.parse(req, (err, _fields, files) => {
      if (err) return reject(err)
      const f = files.file
      // f pode ser um array ou um único file
      if (Array.isArray(f)) {
        resolve(f[0])
      } else {
        resolve(f as FormidableFile)
      }
    })
  })

  // 2) Lê o Excel a partir do caminho temporário no servidor
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(file.filepath)

  // 3) Parse da aba "Tickets"
  const ticketsSheet = workbook.getWorksheet('Tickets')
  const tickets: any[] = []
  ticketsSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return // pula header
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

  // 4) Parse da aba "Base" (ou outra)
  const baseSheet = workbook.getWorksheet('Base')
  const baseData: any[] = []
  baseSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    baseData.push({
      Chave:    row.getCell(2).value,
      Horas_PR: row.getCell(6).value,
      Flag_PR:  row.getCell(7).value,
      Horas_RES: row.getCell(8).value,
      Flag_RES:  row.getCell(9).value,
    })
  })

  // 5) Merge dos dois arrays
  const allData = tickets.map(t => ({
    ...t,
    ...(baseData.find(b => b.Chave === t.Chave) || {})
  }))

  // 6) Retorna o JSON
  return res.status(200).json({ count: allData.length, data: allData })
}
