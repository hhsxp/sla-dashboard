// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import ExcelJS from 'exceljs'

export const config = {
  api: {
    bodyParser: false,
  },
}

interface Ticket {
  TipoItem: string
  Chave: string
  Resumo: string
  Prioridade: string
  Criado: string
  Atualizado: string
  Resolvido: string
}

interface BaseInfo {
  UnidadeNegocio: string
  Tribo: string
  SLA_Horas: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    // 1) Parse multipart/form-data
    const form = new formidable.IncomingForm()
    const [fields, files] = await new Promise<
      [formidable.Fields, formidable.Files]
    >((resolve, reject) =>
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err)
        resolve([fields, files])
      })
    )

    // 2) Recupera o arquivo enviado (<input name="file" />)
    const anyFile = (files.file as any)
    // tenta filepath (formidable v3+), filePath (v2) ou path (v1)
    const filepath = anyFile.filepath ?? anyFile.filePath ?? anyFile.path
    if (!filepath) {
      throw new Error('Arquivo não foi recebido corretamente.')
    }

    // 3) Lê o Excel
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(filepath)

    // 4) Monta um map a partir da aba "Base"
    const baseSheet = workbook.getWorksheet('Base')
    const baseMap: Record<string, BaseInfo> = {}
    baseSheet.eachRow((row: any, rowNum: number) => {
      if (rowNum === 1) return // pula cabeçalho
      const chave = row.getCell(2).text.trim()       // coluna B
      const unidade = row.getCell(3).text.trim()     // coluna C
      const tribo = row.getCell(4).text.trim()       // coluna D
      const sla = parseFloat(row.getCell(5).text)    // coluna E
      baseMap[chave] = {
        UnidadeNegocio: unidade,
        Tribo:           tribo,
        SLA_Horas:       isNaN(sla) ? 0 : sla,
      }
    })

    // 5) Lê a aba "Tickets" e cruza com o baseMap
    const ticketsSheet = workbook.getWorksheet('Tickets')
    const merged: Array<Ticket & BaseInfo> = []
    ticketsSheet.eachRow((row: any, rowNum: number) => {
      if (rowNum === 1) return
      const ticket: Ticket = {
        TipoItem:   row.getCell(1).text,
        Chave:      row.getCell(2).text,
        Resumo:     row.getCell(3).text,
        Prioridade: row.getCell(4).text,
        Criado:     row.getCell(5).text,
        Atualizado: row.getCell(6).text,
        Resolvido:  row.getCell(7).text,
      }
      const info = baseMap[ticket.Chave] ?? {
        UnidadeNegocio: '—',
        Tribo:           '—',
        SLA_Horas:       0,
      }
      merged.push({ ...ticket, ...info })
    })

    // 6) Retorna tudo em JSON
    return res.status(200).json(merged)

  } catch (err: any) {
    console.error('upload.ts error:', err)
    return res.status(500).json({ error: err.message })
  }
}
