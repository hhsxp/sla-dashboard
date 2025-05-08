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
    // 1) parse form-data com formidable
    const form = new formidable.IncomingForm()
    const [, files] = (await new Promise<
      [formidable.Fields, formidable.Files]
    >((resolve, reject) =>
      form.parse(req, (err, fields, files) =>
        err ? reject(err) : resolve([fields, files]),
      ),
    )) as [formidable.Fields, formidable.Files]

    const file = files.file as formidable.File
    if (!file.filepath) {
      throw new Error('Arquivo não recebido corretamente.')
    }

    // 2) carrega o workbook
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(file.filepath)

    // 3) faz um mapa a partir da aba "Base" (colunas 1=A … 19=S)
    const baseSheet = workbook.getWorksheet('Base')
    const baseMap = new Map<
      string,
      {
        TempoPR: number
        TempoRES: number
        HorasPR: number
        FlagPR: boolean
        HorasRES: number
        FlagRES: boolean
      }
    >()

    baseSheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return // pula header
      const tipo = row.getCell(1).text.trim()
      const chave = row.getCell(2).text.trim()
      const key = `${tipo}#${chave}`
      const tempoPR = parseFloat(row.getCell(14).value as any) || 0
      const tempoRES = parseFloat(row.getCell(15).value as any) || 0
      const horasPR = parseFloat(row.getCell(16).value as any) || 0
      const flagPR = row.getCell(17).text.toLowerCase() === 'true'
      const horasRES = parseFloat(row.getCell(18).value as any) || 0
      const flagRES = row.getCell(19).text.toLowerCase() === 'true'
      baseMap.set(key, { TempoPR: tempoPR, TempoRES: tempoRES, HorasPR: horasPR, FlagPR: flagPR, HorasRES: horasRES, FlagRES: flagRES })
    })

    // 4) parse da aba "Tickets" e mescla com o mapa acima
    const ticketsSheet = workbook.getWorksheet('Tickets')
    const tickets: Ticket[] = []
    ticketsSheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return // pula header
      const TipoItem = row.getCell(1).text.trim()
      const Chave = row.getCell(2).text.trim()
      const Resumo = row.getCell(3).text.trim()
      const Projeto = row.getCell(4).text.trim()
      const UnidadeNegocio = row.getCell(5).text.trim()
      const Prioridade = row.getCell(8).text.trim()
      const Criado = (row.getCell(9).value as Date)?.toISOString() || ''
      const Atualizado = (row.getCell(10).value as Date)?.toISOString() || ''
      const Resolvido = (row.getCell(11).value as Date)?.toISOString() || ''

      // pega os valores da aba Base
      const key = `${TipoItem}#${Chave}`
      const base = baseMap.get(key) || {
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

    // 5) devolve JSON já com tudo preenchido
    res.status(200).json(tickets)
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
