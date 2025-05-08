// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { File as FormidableFile, Files, Fields } from 'formidable'
import ExcelJS from 'exceljs'
import { promisify } from 'util'

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) Parse multipart/form-data
  const form = new formidable.IncomingForm()
  const parseForm = promisify(form.parse.bind(form))
  // form.parse retorna (err, fields, files) => promisify vira Promise<[fields, files]>
  const [, files] = (await parseForm(req)) as [Fields, Files]
  const file = files.file as FormidableFile

  // 2) Lê o Excel que o user enviou
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(file.filepath)

  // 3) Extrai a aba "Tickets"
  const sheet = workbook.getWorksheet('Tickets')
  const tickets: Ticket[] = []

  // Helper para garantir texto limpo (RichText, hyperlinks, etc)
  const cellText = (cell: ExcelJS.Cell) => {
    if (cell.value == null) return ''
    if (cell.type === ExcelJS.ValueType.RichText)
      return cell.value.richText.map(r => r.text).join('')
    if (cell.type === ExcelJS.ValueType.Hyperlink)
      return cell.value.text
    return String(cell.value)
  }

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return // pula cabeçalho

    const tipo      = cellText(row.getCell(1))
    const chave     = cellText(row.getCell(2))
    const projeto   = cellText(row.getCell(3))
    const prioridade= cellText(row.getCell(4))

    const horasRes = Number(row.getCell(5).value) || 0
    const slaH     = Number(row.getCell(6).value) || 0
    const slaOk    = cellText(row.getCell(7)).toLowerCase() === 'true'

    // Datas podem vir como Date ou texto
    const criadoRaw   = row.getCell(8).value
    const criado      = criadoRaw instanceof Date
      ? criadoRaw.toISOString()
      : String(criadoRaw || '')

    const atualizadoRaw = row.getCell(9).value
    const atualizado    = atualizadoRaw instanceof Date
      ? atualizadoRaw.toISOString()
      : String(atualizadoRaw || '')

    const responsavel = cellText(row.getCell(10))

    tickets.push({
      Tipo: tipo,
      Chave: chave,
      Projeto: projeto,
      Prioridade: prioridade,
      'Horas Res.': horasRes,
      'SLA (h)': slaH,
      'SLA OK?': slaOk,
      Criado: criado,
      Atualizado: atualizado,
      Responsavel: responsavel,
    })
  })

  // 4) Retorna o array de tickets como JSON
  return res.status(200).json(tickets)
}
