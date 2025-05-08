// pages/api/upload.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { File as FormidableFile, Fields, Files } from 'formidable'
import ExcelJS from 'exceljs'

export const config = {
  api: { bodyParser: false },
}

type Ticket = {
  Tipo: string
  Chave: string
  Projeto: string
  Prioridade: string
  'Horas Res.': number
  'SLA (h)': number
  'SLA OK?': boolean
  Criado: string
  Atualizado: string
  Responsavel: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Ticket[] | { error: string }>
) {
  try {
    // 1) Parse multipart/form-data
    const form = new formidable.IncomingForm()
    const { files } = await new Promise<{ fields: Fields; files: Files }>(
      (resolve, reject) => {
        form.parse(req, (err, _fields, files) =>
          err ? reject(err) : resolve({ fields: _fields, files })
        )
      }
    )

    // 2) Recupera o arquivo enviado (input name="file")
    const uploaded = files.file as FormidableFile
    if (!uploaded || Array.isArray(uploaded)) {
      return res.status(400).json({ error: 'Nenhum arquivo encontrado em `file`' })
    }

    // 3) Lê o Excel do caminho temporário
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile((uploaded as any).filepath)

    // 4) Extrai a aba "Tickets"
    const sheet = workbook.getWorksheet('Tickets')
    if (!sheet) {
      return res.status(400).json({ error: 'Aba "Tickets" não encontrada.' })
    }

    // Helper para extrair texto de qualquer cell
    const cellText = (cell: any) => {
      if (cell.value == null) return ''
      if (cell.type === ExcelJS.ValueType.RichText)
        return cell.value.richText.map((r: any) => r.text).join('')
      if (cell.type === ExcelJS.ValueType.Hyperlink)
        return cell.value.text
      return String(cell.value)
    }

    // Helper para converter datas em ISO-string
    const toIso = (v: any) =>
      v instanceof Date ? v.toISOString() : String(v || '')

    // 5) Monta o array de tickets
    const tickets: Ticket[] = []
    sheet.eachRow((row: any, idx: number) => {
      if (idx === 1) return // pula cabeçalho

      const Tipo        = cellText(row.getCell(1))
      const Chave       = cellText(row.getCell(2))
      const Projeto     = cellText(row.getCell(3))
      const Prioridade  = cellText(row.getCell(4))
      const HorasRes    = Number(row.getCell(5).value) || 0
      const SLA         = Number(row.getCell(6).value) || 0
      const SLAOK       = cellText(row.getCell(7)).toLowerCase() === 'true'
      const Criado      = toIso(row.getCell(8).value)
      const Atualizado  = toIso(row.getCell(9).value)
      const Responsavel = cellText(row.getCell(10))

      tickets.push({
        Tipo,
        Chave,
        Projeto,
        Prioridade,
        'Horas Res.': HorasRes,
        'SLA (h)': SLA,
        'SLA OK?': SLAOK,
        Criado,
        Atualizado,
        Responsavel,
      })
    })

    // 6) Retorna o JSON
    return res.status(200).json(tickets)
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'Erro interno' })
  }
}
