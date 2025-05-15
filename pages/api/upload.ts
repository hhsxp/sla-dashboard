// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { File as FormidableFile } from 'formidable'
import ExcelJS from 'exceljs'

// Desabilita o parser de body padrão do Next
export const config = {
  api: { bodyParser: false }
}

type ApiResponse = {
  message?: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  // 1) Prepara o Formidable para ler multipart/form-data
  const form = new formidable.IncomingForm()

  const parse = () =>
    new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) =>
          err ? reject(err) : resolve({ fields, files })
        )
      }
    )

  try {
    // 2) Parseia form e pega o arquivo
    const { files } = await parse()
    const file = files.file as FormidableFile

    if (!file?.filepath) {
      throw new Error('Arquivo não recebido corretamente.')
    }

    // 3) Abre o workbook com ExcelJS
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(file.filepath)

    // 4) Pega as duas sheets: "Tickets" e "Base"
    const ticketsSheet = workbook.getWorksheet('Tickets')
    const baseSheet    = workbook.getWorksheet('Base')

    if (!ticketsSheet || !baseSheet) {
      throw new Error('Não encontrei abas "Tickets" ou "Base" no Excel.')
    }

    // 5) Mapeia a aba "Base" para cruzamento
    type BaseInfo = { Unidade: string; Projeto: string; TipoItem: string }
    const baseMap: Record<string, BaseInfo> = {}
    baseSheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return // pula header
      const chave       = String(row.getCell(2).text).trim() // coluna B
      const unidade     = String(row.getCell(3).text).trim() // coluna C
      const projeto     = String(row.getCell(4).text).trim() // coluna D
      const tipoItem    = String(row.getCell(5).text).trim() // coluna E
      baseMap[chave] = { Unidade: unidade, Projeto: projeto, TipoItem: tipoItem }
    })

    // 6) Extrai tickets e já cruza com baseMap
    type Ticket = {
      Chave: string
      ResolvedAt: string
      CreatedAt: string
      Unidade: string
      Projeto: string
      TipoItem: string
      Prioridade: string
    }
    const tickets: Ticket[] = []
    ticketsSheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return // pula header
      const chave      = String(row.getCell(2).text).trim() // coluna B
      const criado     = String(row.getCell(9).text).trim() // coluna I
      const resolvido  = String(row.getCell(10).text).trim()// coluna J
      const prioridade = String(row.getCell(8).text).trim() // coluna H

      const info = baseMap[chave] || {
        Unidade: '–',
        Projeto: '–',
        TipoItem: '–'
      }

      tickets.push({
        Chave: chave,
        CreatedAt: criado,
        ResolvedAt: resolvido,
        Prioridade: prioridade,
        Unidade: info.Unidade,
        Projeto: info.Projeto,
        TipoItem: info.TipoItem
      })
    })

    // TODO: A partir daqui você faz os cálculos de SLA, agregações etc.

    // 7) Retorna sucesso
    return res.status(200).json({ message: 'Upload e parsing concluídos' })
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
