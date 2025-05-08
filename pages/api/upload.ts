// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { File as FormidableFile, Files } from 'formidable'
import ExcelJS from 'exceljs'

/**
 * Desativa o bodyParser padrão do Next.js
 * para podermos usar o formidable
 */
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

  // 1) Parse do form-data com formidable
  const form = new formidable.IncomingForm()
  const { files } = (await new Promise<{ files: Files }>(
    (resolve, reject) =>
      form.parse(req, (err, _fields, files) =>
        err ? reject(err) : resolve({ files })
      )
  )) as { files: Files }

  // A chave "file" deve corresponder ao name do input no front-end
  const file = files.file as FormidableFile
  if (!file) {
    return res.status(400).json({ error: 'Arquivo não enviado' })
  }

  try {
    // 2) Lê o Excel com ExcelJS
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(file.filepath!)

    // 3) Seleciona a aba "Tickets"
    const sheet = workbook.getWorksheet('Tickets')
    if (!sheet) {
      return res.status(400).json({ error: 'Aba "Tickets" não encontrada' })
    }

    // 4) Para cada linha (pulando o cabeçalho) monta um objeto Ticket
    const tickets: Ticket[] = []
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return // pula cabeçalho

      // usa `.text` para extrair o valor já em string
      const Tipo       = row.getCell(1).text.trim()
      const Chave      = row.getCell(2).text.trim()
      const Projeto    = row.getCell(3).text.trim()
      const Tribo      = row.getCell(4).text.trim()
      const Prioridade = row.getCell(5).text.trim()

      // datas vêm no formato ISO ou data do Excel
      const CriadoEm   = row.getCell(6).text.trim()
      const AtualizadoEm = row.getCell(7).text.trim()

      const Responsavel = row.getCell(8).text.trim()

      // números: usa `value` que já é número ou string
      const TempoPR   = Number(row.getCell(9).value) || 0
      const TempoRES  = Number(row.getCell(10).value) || 0
      const SLAh      = Number(row.getCell(11).value) || 0

      // booleano: qualquer texto "true"/"yes"/"sim" vira true
      const okCell    = row.getCell(12).text.trim().toLowerCase()
      const SLAok     = okCell === 'true' || okCell === 'sim' || okCell === 'yes'

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

    // 5) Retorna o JSON dos tickets
    return res.status(200).json({ tickets })
  } catch (e: any) {
    console.error('Erro ao ler Excel:', e)
    return res.status(500).json({ error: 'Erro interno ao processar planilha' })
  }
}
