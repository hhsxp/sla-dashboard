import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File as FormidableFile } from 'formidable';
import ExcelJS from 'exceljs';

export const config = {
  api: { bodyParser: false }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const form = new formidable.IncomingForm();
  const parseForm = () =>
    new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) =>
          err ? reject(err) : resolve({ fields, files })
        );
      }
    );

  try {
    const { fields, files } = await parseForm();
    const file = files.file as FormidableFile;

    if (!file.filepath) {
      throw new Error('Arquivo não recebido corretamente.');
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.filepath);

    // .... resto do parsing das sheets
    res.status(200).json({ message: 'Upload realizado com sucesso' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
