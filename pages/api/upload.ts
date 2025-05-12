// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File as FormidableFile } from 'formidable';
import ExcelJS from 'exceljs';
import { promisify } from 'util';

export const config = {
  api: {
    bodyParser: false,
  },
};

type Ticket = {
  TipoItem: string;
  Chave: string;
  Resumo: string;
  Projeto: string;
  UnidadeNegocio: string;
  Prioridade: string;
  Criado: string;
  Atualizado: string;
  Resolvido: string;
  TempoPR: number;
  TempoRES: number;
  HorasPR: number;
  FlagPR: boolean;
  HorasRES: number;
  FlagRES: boolean;
};

type BaseInfo = {
  Projeto: string;
  UnidadeNegocio: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Ticket[] | { error: string }>
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' });
    return;
  }

  try {
    // 1) parse multipart-form
    const form = new IncomingForm();
    const parseForm = promisify(form.parse.bind(form));
    const { files } = (await parseForm(req)) as {
      fields: any;
      files: Record<string, FormidableFile>;
    };

    const file = files.file;
    if (!file || !file.filepath) {
      res.status(400).json({ error: 'Não recebi o arquivo corretamente.' });
      return;
    }

    // 2) abre o workbook
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.filepath);

    // loga pra você ver no console as abas existentes
    console.log('Sheets disponíveis:', workbook.worksheets.map(w => w.name));

    // 3) encontra as abas “Base” e “Tickets” (ou algo parecido)
    const baseSheet =
      workbook.getWorksheet('Base') ||
      workbook.worksheets.find(w =>
        w.name.toLowerCase().includes('base')
      );
    const ticketsSheet =
      workbook.getWorksheet('Tickets') ||
      workbook.worksheets.find(w =>
        w.name.toLowerCase().includes('ticket')
      );

    if (!baseSheet || !ticketsSheet) {
      res
        .status(400)
        .json({ error: 'Não encontrei as abas "Base" ou "Tickets".' });
      return;
    }

    // 4) monta um mapa chave → { Projeto, UnidadeNegocio }
    const baseMap: Record<string, BaseInfo> = {};
    baseSheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return; // pula header
      const vals = row.values as any[];
      const chave = String(vals[2] || '').trim();      // Coluna B
      const unidade = String(vals[3] || '').trim();   // Coluna C
      const projeto = String(vals[1] || '').trim();   // Coluna A, se existir
      if (chave) {
        baseMap[chave] = { Projeto: projeto, UnidadeNegocio: unidade };
      }
    });

    // 5) parseia os tickets cruzando com baseMap
    const tickets: Ticket[] = [];
    ticketsSheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return; // pula header
      const vals = row.values as any[];
      const chave = String(vals[2] || '').trim(); // Coluna B
      if (!chave) return; // ignora linhas sem chave

      const base = baseMap[chave] || { Projeto: '', UnidadeNegocio: '' };
      tickets.push({
        TipoItem: String(vals[1] || '').trim(),       // Coluna A
        Chave: chave,
        Resumo: String(vals[3] || '').trim(),         // Coluna C
        Projeto: base.Projeto,
        UnidadeNegocio: base.UnidadeNegocio,
        Prioridade: String(vals[4] || '').trim(),     // Coluna D
        Criado: new Date(vals[5] || '').toISOString(),// Coluna E
        Atualizado: new Date(vals[6] || '').toISOString(),
        Resolvido: new Date(vals[7] || '').toISOString(),
        TempoPR: Number(vals[8] || 0),
        TempoRES: Number(vals[9] || 0),
        HorasPR: Number(vals[10] || 0),
        FlagPR: Boolean(vals[11]),
        HorasRES: Number(vals[12] || 0),
        FlagRES: Boolean(vals[13]),
      });
    });

    res.status(200).json(tickets);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
