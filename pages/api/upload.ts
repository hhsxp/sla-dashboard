// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { File as FormidableFile } from 'formidable'
import ExcelJS from 'exceljs'

export const config = {
  api: {
    bodyParser: false, // obrigatório para uploads binários
  },
}

interface Ticket {
  Tipo: string
  Chave: string
  Resumo: string
  Projeto: string
  Tribo: string
  UnidadeNegocio: string
  TempoPR: number
  TempoRES: number
  SLA: string
  FlagPR: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ tickets: Ticket[] } | { error: string }>
) {
  try {
    // 1) Parse do multipart/form-data
    const form = new formidable.IncomingForm()
    const [fields, files] = await new Promise<[any, formidable.Files]>(
      (resolve, reject) =>
        form.parse(req, (err, fields, files) =>
          err ? reject(err) : resolve([fields, files])
        )
    )
    // assumindo que o input name="file"
    const file = files.file as FormidableFile
    if (!file.filepath) throw new Error('Arquivo não recebido corretamente.')

    // 2) Abre o Excel
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(file.filepath)

    // 3) Seleciona a aba "Tickets"
    const sheet = workbook.getWorksheet('Tickets')
    if (!sheet) throw new Error('Aba "Tickets" não encontrada.')

    // 4) Itera as linhas, filtrando cabeçalho e filtros de ano/trimestre
    const tickets: Ticket[] = []
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return // pula o cabeçalho
      const first = row.getCell(1).text.trim()
      // pula linhas de filtro:
      if (
        first === '' ||
        first.startsWith('Anos (Atualizado') ||
        first.startsWith('Trimestres (Atualizado')
      ) {
        return
      }

      tickets.push({
        Tipo:           row.getCell(1).text,
        Chave:          row.getCell(2).text,
        Resumo:         row.getCell(3).text,
        Projeto:        row.getCell(4).text,
        Tribo:          row.getCell(5).text,
        UnidadeNegocio: row.getCell(6).text,
        TempoPR:        parseFloat(row.getCell(7).text) || 0,
        TempoRES:       parseFloat(row.getCell(8).text) || 0,
        SLA:            row.getCell(9).text,
        FlagPR:         row.getCell(10).text,
      })
    })

    // 5) Devolve JSON puro pro frontend
    res.status(200).json({ tickets })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Erro interno' })
  }
}
