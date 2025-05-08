// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { File as FormidableFile } from 'formidable'
import ExcelJS from 'exceljs'

export const config = {
  api: {
    bodyParser: false,
  },
}

interface FormidableFiles {
  /** nome do campo `file` no multipart/form-data */
  file: FormidableFile
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  // 1) Parse do form-data via formidable
  const form = new formidable.IncomingForm()
  const { files } = await new Promise<{ files: FormidableFiles }>(
    (resolve, reject) =>
      form.parse(req, (err, _fields, files) =>
        err ? reject(err) : resolve({ files: files as FormidableFiles })
      )
  )

  // 2) Pega o arquivo enviado (FormidableFile)
  const uploaded = files.file

  // 3) Lê o Excel a partir do caminho no servidor
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(uploaded.filepath)

  // 4) Parse da aba "Tickets"
  const ticketsSheet = workbook.getWorksheet('Tickets')
  const tickets: Array<Partial<Record<string, any>>> = []
  ticketsSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    tickets.push({
      Tipo: row.getCell(1).value,
      Chave: row.getCell(2).value,
      // ... siga seu mapeamento conforme antes
    })
  })

  // 5) Parse de outras abas (exemplo "Base")
  const baseSheet = workbook.getWorksheet('Base')
  const baseData: Array<Partial<Record<string, any>>> = []
  baseSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    baseData.push({
      Chave: row.getCell(2).value,
      // ... etc
    })
  })

  // 6) Merge dos dois arrays
  const allData = tickets.map(t => ({
    ...t,
    ...(baseData.find(b => b.Chave === t.Chave) || {}),
  }))

  // 7) Retorna o JSON processado
  return res.status(200).json({ count: allData.length, data: allData })
}
