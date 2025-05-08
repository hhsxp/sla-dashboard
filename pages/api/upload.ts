// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import ExcelJS from 'exceljs';

export const config = {
  api: {
    bodyParser: false, // precisa ser false para upload de binário via formidable
  },
};

interface Ticket {
  TipoItem: string;
  Chave: string;
  Resumo: string;
  Prioridade: string;
  Criado: string;
  Atualizado: string;
  Resolvido: string;
}

interface BaseInfo {
  UnidadeNegocio: string;
  Tribo: string;
  SLA_Horas: number;
  // adicione aqui outras colunas da aba Base que quiser
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    // 1) Parse do form + upload
    const form = new formidable.IncomingForm();
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = files.file as formidable.File;  // seu input name="file"
    if (!file.filepath) throw new Error('Não recebi o arquivo corretamente.');

    // 2) Carrega o workbook
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.filepath);

    // 3) Lê a aba "Base" e monta um map { [Chave]: BaseInfo }
    const baseSheet = workbook.getWorksheet('Base');
    const baseMap: Record<string, BaseInfo> = {};
    baseSheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return; // pula cabeçalho
      const chave = row.getCell(2).text.trim();           // coluna B
      const unidade = row.getCell(3).text.trim();         // coluna C
      const tribo = row.getCell(4).text.trim();           // coluna D
      const slaHoras = parseFloat(row.getCell(5).text);   // coluna E
      baseMap[chave] = {
        UnidadeNegocio: unidade,
        Tribo: tribo,
        SLA_Horas: slaHoras,
      };
    });

    // 4) Lê a aba "Tickets" e faz o merge com baseMap
    const ticketsSheet = workbook.getWorksheet('Tickets');
    const merged: Array<Ticket & BaseInfo> = [];
    ticketsSheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return; // pula cabeçalho
      const ticket: Ticket = {
        TipoItem: row.getCell(1).text,
        Chave: row.getCell(2).text,
        Resumo: row.getCell(3).text,
        Prioridade: row.getCell(4).text,
        Criado: row.getCell(5).text,
        Atualizado: row.getCell(6).text,
        Resolvido: row.getCell(7).text,
      };
      const info = baseMap[ticket.Chave] || {
        UnidadeNegocio: '—',
        Tribo: '—',
        SLA_Horas: 0,
      };
      merged.push({ ...ticket, ...info });
    });

    // 5) Retorna JSON já cruzado
    res.status(200).json(merged);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
