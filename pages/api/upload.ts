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
  TipoItem: string
  Chave: string
  Resumo: string
  Projeto: string
  UnidadeNegocio: string
  Prioridade: string
  Criado: string
  Atualizado: string
  Resolvido: string
  TempoPR: number
  TempoRES: number
  HorasPR: number
  FlagPR: boolean
  HorasRES: number
  FlagRES: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Ticket[] | { error: string }>,
) {
  try {
    // 1) Parse multipart/form-data
    const form = new formidable.IncomingForm()
    const [, fieldsFiles] = await new Promise<
      [formidable.Fields, formidable.Files]
    >((resolve, reject) =>
      form.parse(req, (err, fields, files) =>
        err ? reject(err) : resolve([fields, files]),
      ),
    )
    const files = fieldsFiles as formidable.Files
    const file = files.file as formidable.File

    // Em v2 do formidable a prop pode vir como "filepath" ou "path" dependendo da versão:
    const tempPath = (file as any).filepath ?? (file as any).path
    if (!tempPath) {
      throw new Error('Não foi possível ler o arquivo enviado.')
    }

    // 2) Leitura do Excel
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(tempPath)

    // 3) Monta um mapa a partir da aba "Base"
    const baseSheet = workbook.getWorksheet('Base')
    const baseMap = new Map<string, {
      TempoPR: number
      TempoRES: number
      HorasPR: number
      FlagPR: boolean
      HorasRES: number
      FlagRES: boolean
    }>()

    baseSheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return
      const tipo = row.getCell(1).text.trim()
      const chave = row.getCell(2).text.trim()
      const key = `${tipo}#${chave}`
      const TempoPR = parseFloat(row.getCell(14).text) || 0
      const TempoRES = parseFloat(row.getCell(15).text) || 0
      const HorasPR = parseFloat(row.getCell(16).text) || 0
      const FlagPR = row.getCell(17).text.toLowerCase() === 'true'
      const HorasRES = parseFloat(row.getCell(18).text) || 0
      const FlagRES = row.getCell(19).text.toLowerCase() === 'true'
      baseMap.set(key, { TempoPR, TempoRES, HorasPR, FlagPR, HorasRES, FlagRES })
    })

    // 4) Faz a aba "Tickets" e cruza com o mapa acima
    const ticketsSheet = workbook.getWorksheet('Tickets')
    const tickets: Ticket[] = []

    ticketsSheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return
      const TipoItem = row.getCell(1).text.trim()
      const Chave = row.getCell(2).text.trim()
      const Resumo = row.getCell(3).text.trim()
      const Projeto = row.getCell(4).text.trim()
      const UnidadeNegocio = row.getCell(5).text.trim()
      const Prioridade = row.getCell(8).text.trim()
      const Criado = (row.getCell(9).value as Date)?.toISOString() || ''
      const Atualizado = (row.getCell(10).value as Date)?.toISOString() || ''
      const Resolvido = (row.getCell(11).value as Date)?.toISOString() || ''

      const mapKey = `${TipoItem}#${Chave}`
      const base = baseMap.get(mapKey) || {
        TempoPR: 0,
        TempoRES: 0,
        HorasPR: 0,
        FlagPR: false,
        HorasRES: 0,
        FlagRES: false,
      }

      tickets.push({
        TipoItem,
        Chave,
        Resumo,
        Projeto,
        UnidadeNegocio,
        Prioridade,
        Criado,
        Atualizado,
        Resolvido,
        TempoPR: base.TempoPR,
        TempoRES: base.TempoRES,
        HorasPR: base.HorasPR,
        FlagPR: base.FlagPR,
        HorasRES: base.HorasRES,
        FlagRES: base.FlagRES,
      })
    })

    // 5) Retorna o JSON pronto
    res.status(200).json(tickets)
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
