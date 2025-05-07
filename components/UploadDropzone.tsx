// components/UploadDropzone.tsx
import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import localforage from 'localforage'
import ExcelJS from 'exceljs'

interface UploadDropzoneProps {
  /** Recebe a key da nova versão, ex: "v1612345678901" */
  onComplete: (newVersionKey: string) => void
}

export function UploadDropzone({ onComplete }: UploadDropzoneProps) {
  const onDrop = useCallback(async (files: File[]) => {
    try {
      const file = files[0]

      // 1) Ler o arquivo como ArrayBuffer
      const buffer: ArrayBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as ArrayBuffer)
        reader.onerror = () => reject(reader.error)
        reader.readAsArrayBuffer(file)
      })

      // 2) Carregar com ExcelJS
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(buffer)

      // 3) Extrair Sheets
      const ticketsSheet = workbook.getWorksheet('Tickets')
      const baseSheet    = workbook.getWorksheet('Base')   // ou 'Worksheet', conforme sua planilha

      // 4) Parse de Tickets
      const tickets: any[] = []
      ticketsSheet.eachRow((row, rowIndex) => {
        if (rowIndex === 1) return  // pula cabeçalho
        tickets.push({
          Tipo:            String(row.getCell(1).value || ''),
          Chave:           String(row.getCell(2).value || ''),
          Resumo:          String(row.getCell(3).value || ''),
          Projeto:         String(row.getCell(4).value || ''),
          Unidade:         String(row.getCell(5).value || ''),
          Status:          String(row.getCell(6).value || ''),
          Relator:         String(row.getCell(7).value || ''),
          Prioridade:      String(row.getCell(8).value || ''),
          Atualizado:      (row.getCell(9).value as Date)?.toISOString() || '',
          Criado:          (row.getCell(10).value as Date)?.toISOString() || '',
          Responsavel:     String(row.getCell(11).value || ''),
          Tempo1aResp:     Number(row.getCell(12).value) || 0,
          TempoResolucao:  Number(row.getCell(13).value) || 0,
          SLA_Horas:       Number(row.getCell(14).value) || 0,
          CumpriuPR:       String(row.getCell(15).value || '').toLowerCase() === 'atingido',
        })
      })

      // 5) Parse de dados adicionais (Base)
      const baseData: any[] = []
      baseSheet.eachRow((row, rowIndex) => {
        if (rowIndex === 1) return
        baseData.push({
          Chave:      String(row.getCell(2).value || ''),
          Horas_PR:   Number(row.getCell(6).value) || 0,
          Flag_PR:    String(row.getCell(7).value || ''),
          Horas_RES:  Number(row.getCell(8).value) || 0,
          Flag_RES:   String(row.getCell(9).value || ''),
        })
      })

      // 6) Fazer merge pelo campo "Chave"
      const allData = tickets.map(t => ({
        ...t,
        ...(baseData.find(b => b.Chave === t.Chave) || {}),
      }))

      // 7) Gravar no localforage e notificar callback
      const versionKey = `v${Date.now()}`
      await localforage.setItem(versionKey, allData)
      onComplete(versionKey)

    } catch (err: any) {
      console.error(err)
      alert('Erro ao processar o arquivo: ' + (err.message || err))
    }
  }, [onComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
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
          ? '⤵️ Solte o .xlsx aqui…'
          : '⬆️ Arraste ou clique para enviar sua planilha SLA (.xlsx)'}
      </p>
    </div>
  )
}
