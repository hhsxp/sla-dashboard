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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // 1) Parse multipart/form-data
    const form = new formidable.IncomingForm()
    const [fields, files] = await new Promise<[any, formidable.Files]>(
      (resolve, reject) =>
        form.parse(req, (err, fields, files) =>
          err ? reject(err) : resolve([fields, files])
        )
    )

    // 2) Obtém o arquivo do campo "file"
    const incoming = files.file
    if (!incoming) throw new Error('Nenhum arquivo enviado')
    const file = Array.isArray(incoming) ? incoming[0] : incoming

    // 3) Normaliza caminho (formidable v1: .path, v2+: .filepath)
    const filePath =
      (file as any).filepath ?? (file as any).path
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Não foi possível obter o caminho do arquivo')
    }

    // 4) Lê o Excel
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(filePath)

    // 5) Seleciona a aba "Tickets"
    const sheet = workbook.getWorksheet('Tickets')
    if (!sheet) {
      throw new Error('Aba "Tickets" não encontrada')
    }

    // 6) Itera as linhas, pulando cabeçalho e filtros de ano/trimestre
    const tickets: Ticket[] = []
    sheet.eachRow((row: any, rowNumber: number) => {
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

    // 7) Retorna o JSON com tickets
    return res.status(200).json({ tickets })
  } catch (err: any) {
    console.error('Upload API error:', err)
    return res.status(500).json({ error: err.message || 'Erro interno' })
  }
}
