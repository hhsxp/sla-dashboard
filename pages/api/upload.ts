// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import ExcelJS from 'exceljs'

export const config = {
  api: {
    bodyParser: false,
  },
}

type Ticket = {
  Tipo: string
  Chave: string
  Projeto: string
  Tribo: string
  Prioridade: string
  CriadoEm: string
  AtualizadoEm: string
  Responsavel: string
  TempoPR: number
  TempoRES: number
  SLAh: number
  SLAok: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ tickets: Ticket[] } | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  // 1) Parse do form-data
  const form = new formidable.IncomingForm()
  const { files } = await new Promise<{ files: formidable.Files }>(
    (resolve, reject) =>
      form.parse(req, (err, _fields, files) =>
        err ? reject(err) : resolve({ files })
      )
  )

  // Garante que temos um único arquivo no campo "file"
  const incoming = files.file
  if (!incoming) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' })
  }
  const file = Array.isArray(incoming) ? incoming[0] : incoming

  // 2) Normaliza o caminho no FS (formidable v1: .path  •  v2+: .filepath)
  const localPath = (file as any).filepath ?? (file as any).path
  if (typeof localPath !== 'string') {
    return res
      .status(400)
      .json({ error: 'Não foi possível obter o caminho do arquivo' })
  }

  try {
    // 3) Lê o Excel
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(localPath)

    // 4) Seleciona a aba "Tickets"
    const sheet = workbook.getWorksheet('Tickets')
    if (!sheet) {
      return res.status(400).json({ error: 'Aba "Tickets" não encontrada' })
    }

    // 5) Monta o array de tickets
    const tickets: Ticket[] = []
    sheet.eachRow((row: any, rowNumber: number) => {
      if (rowNumber === 1) return // pula cabeçalho

      // extrai cada célula como texto
      const Tipo        = row.getCell(1).text.trim()
      const Chave       = row.getCell(2).text.trim()
      const Projeto     = row.getCell(3).text.trim()
      const Tribo       = row.getCell(4).text.trim()
      const Prioridade  = row.getCell(5).text.trim()
      const CriadoEm    = row.getCell(6).text.trim()
      const AtualizadoEm= row.getCell(7).text.trim()
      const Responsavel = row.getCell(8).text.trim()

      const TempoPR   = Number(row.getCell(9).value)  || 0
      const TempoRES  = Number(row.getCell(10).value) || 0
      const SLAh      = Number(row.getCell(11).value) || 0

      // interpreta "true"/"sim"/"yes" como true
      const okTxt     = row.getCell(12).text.trim().toLowerCase()
      const SLAok     = ['true','sim','yes'].includes(okTxt)

      tickets.push({
        Tipo,
        Chave,
        Projeto,
        Tribo,
        Prioridade,
        CriadoEm,
        AtualizadoEm,
        Responsavel,
        TempoPR,
        TempoRES,
        SLAh,
        SLAok,
      })
    })

    return res.status(200).json({ tickets })
  } catch (e: any) {
    console.error('Erro ao processar Excel:', e)
    return res.status(500).json({ error: 'Erro interno no servidor' })
  }
}
