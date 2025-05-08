// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { File as FormidableFile } from 'formidable'
import ExcelJS from 'exceljs'

export const config = {
  api: {
    bodyParser: false,
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
    // 1) parse multipart
    const form = new formidable.IncomingForm()
    const [fields, files] = await new Promise<[any, formidable.Files]>(
      (resolve, reject) =>
        form.parse(req, (err, f, fs) => (err ? reject(err) : resolve([f, fs])))
    )

    // 2) pega o arquivo
    const file = files.file as FormidableFile
    // tenta filepath, senão cai em path
    const filePath =
      (file as any).filepath ??
      (file as any).filePath ??
      (file as any).path
    if (!filePath) throw new Error('Arquivo não encontrado no upload.')

    // 3) lê o Excel
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(filePath)

    // 4) worksheet "Tickets"
    const sheet = workbook.getWorksheet('Tickets')
    if (!sheet) throw new Error('Aba "Tickets" não encontrada.')

    // 5) itera linhas filtrando cabeçalho e filtros de ano/trimestre
    const tickets: Ticket[] = []
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return
      const first = row.getCell(1).text.trim()
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

    return res.status(200).json({ tickets })
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'Erro interno' })
  }
}
