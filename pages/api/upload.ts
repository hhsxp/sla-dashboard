// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import ExcelJS from 'exceljs'

export const config = {
  api: { bodyParser: false }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1) Parse do form-data (arquivo Excel)
    const form = new formidable.IncomingForm()
    const { files } = await new Promise<{ files: any }>((resolve, reject) => {
      form.parse(req, (err, _fields, files) =>
        err ? reject(err) : resolve({ files })
      )
    })
    const file = files.file
    // Compatibiliza v2/v3 de formidable
    const path = file.filepath || file.filePath || file.path
    if (!path) {
      return res.status(400).json({ error: 'Arquivo não recebido corretamente.' })
    }

    // 2) Carrega o workbook
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(path)

    // 3) Parse da aba "Base" e mapeia por Chave (coluna B)
    const baseSheet = workbook.getWorksheet('Base')
    const baseMap = new Map<string, {
      Projeto: string
      UnidadeNegocio: string
      Prioridade: string
      HorasPR: number
      FlagPR: boolean
      HorasRES: number
      FlagRES: boolean
    }>()
    baseSheet.eachRow((row: any, rowNumber: number) => {
      if (rowNumber === 1) return // pula header
      const chave = (row.getCell(2).text || '').trim()    // B = Chave
      baseMap.set(chave, {
        Projeto:       row.getCell(4).text,               // D = Projeto
        UnidadeNegocio:row.getCell(5).text,               // E = Unidade de Negócio
        Prioridade:    row.getCell(8).text,               // H = Prioridade
        HorasPR:       Number(row.getCell(16).value)  || 0, // P = Horas_PR
        FlagPR:        row.getCell(17).value === true,      // Q = Flag_PR
        HorasRES:      Number(row.getCell(18).value)  || 0, // R = Horas_RES
        FlagRES:       row.getCell(19).value === true       // S = Flag_RES
      })
    })

    // 4) Parse da aba "Tickets" e junta com os dados da Base
    const ticketsSheet = workbook.getWorksheet('Tickets')
    const data: any[] = []
    ticketsSheet.eachRow((row: any, rowNumber: number) => {
      if (rowNumber === 1) return // pula header
      const chave = (row.getCell(2).text || '').trim() // B = Chave
      const fromBase = baseMap.get(chave)
      data.push({
        TipoItem:       row.getCell(1).text,              // A = Tipo de item
        Chave:          chave,
        Resumo:         row.getCell(3).text,              // C = Resumo
        Projeto:        row.getCell(4).text,              // D = Projeto
        UnidadeNegocio: row.getCell(5).text,              // E = Unidade de Negócio
        Prioridade:     row.getCell(8).text,              // H = Prioridade
        Criado:         row.getCell(9).value,             // I = Criado
        Atualizado:     row.getCell(10).value,            // J = Atualizado(a)
        Resolvido:      row.getCell(11).value,            // K = Resolvido
        TempoPR:        Number(row.getCell(14).value) || 0, // N = Tempo até a primeira resposta
        TempoRES:       Number(row.getCell(15).value) || 0, // O = Tempo de resolução
        // campos vindos da Base (caso exista)
        HorasPR:        fromBase?.HorasPR,
        FlagPR:         fromBase?.FlagPR,
        HorasRES:       fromBase?.HorasRES,
        FlagRES:        fromBase?.FlagRES
      })
    })

    // 5) Retorna JSON com tudo pronto para o front-end
    res.status(200).json({ data })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
