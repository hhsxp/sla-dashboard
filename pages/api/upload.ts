// pages/api/upload.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import ExcelJS from 'exceljs'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  // 1) Parse do form-data
  const form = new formidable.IncomingForm()
  const { files } = await new Promise<any>((resolve, reject) =>
    form.parse(req, (err, _fields, files) =>
      err ? reject(err) : resolve({ files })
    )
  )

  // 2) Carrega o workbook
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile((files.file as any).filepath)

  // 3) Parse da aba "Tickets"
  const ticketsSheet = workbook.getWorksheet('Tickets')
  const tickets: any[] = []
  ticketsSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return // pula cabeçalho
    const tipo         = row.getCell(1).value
    const chave        = row.getCell(2).value
    const resumo       = row.getCell(3).value
    const projeto      = row.getCell(4).value
    const unidade      = row.getCell(5).value
    const status       = row.getCell(6).value
    const relator      = row.getCell(7).value
    const prioridade   = row.getCell(8).value
    const atualizado   = row.getCell(9).value
    const criado       = row.getCell(10).value
    const responsavel  = row.getCell(11).value
    const tempoPR      = row.getCell(12).value
    const tempoRES     = row.getCell(13).value
    const sla          = row.getCell(14).value
    const flagPR       = row.getCell(15).value

    tickets.push({
      Tipo: String(tipo),
      Chave: String(chave),
      Resumo: String(resumo),
      Projeto: String(projeto),
      Unidade: String(unidade),
      Status: String(status),
      Relator: String(relator),
      Prioridade: String(prioridade),
      Criado: criado instanceof Date ? criado.toISOString() : null,
      Atualizado: atualizado instanceof Date ? atualizado.toISOString() : null,
      Responsavel: String(responsavel),
      Tempo1aResp: Number(tempoPR) || 0,
      TempoResolucao: Number(tempoRES) || 0,
      SLA_Horas: Number(sla) || 0,
      CumpriuPR: String(flagPR).toLowerCase() === 'atingido',
    })
  })

  // 4) Parse da aba "Base"
  const baseSheet = workbook.getWorksheet('Base')
  const base: any[] = []
  baseSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const tipo      = row.getCell(1).value
    const chave     = row.getCell(2).value
    const resumo    = row.getCell(3).value
    const projeto   = row.getCell(4).value
    const unidade   = row.getCell(5).value
    const horasPR   = row.getCell(6).value
    const flagPR    = row.getCell(7).value
    const horasRES  = row.getCell(8).value
    const flagRES   = row.getCell(9).value

    base.push({
      Tipo: String(tipo),
      Chave: String(chave),
      Resumo: String(resumo),
      Projeto: String(projeto),
      Unidade: String(unidade),
      Horas_PR: Number(horasPR) || 0,
      Flag_PR: String(flagPR),
      Horas_RES: Number(horasRES) || 0,
      Flag_RES: String(flagRES),
    })
  })

  // 5) Merge das duas fontes
  const allData = tickets.map(t => ({
    ...t,
    ...(base.find(b => b.Chave === t.Chave) || {}),
  }))

  // 6) Aqui você persiste `allData` (ex: localforage, Supabase, etc)
  //    Exemplo client-side:
  //    await localforage.setItem(`v${Date.now()}`, allData)

  return res.status(200).json({ count: allData.length })
}
