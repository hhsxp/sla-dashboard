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

export default async function handler(req: NextApiRequest, res: NextApiResponse<Ticket[] | { error: string }>) {
  try {
    // 1) Parse multipart/form-data manualmente para obter fields e files
    const form = new formidable.IncomingForm()
    const { fields, files } = await new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        else resolve({ fields, files })
      })
    })

    // 2) Recupera o arquivo enviado (input name="file")
    const uploaded = files.file as FormidableFile
    if (!uploaded || Array.isArray(uploaded)) {
      return res.status(400).json({ error: 'Nenhum arquivo encontrado em `file`' })
    }

    // 3) Lê o Excel
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(uploaded.filepath)

    // 4) Extrai planilha "Tickets"
    const sheet = workbook.getWorksheet('Tickets')
    if (!sheet) {
      return res.status(400).json({ error: 'Aba "Tickets" não encontrada na planilha.' })
    }

    // Função auxiliar para textos
    const cellText = (cell: ExcelJS.Cell) => {
      if (cell.value == null) return ''
      if (cell.type === ExcelJS.ValueType.RichText)
        return cell.value.richText.map(r => r.text).join('')
      if (cell.type === ExcelJS.ValueType.Hyperlink)
        return cell.value.text
      return String(cell.value)
    }

    // 5) Monta array de tickets
    const tickets: Ticket[] = []
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return // pula cabeçalho

      const Tipo       = cellText(row.getCell(1))
      const Chave      = cellText(row.getCell(2))
      const Projeto    = cellText(row.getCell(3))
      const Prioridade = cellText(row.getCell(4))

      const HorasResNum = Number(row.getCell(5).value) || 0
      const SLANum      = Number(row.getCell(6).value) || 0
      const SLAOK       = cellText(row.getCell(7)).toLowerCase() === 'true'

      const toIso = (v: ExcelJS.CellValue) =>
        v instanceof Date ? v.toISOString() : String(v || '')

      const Criado    = toIso(row.getCell(8).value)
      const Atualizado= toIso(row.getCell(9).value)
      const Responsavel = cellText(row.getCell(10))

      tickets.push({
        Tipo,
        Chave,
        Projeto,
        Prioridade,
        'Horas Res.': HorasResNum,
        'SLA (h)': SLANum,
        'SLA OK?': SLAOK,
        Criado,
        Atualizado,
        Responsavel,
      })
    })

    // 6) Envia array de tickets como JSON
    return res.status(200).json(tickets)
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'Erro interno' })
  }
}
