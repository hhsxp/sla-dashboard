import React from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import localforage from 'localforage';

interface UploadProps {
  onComplete: (versionKey: string) => void;
}

export function UploadDropzone({ onComplete }: UploadProps) {
  const onDrop = async (files: File[]) => {
    const file = files[0];
    const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const allData: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    const key = `v${Date.now()}`;
    await localforage.setItem(key, allData);
    onComplete(key);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-gray-600 p-10 text-center cursor-pointer"
    >
      <input {...getInputProps()} />
      <p className="text-gray-400">
        {isDragActive
          ? 'Solte o .xlsx aqui…'
          : 'Arraste ou clique para enviar sua planilha SLA (.xlsx)'}
      </p>
    </div>
  );
}
