import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import ExcelJS from 'exceljs';

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  // 1) parse FormData
  const form = new formidable.IncomingForm();
  const { files } = await new Promise<any>((resolve, reject) =>
    form.parse(req, (err, _fields, files) => err ? reject(err) : resolve({ files }))
  );

  // 2) carrega workbook
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile((files.file as any).filepath);

  // 3) parse 'Tickets'
  const ticketsSheet = workbook.getWorksheet('Tickets');
  const tickets: any[] = [];
  ticketsSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // pula cabeçalho
    const [
      tipo, chave, resumo, projeto, tribo, status, relator, prioridade,
      atualizado, criado, responsavel,
      tempoPR, tempoRES, sla, flagPR
    ] = row.values.slice(1); 
    tickets.push({
      Tipo: tipo,
      Chave: chave,
      Resumo: resumo,
      Projeto: projeto,
      Tribo: tribo,
      Status: status,
      Relator: relator,
      Prioridade: prioridade,
      Criado: new Date(criado),
      TempoResposta: Number(tempoPR),
      TempoResolucao: Number(tempoRES),
      SLA_Horas: Number(sla),
      CumpriuPR: flagPR === 'Atingido',
      // ...outros campos de SLA
    });
  });

  // 4) parse 'Base'
  const baseSheet = workbook.getWorksheet('Base');
  const base: any[] = [];
  baseSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const [
      tipo, chave, resumo, projeto, tribo,
      pr, res, horasPR, flagPR, horasRES, flagRES
    ] = row.values.slice(1);
    base.push({
      Tipo: tipo,
      Chave: chave,
      Projeto: projeto,
      Tribo: tribo,
      Horas_PR: Number(horasPR),
      Flag_PR: flagPR,
      Horas_RES: Number(horasRES),
      Flag_RES: flagRES,
      // …qualquer outro campo da “Base”
    });
  });

  // 5) junte tudo num único dataset
  const allData = tickets.map(t => ({
    ...t,
    // tenta achar a linha correspondente na base (mesma chave)
    ...(base.find(b => b.Chave === t.Chave) || {})
  }));

  // 6) salve no client-side (localforage/indexedDB) ou no Supabase
  // ex: await localforage.setItem(`v${Date.now()}`, allData);

  return res.status(200).json({ message: 'Upload OK', count: allData.length });
}
