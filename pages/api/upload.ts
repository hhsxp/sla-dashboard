import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File as FormidableFile } from 'formidable-serverless';
import ExcelJS from 'exceljs';

export const config = {
  api: {
    bodyParser: false
  }
};

type Ticket = {
  TipoItem: string;
  Chave: string;
  Resumo: string;
  Projeto: string;
  UnidadeNegocio: string;
  Prioridade: string;
  Criado: Date;
  Atualizado: Date;
  Resolvido: string;
  TempoPR: number;
  TempoRES: number;
  HorasPR: number;
  FlagPR: boolean;
  HorasRES: number;
  FlagRES: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Ticket[] | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const form = new IncomingForm();
  // força para usar uploadDir temporário
  form.uploadDir = './tmp';
  form.keepExtensions = true;

  // Parse da requisição
  const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
    form.parse(req, (err, flds, fls) => {
      if (err) reject(err);
      else resolve([flds, fls]);
    });
  });

  const file = (files.file as FormidableFile) ?? (files.upload as FormidableFile);
  if (!file || !file.filepath) {
    return res.status(400).json({ error: 'Arquivo não recebido corretamente.' });
  }

  // Leitura do Excel
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(file.filepath);

  // Pega a aba "Tickets"
  const sheet = workbook.getWorksheet('Tickets');
  if (!sheet) {
    return res.status(400).json({ error: 'Aba "Tickets" não encontrada.' });
  }

  const tickets: Ticket[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // pula cabeçalho

    // Monta o objeto Ticket a partir das colunas (ajuste índices se necessário)
    const t: Ticket = {
      TipoItem: String(row.getCell(1).value ?? ''),
      Chave: String(row.getCell(2).value ?? ''),
      Resumo: String(row.getCell(3).value ?? ''),
      Projeto: String(row.getCell(4).value ?? ''),
      UnidadeNegocio: String(row.getCell(5).value ?? ''),
      Prioridade: String(row.getCell(6).value ?? ''),
      Criado: row.getCell(7).value instanceof Date
        ? row.getCell(7).value
        : new Date(String(row.getCell(7).value)),
      Atualizado: row.getCell(8).value instanceof Date
        ? row.getCell(8).value
        : new Date(String(row.getCell(8).value)),
      Resolvido: String(row.getCell(9).value ?? ''),
      TempoPR: Number(row.getCell(10).value ?? 0),
      TempoRES: Number(row.getCell(11).value ?? 0),
      HorasPR: Number(row.getCell(12).value ?? 0),
      FlagPR: Boolean(row.getCell(13).value),
      HorasRES: Number(row.getCell(14).value ?? 0),
      FlagRES: Boolean(row.getCell(15).value)
    };

    tickets.push(t);
  });

  return res.status(200).json(tickets);
}
