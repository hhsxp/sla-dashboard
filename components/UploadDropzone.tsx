// components/UploadDropzone.tsx
import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import localforage from 'localforage'

interface UploadDropzoneProps {
  /** Agora recebe a nova versão gerada, ex: "v1612345678901" */
  onComplete: (newVersionKey: string) => void
}

export function UploadDropzone({ onComplete }: UploadDropzoneProps) {
  const onDrop = useCallback(async (files: File[]) => {
    try {
      const file = files[0]
      // ... (mesmo processamento de ExcelJS que você já tinha) ...
      // digamos que chegamos aqui com `allData: any[]` e definimos:
      const key = `v${Date.now()}`  
      await localforage.setItem(key, allData)  
      // **PASSAMOS a key ao callback**:
      onComplete(key)
    } catch (err: any) {
      console.error(err)
      alert('Erro ao processar: ' + (err.message || err))
    }
  }, [onComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
    multiple: false,
  })

  return (
    <div {...getRootProps()} className="border-2 border-white/30 border-dashed bg-gray-900/40 p-8 rounded-lg text-center mx-auto max-w-md">
      <input {...getInputProps()} />
      <p className="text-white/70">
        {isDragActive
          ? '⤵️ Solte o .xlsx aqui…'
          : '⬆️ Arraste ou clique para enviar a planilha SLA (.xlsx)'}
      </p>
    </div>
  )
}
