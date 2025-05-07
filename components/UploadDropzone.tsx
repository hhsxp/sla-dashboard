// components/UploadDropzone.tsx
import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import localforage from 'localforage'

interface UploadDropzoneProps {
  /** Chamado quando o upload e o parse terminarem com sucesso */
  onComplete: () => void
}

export function UploadDropzone({ onComplete }: UploadDropzoneProps) {
  const onDrop = useCallback(async (files: File[]) => {
    try {
      const file = files[0]
      const wb = await new Promise<any>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = async () => {
          try {
            const buffer = reader.result
            const workbook = new (await import('exceljs')).Workbook()
            await workbook.xlsx.load(buffer as ArrayBuffer)
            resolve(workbook)
          } catch (e) {
            reject(e)
          }
        }
        reader.onerror = () => reject(reader.error)
        reader.readAsArrayBuffer(file)
      })

      // --- aqui você replica a lógica de parse das folhas (igual ao API) ---
      const ticketsSheet = wb.getWorksheet('Tickets')
      const baseSheet    = wb.getWorksheet('Base')

      const tickets: any[] = []
      ticketsSheet.eachRow((row, idx) => {
        if (idx === 1) return
        tickets.push({
          Tipo: String(row.getCell(1).value),
          Chave: String(row.getCell(2).value),
          Resumo: String(row.getCell(3).value),
          Projeto: String(row.getCell(4).value),
          Unidade: String(row.getCell(5).value),
          Status: String(row.getCell(6).value),
          Relator: String(row.getCell(7).value),
          Prioridade: String(row.getCell(8).value),
          Criado: (row.getCell(10).value as Date)?.toISOString(),
          Atualizado: (row.getCell(9).value as Date)?.toISOString(),
          Responsavel: String(row.getCell(11).value),
          Tempo1aResp: Number(row.getCell(12).value) || 0,
          TempoResolucao: Number(row.getCell(13).value) || 0,
          SLA_Horas: Number(row.getCell(14).value) || 0,
          CumpriuPR: String(row.getCell(15).value).toLowerCase() === 'atingido',
        })
      })

      const base: any[] = []
      baseSheet.eachRow((row, idx) => {
        if (idx === 1) return
        base.push({
          Chave: String(row.getCell(2).value),
          Horas_PR: Number(row.getCell(6).value) || 0,
          Flag_PR: String(row.getCell(7).value),
          Horas_RES: Number(row.getCell(8).value) || 0,
          Flag_RES: String(row.getCell(9).value),
        })
      })

      // merge
      const allData = tickets.map(t => ({
        ...t,
        ...(base.find(b => b.Chave === t.Chave) || {}),
      }))

      // salva no localforage (key = timestamp em ms)
      const key = `v${Date.now()}`
      await localforage.setItem(key, allData)

      // avisa o callback
      onComplete()
    } catch (err: any) {
      console.error(err)
      alert('Erro ao processar o arquivo: ' + (err.message || err))
    }
  }, [onComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
    multiple: false,
  })

  return (
    <div
      {...getRootProps()}
      className="
        border-2 
        border-white/30 
        border-dashed 
        bg-gray-900/40 
        p-8 
        rounded-lg 
        text-center 
        mx-auto 
        max-w-md
      "
    >
      <input {...getInputProps()} />
      <p className="text-white/70">
        {isDragActive
          ? '⤵️ Solte o arquivo aqui para carregar…'
          : '⬆️ Arraste ou clique para enviar sua planilha SLA (.xlsx)'}
      </p>
    </div>
  )
}
